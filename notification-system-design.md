# Notification System Design

# Stage 1

## Problem Statement

Build a notification platform for a campus evaluation system. Students should be able to receive and manage notifications about:

- **Placements** — job drives, hiring updates, interview schedules
- **Results** — semester results, lab exams, supplementary notifications
- **Events** — tech fests, guest lectures, cultural nights, sports day

The system needs REST APIs to create, read, delete, and manage notification state (read/unread). It should also support filtering by type, priority notifications, and pagination. On top of that, we need a way to push notifications to users in real time.

---

## Notification Schema

Before jumping into APIs, here's what a single notification looks like:

```json
{
  "id": "n1",
  "title": "TCS Placement Drive",
  "message": "TCS is conducting on-campus recruitment on July 5th. Eligible: CSE, ECE, EEE. Min CGPA: 7.0",
  "type": "Placement",
  "priority": "high",
  "read": false,
  "createdAt": "2026-06-18T09:00:00.000Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `title` | string | Short heading |
| `message` | string | Full notification body |
| `type` | string | One of: `Placement`, `Result`, `Event` |
| `priority` | string | `high` or `normal` |
| `read` | boolean | Whether the user has read it |
| `createdAt` | string (ISO 8601) | When the notification was created |

---

## REST API Design

**Base URL:** `http://localhost:3001/api`

All endpoints expect and return `application/json`.

### Common Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes (for POST/PATCH) |
| `Accept` | `application/json` | Optional |

---

### 1. Get All Notifications

Fetches all notifications. Supports pagination.

| | |
|---|---|
| **Endpoint** | `GET /api/notifications` |
| **Method** | GET |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `pageSize` | number | 10 | Items per page |

**Response — 200 OK:**

```json
{
  "notifications": [
    {
      "id": "n1",
      "title": "TCS Placement Drive",
      "message": "TCS is conducting on-campus recruitment on July 5th.",
      "type": "Placement",
      "priority": "high",
      "read": false,
      "createdAt": "2026-06-18T09:00:00.000Z"
    },
    {
      "id": "n2",
      "title": "Semester Results Published",
      "message": "B.Tech 3rd semester results are out. Check the portal.",
      "type": "Result",
      "priority": "normal",
      "read": true,
      "createdAt": "2026-06-17T14:30:00.000Z"
    }
  ],
  "total": 12,
  "page": 1,
  "pageSize": 10,
  "totalPages": 2
}
```

---

### 2. Get Notification By ID

Fetches a single notification by its ID.

| | |
|---|---|
| **Endpoint** | `GET /api/notifications/:id` |
| **Method** | GET |

**Response — 200 OK:**

```json
{
  "id": "n1",
  "title": "TCS Placement Drive",
  "message": "TCS is conducting on-campus recruitment on July 5th.",
  "type": "Placement",
  "priority": "high",
  "read": false,
  "createdAt": "2026-06-18T09:00:00.000Z"
}
```

**Error — 404 Not Found:**

```json
{
  "error": "Notification not found"
}
```

---

### 3. Create Notification

Creates a new notification. This would typically be called by an admin or the system itself.

| | |
|---|---|
| **Endpoint** | `POST /api/notifications` |
| **Method** | POST |

**Request Body:**

```json
{
  "title": "Wipro Hiring Drive",
  "message": "Wipro NLTH registrations open. Apply before June 30th.",
  "type": "Placement",
  "priority": "high"
}
```

**Response — 201 Created:**

```json
{
  "id": "n13",
  "title": "Wipro Hiring Drive",
  "message": "Wipro NLTH registrations open. Apply before June 30th.",
  "type": "Placement",
  "priority": "high",
  "read": false,
  "createdAt": "2026-06-18T12:45:00.000Z"
}
```

**Error — 400 Bad Request:**

```json
{
  "error": "Missing required fields: title, message, type"
}
```

**Validation Rules:**

| Field | Rule |
|-------|------|
| `title` | Required, non-empty string |
| `message` | Required, non-empty string |
| `type` | Required, must be one of `Placement`, `Result`, `Event` |
| `priority` | Optional, defaults to `normal`. Must be `high` or `normal` |

---

### 4. Delete Notification

Removes a notification permanently.

| | |
|---|---|
| **Endpoint** | `DELETE /api/notifications/:id` |
| **Method** | DELETE |

**Response — 200 OK:**

```json
{
  "message": "Notification deleted successfully"
}
```

