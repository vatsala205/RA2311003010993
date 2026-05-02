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
3. Review `logging_middleware/config.js` for the saved registration profile and client credentials.

## Auth Flow

- `logging_middleware/auth.js` exposes `getAccessToken()`.
- If `clientID` and `clientSecret` are missing, `registerClient()` calls `POST /register` and persists them in `config.js`.
- `getAccessToken()` then calls `POST /auth`, caches the access token in memory, and refreshes it when needed.
- `logging_middleware/logger.js` calls `getAccessToken()` internally and attaches `Authorization: Bearer <access_token>` automatically.

## Run Commands

```bash
node vehicle_maintenance_scheduler/app.js
node notification_app_be/stage6.js
```

## Module Details

### logging_middleware

- `config.js`: stores `BASE_URL`, registration fields, `clientID`, and `clientSecret`.
- `auth.js`: handles register-once behavior and token retrieval.
- `logger.js`: exports `Log(stack, level, package, message)` with validation and graceful fallback logging.

### vehicle_maintenance_scheduler

- `api.js`: fetches depots and vehicles from protected endpoints.
- `scheduler.js`: solves task selection with bottom-up dynamic programming.
- `app.js`: loops through depots, runs the knapsack solver, logs progress, and prints results.

### notification_app_be

- `stage6.js`: fetches notifications, converts `Timestamp` strings to `Date`, sorts by type weight and recency, and returns the top 10 entries.
