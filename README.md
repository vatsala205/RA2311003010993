# Backend Assignment

This repository contains three modules built against `http://20.207.122.201/evaluation-service` using Node.js and native `fetch`.

## Structure

- `logging_middleware/`: registration, bearer token management, and reusable logging middleware.
- `vehicle_maintenance_scheduler/`: protected API integration plus bottom-up 0/1 knapsack scheduling.
- `notification_app_be/`: notification ranking script for stage 6.
- `notification_system_design.md`: stages 1 to 5 of the notification system design.

## Setup

1. Use Node.js 18 or newer so native `fetch` is available.
2. Open the repository root.
3. Create a `.env` file in the repository root.
4. Add the environment variables shown below.

## Environment Variables

Put these values in `./.env`:

```env
BASE_URL=http://20.207.122.201/evaluation-service
NAME=vatsala singh
EMAIL=vs2077@srmist.edu.in
ROLL_NO=RA2311003010993
MOBILE_NO=9650907487
GITHUB_USERNAME=vatsala205
ACCESS_CODE=<your_access_code>
CLIENT_ID=<your_client_id>
CLIENT_SECRET=<your_client_secret>
```

`CLIENT_ID` and `CLIENT_SECRET` can be left empty before the first registration if you want the app to obtain and persist them automatically.

## Auth Flow

- `logging_middleware/auth.js` exposes `getAccessToken()`.
- `logging_middleware/config.js` loads values from `./.env`.
- If `CLIENT_ID` and `CLIENT_SECRET` are missing, `registerClient()` calls `POST /register` and persists them into `.env`.
- `getAccessToken()` then calls `POST /auth`, caches the access token in memory, and refreshes it when needed.
- `logging_middleware/logger.js` calls `getAccessToken()` internally and attaches `Authorization: Bearer <access_token>` automatically.

## How To Run

```bash
node vehicle_maintenance_scheduler/app.js
node notification_app_be/stage6.js
```

## Screenshot Checklist

Use Postman or Insomnia and capture one screenshot per API showing the request body or headers, the response body, and the response time.

### POST /register

Request body:

```json
{
  "name": "vatsala singh",
  "email": "vs2077@srmist.edu.in",
  "rollNo": "RA2311003010993",
  "mobileNo": "9650907487",
  "githubUsername": "vatsala205",
  "accessCode": "<your_access_code>"
}
```

Measured response time: `0.171948s`

Before sharing the screenshot, redact `clientID` and `clientSecret` from the response.

### POST /auth

Request body:

```json
{
  "name": "vatsala singh",
  "email": "vs2077@srmist.edu.in",
  "rollNo": "RA2311003010993",
  "accessCode": "<your_access_code>",
  "clientID": "<your_client_id>",
  "clientSecret": "<your_client_secret>"
}
```

Measured response time: `0.122288s`

Before sharing the screenshot, redact `access_token` from the response.

### POST /logs

Headers:

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

Request body:

```json
{
  "stack": "backend",
  "level": "info",
  "package": "service",
  "message": "api check"
}
```

Measured response time: `0.128528s`

### GET /depots

Headers:

- `Authorization: Bearer <access_token>`

Measured response time: `0.109642s`

### GET /vehicles

Headers:

- `Authorization: Bearer <access_token>`

Measured response time: `0.127613s`

### GET /notifications

Headers:

- `Authorization: Bearer <access_token>`

Measured response time: `0.120265s`

## Module Details

### logging_middleware

- `config.js`: reads `BASE_URL`, registration fields, `CLIENT_ID`, and `CLIENT_SECRET` from `.env`.
- `auth.js`: handles register-once behavior and token retrieval.
- `logger.js`: exports `Log(stack, level, package, message)` with validation and graceful fallback logging.

### vehicle_maintenance_scheduler

- `api.js`: fetches depots and vehicles from protected endpoints.
- `scheduler.js`: solves task selection with bottom-up dynamic programming.
- `app.js`: loops through depots, runs the knapsack solver, logs progress, and prints results.

### notification_app_be

- `stage6.js`: fetches notifications, converts `Timestamp` strings to `Date`, sorts by type weight and recency, and returns the top 10 entries.
