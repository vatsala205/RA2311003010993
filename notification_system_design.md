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
