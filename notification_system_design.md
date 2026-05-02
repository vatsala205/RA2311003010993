# Notification System Design

## Stage 1: API Design

### Common Headers

`Authorization: Bearer <access_token>`

`Content-Type: application/json`

### GET /notifications

Request:

```http
GET /notifications?page=1&limit=20&isRead=false&type=Placement HTTP/1.1
Authorization: Bearer <access_token>
```

Response:

```json
{
  "notifications": [
    {
      "id": "uuid",
      "student_id": "RA2311003010993",
      "type": "Placement",
      "message": "New company shortlist released",
      "is_read": false,
      "created_at": "2026-05-01T18:39:33.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 42
}
```

### POST /notifications

Request:

```json
{
  "student_id": "RA2311003010993",
  "type": "Placement",
  "message": "Interview slot published"
}
```

Response:

```json
{
  "id": "uuid",
  "student_id": "RA2311003010993",
  "type": "Placement",
  "message": "Interview slot published",
  "is_read": false,
  "created_at": "2026-05-01T18:39:33.000Z"
}
```

### PATCH /notifications/:id

Request:

```json
{
  "is_read": true
}
```

Response:

```json
{
  "id": "uuid",
  "updated": true
}
```

### DELETE /notifications/:id

Request:

```http
DELETE /notifications/uuid HTTP/1.1
Authorization: Bearer <access_token>
```

Response:

```json
{
  "id": "uuid",
  "deleted": true
}
```

### Real-Time Strategy

WebSocket is the primary choice because notifications are event-driven and the server can push new items immediately after creation. Polling can be retained as a fallback for clients that cannot keep a socket open, but it adds repeated read load and higher latency compared with server push.

## Stage 2: Database Schema Design

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  type VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The table is centered on fast per-student reads, so `student_id`, `is_read`, and `created_at` should be indexed based on query patterns instead of indexing every column blindly. `type` is useful for filtering and analytics, but it should only be included in indexes when real filters justify it.

For scaling, PostgreSQL read replicas can serve read-heavy inbox queries while the primary handles writes. If the table grows to tens of millions of rows, time-based partitioning on `created_at` keeps recent partitions hot and makes retention cleanup cheaper. If the application becomes multi-tenant at large scale, partitioning by a hash of `student_id` can spread write pressure more evenly.

## Stage 3: Query Optimization

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications (student_id, is_read, created_at DESC);
```

This composite index matches the most common inbox query shape: fetch one student's notifications, usually filtered by read state, ordered by newest first. Indexing every column is a poor choice because each extra index increases write cost, storage, vacuum overhead, and planner complexity. Indexes should reflect real filters and sort patterns rather than theoretical access paths.

Placement notifications from the last 7 days can be fetched with:

```sql
SELECT id, student_id, type, message, is_read, created_at
FROM notifications
WHERE student_id = 'RA2311003010993'
  AND type = 'Placement'
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```