**Error — 404 Not Found:**

```json
{
  "error": "Notification not found"
}
```

---

### 5. Mark Notification as Read

| | |
|---|---|
| **Endpoint** | `PATCH /api/notifications/:id/read` |
| **Method** | PATCH |

**Response — 200 OK:**

```json
{
  "id": "n1",
  "title": "TCS Placement Drive",
  "message": "TCS is conducting on-campus recruitment on July 5th.",
  "type": "Placement",
  "priority": "high",
  "read": true,
  "createdAt": "2026-06-18T09:00:00.000Z"
}
```

**Error — 404 Not Found:**

```json
{
  "error": "Notification not found"
}
```

---

### 6. Mark Notification as Unread

| | |
|---|---|
| **Endpoint** | `PATCH /api/notifications/:id/unread` |
| **Method** | PATCH |

**Response — 200 OK:**

```json
{
  "id": "n1",
  "title": "TCS Placement Drive",
  "message": "TCS is conducting on-campus recruitment on July 5th.",
  "type": "Placement",
  "priority": "high",
  "read": false,
  "createdAt": "2026-06-18T09:00:00.000Z"
}
```

**Error — 404 Not Found:**

```json
{
  "error": "Notification not found"
}
```

---

### 7. Mark All Notifications as Read

Bulk operation — marks every notification as read in one call.

| | |
|---|---|
| **Endpoint** | `PATCH /api/notifications/read-all` |
| **Method** | PATCH |

**Response — 200 OK:**

```json
{
  "message": "All notifications marked as read",
  "updatedCount": 7
}
```

---

### 8. Get Priority Notifications

Returns only high-priority notifications. Useful for showing urgent items at the top.

| | |
|---|---|
| **Endpoint** | `GET /api/notifications/priority` |
| **Method** | GET |

**Response — 200 OK:**

```json
{
  "notifications": [
    {
      "id": "n1",
      "title": "TCS Placement Drive",
      "message": "TCS is conducting on-campus recruitment on July 5th.",
      "type": "Placement",
      "priority": "high",
      "read": false,
      "createdAt": "2026-06-18T09:00:00.000Z"
    },
    {
      "id": "n5",
      "title": "Mid-Semester Exam Schedule",
      "message": "Mid-semester exams commence from July 10th.",
      "type": "Result",
      "priority": "high",
      "read": false,
      "createdAt": "2026-06-14T08:00:00.000Z"
    }
  ],
  "total": 2
}
```

---

### 9. Filter Notifications by Type

Returns notifications filtered by a specific type.

| | |
|---|---|
| **Endpoint** | `GET /api/notifications?type=Placement` |
| **Method** | GET |

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `type` | string | One of `Placement`, `Result`, `Event` |

**Response — 200 OK:**

```json
{
  "notifications": [
    {
      "id": "n1",
      "title": "TCS Placement Drive",
      "message": "TCS is conducting on-campus recruitment on July 5th.",
      "type": "Placement",
      "priority": "high",
      "read": false,
      "createdAt": "2026-06-18T09:00:00.000Z"
    }
  ],
  "total": 4,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

**Error — 400 Bad Request (invalid type):**

```json
{
  "error": "Invalid type. Must be one of: Placement, Result, Event"
}
```

---

### 10. Pagination

Pagination is built into the `GET /api/notifications` endpoint using `page` and `pageSize` query params.

**Example request:** `GET /api/notifications?page=2&pageSize=5`

**Response — 200 OK:**

```json
{
  "notifications": [
    {
      "id": "n6",
      "title": "Campus Cultural Night",
      "message": "Annual cultural night on June 28th. All students welcome!",
      "type": "Event",
      "priority": "normal",
      "read": false,
      "createdAt": "2026-06-13T16:00:00.000Z"
    }
  ],
  "total": 12,
  "page": 2,
  "pageSize": 5,
  "totalPages": 3
}
```

How pagination works:
- `page` starts from 1
- `total` is the total count of matching items (after filters, before slicing)
- `totalPages` = `Math.ceil(total / pageSize)`
- If `page` exceeds `totalPages`, return empty `notifications` array

---

## API Summary Table

| # | Action | Method | Endpoint | Status Codes |
|---|--------|--------|----------|-------------|
| 1 | Get all notifications | GET | `/api/notifications` | 200 |
| 2 | Get notification by ID | GET | `/api/notifications/:id` | 200, 404 |
| 3 | Create notification | POST | `/api/notifications` | 201, 400 |
| 4 | Delete notification | DELETE | `/api/notifications/:id` | 200, 404 |
| 5 | Mark as read | PATCH | `/api/notifications/:id/read` | 200, 404 |
| 6 | Mark as unread | PATCH | `/api/notifications/:id/unread` | 200, 404 |
| 7 | Mark all as read | PATCH | `/api/notifications/read-all` | 200 |
| 8 | Get priority notifications | GET | `/api/notifications/priority` | 200 |
| 9 | Filter by type | GET | `/api/notifications?type=Placement` | 200, 400 |
| 10 | Pagination | GET | `/api/notifications?page=1&pageSize=10` | 200 |

---

## Common Error Responses

All error responses follow a consistent format:

```json
{
  "error": "Description of what went wrong"
}
```

| Status Code | Meaning | When |
|-------------|---------|------|
| 200 | OK | Successful read/update/delete |
| 201 | Created | Notification created successfully |
| 400 | Bad Request | Missing fields, invalid type |
| 404 | Not Found | Notification ID doesn't exist |
| 500 | Internal Server Error | Something unexpected broke |

---

## Real-Time Notifications — Server-Sent Events (SSE)

### Why SSE over WebSocket?

I went with **Server-Sent Events (SSE)** because:

| Factor | SSE | WebSocket |
|--------|-----|-----------|
| Direction | Server → Client (one-way) | Bidirectional |
| Complexity | Simple, uses HTTP | Separate protocol, needs upgrade |
| Browser support | Built-in `EventSource` API | Needs manual handling |
| Reconnection | Automatic | Manual |
| Our use case | We only need to push notifications to students | Students don't send messages back through this channel |

For a notification system, the communication is almost entirely one-way — the server tells the client "hey, there's a new notification." The client doesn't need to stream data back. SSE is perfect for this and way simpler to implement than WebSocket.

### How It Works

**Endpoint:** `GET /api/notifications/stream`

This endpoint keeps an HTTP connection open and pushes new notifications to the client as they happen.

**Server side (Express):**

```js
app.get("/api/notifications/stream", (req, res) => {
  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send a comment to keep connection alive
  const keepAlive = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 30000);

  // When a new notification is created, push it
  const onNewNotification = (notification) => {
    res.write(`data: ${JSON.stringify(notification)}\n\n`);
  };

  // Register this client
  notificationEmitter.on("new", onNewNotification);

  // Cleanup when client disconnects
  req.on("close", () => {
    clearInterval(keepAlive);
    notificationEmitter.off("new", onNewNotification);
  });
});
```

**Client side (React):**

```js
useEffect(() => {
  const eventSource = new EventSource("/api/notifications/stream");

  eventSource.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    // Add to state, show toast, update badge count, etc.
    setNotifications((prev) => [notification, ...prev]);
  };

  eventSource.onerror = () => {
    // EventSource will auto-reconnect
    console.log("SSE connection lost, reconnecting...");
  };

  return () => eventSource.close();
}, []);
```

### Communication Flow

```
Client                          Server
  |                               |
  |  GET /api/notifications/stream |
  |------------------------------>|
  |                               |
  |  HTTP 200 (keep-alive)        |
  |<------------------------------|
  |                               |
  |     ... connection stays open ...
  |                               |
  |                    [Admin creates notification]
  |                               |
  |  data: {"id":"n13",...}       |
  |<------------------------------|
  |                               |
  |                    [Another notification]
  |                               |
  |  data: {"id":"n14",...}       |
  |<------------------------------|
  |                               |
  |  [User closes tab]           |
  |------X                        |
  |                    [Server cleans up]
```

### Advantages of This Approach

- **Dead simple** — no external libraries needed on the client side, just `EventSource`
- **Auto-reconnect** — if the connection drops, the browser reconnects automatically
- **HTTP-friendly** — works through proxies, load balancers, and firewalls without special config
- **Lightweight** — no handshake overhead like WebSocket, just a regular HTTP response that stays open
- **Good enough for our scale** — a campus notification system doesn't need bidirectional real-time communication

### When Would I Switch to WebSocket?

If the requirements changed and students needed to do things like:
- Send real-time replies or reactions to notifications
- Have a live chat feature
- Collaborate in real-time on something

Then WebSocket would make more sense because we'd need two-way communication. But for "server pushes notifications to client," SSE is the right tool.

---

