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

# Stage 2

## Context

The APIs from Stage 1 work, but right now all data lives in memory — restart the server and everything's gone. We need a real database to persist notifications, track which students have read what, and handle filtering and pagination efficiently.

---

## Database Choice

### Selected: PostgreSQL

I'm going with **PostgreSQL** (a relational database) for this project.

### Why PostgreSQL?

| Reason | Explanation |
|--------|-------------|
| **Structured data** | Notifications have a fixed shape — id, title, message, type, priority, timestamps. This maps perfectly to table columns |
| **Relationships** | We need to track which student read which notification. That's a classic many-to-many relationship, and relational DBs handle this naturally with a join table |
| **Filtering and sorting** | SQL makes it dead simple to filter by type, sort by date, paginate with OFFSET/LIMIT |
| **ACID compliance** | When we mark all notifications as read, we want that to either fully succeed or fully fail — not partially update |
| **Free and widely used** | PostgreSQL is open source, well-documented, and something I've used in college projects before |

### Why not MongoDB?

MongoDB would work too, honestly. But since our data has a clear structure and we need relational queries (student ↔ notification read status), a relational DB feels more natural here. If notifications had wildly different shapes per type, MongoDB's flexible schema would be more useful. But ours don't — every notification has the same fields.

---

## Tables / Collections

### Table 1: `students`

Stores basic student information. In a real campus system this would connect to the university's student database, but for our purposes we keep it simple.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique student ID |
| `name` | VARCHAR(100) | NOT NULL | Student's full name |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | College email |
| `roll_number` | VARCHAR(20) | NOT NULL, UNIQUE | University roll number |
| `branch` | VARCHAR(50) | NOT NULL | Department — CSE, ECE, EEE, etc. |
| `year` | INT | NOT NULL, CHECK (year BETWEEN 1 AND 4) | Current year of study |
| `created_at` | TIMESTAMP | DEFAULT NOW() | When the student registered |

```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    roll_number VARCHAR(20) NOT NULL UNIQUE,
    branch VARCHAR(50) NOT NULL,
    year INT NOT NULL CHECK (year BETWEEN 1 AND 4),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Table 2: `notifications`

Stores all notifications. One notification can be sent to many students.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique notification ID |
| `title` | VARCHAR(200) | NOT NULL | Notification heading |
| `message` | TEXT | NOT NULL | Full notification body |
| `type` | VARCHAR(20) | NOT NULL, CHECK (type IN ('Placement', 'Result', 'Event')) | Category |
| `priority` | VARCHAR(10) | DEFAULT 'normal', CHECK (priority IN ('high', 'normal')) | Urgency level |
| `created_at` | TIMESTAMP | DEFAULT NOW() | When it was created |

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Placement', 'Result', 'Event')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('high', 'normal')),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Table 3: `notification_status`

This is the **join table** that tracks whether a specific student has read a specific notification. This is how we handle the read/unread state per student.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Row ID |
| `student_id` | UUID | NOT NULL, FOREIGN KEY → students(id) | Which student |
| `notification_id` | UUID | NOT NULL, FOREIGN KEY → notifications(id) ON DELETE CASCADE | Which notification |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read or unread |
| `read_at` | TIMESTAMP | NULL | When it was marked as read |

```sql
CREATE TABLE notification_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    UNIQUE(student_id, notification_id)
);
```

The `UNIQUE(student_id, notification_id)` constraint makes sure we don't accidentally create duplicate status rows for the same student-notification pair.

---

## Entity Relationships

```
┌──────────────┐         ┌─────────────────────┐         ┌──────────────────┐
│   students   │         │ notification_status  │         │  notifications   │
│──────────────│         │─────────────────────│         │──────────────────│
│ id (PK)      │───┐     │ id (PK)             │     ┌───│ id (PK)          │
│ name         │   │     │ student_id (FK) ─────│─────┘   │ title            │
│ email        │   └─────│ notification_id (FK) │         │ message          │
│ roll_number  │         │ is_read              │         │ type             │
│ branch       │         │ read_at              │         │ priority         │
│ year         │         └─────────────────────┘         │ created_at       │
│ created_at   │                                          └──────────────────┘
└──────────────┘

Relationship: Many-to-Many
- One student can have many notification statuses
- One notification can have many student statuses
- notification_status is the join table
```

### How it works:

1. **When a notification is created** → a row goes into `notifications`
2. **When it's sent to students** → one row per student goes into `notification_status` with `is_read = false`
3. **When a student reads it** → we update `is_read = true` and set `read_at` to the current time
4. **When a notification is deleted** → `ON DELETE CASCADE` removes all related `notification_status` rows automatically

---

## Sample Data

### students

| id | name | email | roll_number | branch | year |
|----|------|-------|-------------|--------|------|
| s1 | Sarayu Burugu | sarayu@college.edu | 2303A51842 | CSE | 3 |
| s2 | Rahul Sharma | rahul@college.edu | 2303A51201 | ECE | 3 |
| s3 | Priya Reddy | priya@college.edu | 2303A51505 | CSE | 2 |

### notifications

| id | title | message | type | priority | created_at |
|----|-------|---------|------|----------|------------|
| n1 | TCS Placement Drive | TCS is conducting on-campus recruitment on July 5th. Min CGPA: 7.0 | Placement | high | 2026-06-18 09:00 |
| n2 | Semester Results Published | B.Tech 3rd semester results are out. Check the portal. | Result | normal | 2026-06-17 14:30 |
| n3 | Annual Tech Fest | Register for Innovision 2026! Hackathon, paper presentations, coding contests. | Event | normal | 2026-06-16 10:00 |
| n4 | Infosys InfyTQ Results | InfyTQ certification results are out. Passed students shortlisted for interview. | Placement | high | 2026-06-15 11:00 |
| n5 | Mid-Semester Exam Schedule | Mid-semester exams for all branches commence from July 10th. | Result | high | 2026-06-14 08:00 |

### notification_status

| id | student_id | notification_id | is_read | read_at |
|----|-----------|----------------|---------|---------|
| ns1 | s1 | n1 | false | null |
| ns2 | s1 | n2 | true | 2026-06-17 15:00 |
| ns3 | s1 | n3 | true | 2026-06-16 12:00 |
| ns4 | s1 | n4 | false | null |
| ns5 | s1 | n5 | false | null |
| ns6 | s2 | n1 | true | 2026-06-18 10:00 |
| ns7 | s2 | n2 | false | null |
| ns8 | s3 | n3 | false | null |

---

## Queries

These map directly to the Stage 1 APIs. I'm using parameterized queries (with `$1`, `$2`, etc.) since that's how you'd write them in actual backend code to prevent SQL injection.

### 1. Get all notifications of a student

```sql
SELECT n.id, n.title, n.message, n.type, n.priority, n.created_at,
       ns.is_read, ns.read_at
FROM notifications n
JOIN notification_status ns ON n.id = ns.notification_id
WHERE ns.student_id = $1
ORDER BY n.created_at DESC;
```

### 2. Get unread notifications

```sql
SELECT n.id, n.title, n.message, n.type, n.priority, n.created_at
FROM notifications n
JOIN notification_status ns ON n.id = ns.notification_id
WHERE ns.student_id = $1 AND ns.is_read = FALSE
ORDER BY n.created_at DESC;
```

### 3. Mark notification as read

```sql
UPDATE notification_status
SET is_read = TRUE, read_at = NOW()
WHERE student_id = $1 AND notification_id = $2;
```

### 4. Mark notification as unread

```sql
UPDATE notification_status
SET is_read = FALSE, read_at = NULL
WHERE student_id = $1 AND notification_id = $2;
```

### 5. Mark all notifications as read

```sql
UPDATE notification_status
SET is_read = TRUE, read_at = NOW()
WHERE student_id = $1 AND is_read = FALSE;
```

This returns the number of affected rows, which we send back as `updatedCount` in the API response.

### 6. Filter notifications by type

```sql
SELECT n.id, n.title, n.message, n.type, n.priority, n.created_at,
       ns.is_read, ns.read_at
FROM notifications n
JOIN notification_status ns ON n.id = ns.notification_id
WHERE ns.student_id = $1 AND n.type = $2
ORDER BY n.created_at DESC;
```

### 7. Get latest notifications (most recent first)

```sql
SELECT n.id, n.title, n.message, n.type, n.priority, n.created_at,
       ns.is_read, ns.read_at
FROM notifications n
JOIN notification_status ns ON n.id = ns.notification_id
WHERE ns.student_id = $1
ORDER BY n.created_at DESC
LIMIT 10;
```

### 8. Get priority notifications

```sql
SELECT n.id, n.title, n.message, n.type, n.priority, n.created_at,
       ns.is_read, ns.read_at
FROM notifications n
JOIN notification_status ns ON n.id = ns.notification_id
WHERE ns.student_id = $1 AND n.priority = 'high'
ORDER BY n.created_at DESC;
```

### 9. Pagination

```sql
-- Get total count first (for totalPages calculation)
SELECT COUNT(*) AS total
FROM notifications n
JOIN notification_status ns ON n.id = ns.notification_id
WHERE ns.student_id = $1;

-- Then get the page
SELECT n.id, n.title, n.message, n.type, n.priority, n.created_at,
       ns.is_read, ns.read_at
FROM notifications n
JOIN notification_status ns ON n.id = ns.notification_id
WHERE ns.student_id = $1
ORDER BY n.created_at DESC
LIMIT $2 OFFSET $3;
```

Where:
- `$2` = `pageSize` (e.g., 10)
- `$3` = `(page - 1) * pageSize` (e.g., for page 2 with pageSize 10 → OFFSET 10)

### 10. Combined: Filter by type + Pagination

```sql
SELECT COUNT(*) AS total
FROM notifications n
JOIN notification_status ns ON n.id = ns.notification_id
WHERE ns.student_id = $1 AND n.type = $2;

SELECT n.id, n.title, n.message, n.type, n.priority, n.created_at,
       ns.is_read, ns.read_at
FROM notifications n
JOIN notification_status ns ON n.id = ns.notification_id
WHERE ns.student_id = $1 AND n.type = $2
ORDER BY n.created_at DESC
LIMIT $3 OFFSET $4;
```

---

## Scaling Considerations

For a campus with a few thousand students, the setup above will work just fine. But if we think about what happens when the system grows, here are the practical problems and how to handle them.

### Problem 1: Queries getting slow

As the `notification_status` table grows (students × notifications), JOINs will slow down.

**Solution: Indexing**

Add indexes on columns we filter and sort by frequently:

```sql
-- Speed up lookups by student
CREATE INDEX idx_ns_student_id ON notification_status(student_id);

-- Speed up filtering by read status for a student
CREATE INDEX idx_ns_student_read ON notification_status(student_id, is_read);

-- Speed up filtering notifications by type
CREATE INDEX idx_notifications_type ON notifications(type);

-- Speed up sorting by creation date
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Speed up priority queries
CREATE INDEX idx_notifications_priority ON notifications(priority);
```

These indexes cover all the WHERE and ORDER BY clauses in our queries above.

### Problem 2: Too many notifications piling up

If the system runs for years, old notifications pile up. A student doesn't care about a placement drive from 2 years ago.

**Solution: Archiving old notifications**

Move old notifications to an archive table on a schedule:

```sql
-- Archive notifications older than 6 months
INSERT INTO notifications_archive
SELECT * FROM notifications
WHERE created_at < NOW() - INTERVAL '6 months';

-- Clean up
DELETE FROM notifications
WHERE created_at < NOW() - INTERVAL '6 months';
```

We could run this as a monthly cron job. Old data is still available in the archive if someone needs it, but the main table stays lean.

### Problem 3: notification_status table exploding

If we have 5,000 students and 1,000 notifications, that's 5 million rows in `notification_status`. Over time this gets heavy.

**Solution: Database partitioning**

Partition `notification_status` by `student_id` ranges:

```sql
CREATE TABLE notification_status (
    id UUID DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    notification_id UUID NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP
) PARTITION BY HASH(student_id);

CREATE TABLE notification_status_p0 PARTITION OF notification_status
    FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE notification_status_p1 PARTITION OF notification_status
    FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE notification_status_p2 PARTITION OF notification_status
    FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE notification_status_p3 PARTITION OF notification_status
    FOR VALUES WITH (MODULUS 4, REMAINDER 3);
```

This splits the data across 4 partitions. Queries for a specific student only scan one partition instead of the full table.

### Problem 4: Same queries hitting the database repeatedly

Multiple students viewing the same notification list generates identical queries.

**Solution: Caching with Redis**

Cache frequently accessed data:

```
Key: notifications:latest       → cached list of latest 20 notifications (TTL: 60s)
Key: notifications:priority     → cached high-priority notifications (TTL: 60s)
Key: student:{id}:unread_count  → cached unread count per student (TTL: 30s)
```

Invalidate the cache whenever a new notification is created or a student marks something as read. For a campus system, even a simple in-memory cache (like `node-cache`) would work. Redis is for when multiple server instances need to share the cache.

### Problem 5: Pagination with OFFSET is slow on large tables

`OFFSET 10000` means the database has to scan and skip 10,000 rows before returning results.

**Solution: Cursor-based pagination**

Instead of OFFSET, use the last seen `created_at` value:

```sql
-- First page
SELECT n.*, ns.is_read, ns.read_at
FROM notifications n
JOIN notification_status ns ON n.id = ns.notification_id
WHERE ns.student_id = $1
ORDER BY n.created_at DESC
LIMIT 10;

-- Next page (pass the created_at of the last item from previous page)
SELECT n.*, ns.is_read, ns.read_at
FROM notifications n
JOIN notification_status ns ON n.id = ns.notification_id
WHERE ns.student_id = $1 AND n.created_at < $2
ORDER BY n.created_at DESC
LIMIT 10;
```

This is much faster because the database can use the index on `created_at` directly instead of counting rows to skip. The tradeoff is you can't jump to "page 5" directly — you have to go forward sequentially. For a notification feed though, that's totally fine since users naturally scroll down.

### Summary

| Problem | Solution | When to use |
|---------|----------|-------------|
| Slow queries | Indexes | Always — do this from day one |
| Old data piling up | Archiving | When notifications are > 6 months old |
| Giant join table | Partitioning | When notification_status > 1M rows |
| Repeated queries | Caching (Redis) | When you notice DB load increasing |
| Slow pagination | Cursor-based pagination | When OFFSET values get large |

For our campus project right now, **indexes + archiving** are the only things we'd actually need. The rest is good to know for when the system scales, but we shouldn't over-engineer from day one.

---

# Stage 3

## Context

Our notification system has grown. We're now dealing with:

- **50,000 students**
- **5,000,000 notifications**

The database is PostgreSQL (relational), and we need to analyze whether our queries can handle this scale.

Here's the query we need to analyze:

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

---

## Query Analysis

### Is this query logically correct?

Yes and no. The **intent** is correct — we want to get all unread notifications for a specific student, sorted by oldest first. But there are a couple of things to note about the schema:

1. If we're using the schema from Stage 2 (separate `notification_status` table), then `studentID` and `isRead` don't live in the `notifications` table directly. They live in `notification_status`. So this query assumes a **flat table** design where each notification row already has `studentID` and `isRead` baked in.

2. If we're using a flat table design (which is simpler and what this query assumes), then yes, the query is logically correct. It filters by student, filters by read status, and sorts chronologically.

For this analysis, I'll assume we're working with a flat table where each row represents one notification for one student.

### Why can it become slow at large scale?

With 5 million rows, this query could be painfully slow because:

| Problem | Why it hurts |
|---------|-------------|
| **No index on `studentID`** | Database has to check every single row to find ones where `studentID = 1042` |
| **No index on `isRead`** | Even after finding the student's rows, it scans all of them to check `isRead = false` |
| **Sorting without index** | `ORDER BY createdAt ASC` requires loading matching rows into memory and sorting them |
| **`SELECT *`** | Fetches all columns, even ones we might not need, which means more data to read from disk |

### What happens internally?

Here's what the database does step by step when there are **no indexes**:

```
Step 1: Full Table Scan
        → Read all 5,000,000 rows one by one
        → Check: is studentID = 1042? → keep or discard
        → Check: is isRead = false? → keep or discard

Step 2: Sort
        → Take all matching rows (could be hundreds)
        → Sort them by createdAt in ascending order
        → This happens in memory (or spills to disk if too large)

Step 3: Return
        → Send the sorted result set back
```

The bottleneck is Step 1. Scanning 5 million rows just to find a handful is incredibly wasteful.

### Time complexity

| Scenario | Complexity | Explanation |
|----------|-----------|-------------|
| **Without indexes** | O(N) where N = 5,000,000 | Full table scan — checks every row |
| **With index on `studentID`** | O(log N) + O(K) | B-tree lookup + scan K matching rows |
| **With composite index** | O(log N) + O(M) | B-tree lookup + scan only M unread rows for that student |

Where:
- N = total rows (5,000,000)
- K = total notifications for student 1042 (maybe 200)
- M = unread notifications for student 1042 (maybe 15)

The difference between scanning 5 million rows and scanning 15 is massive.

---

## Performance Issues

Let's break down each problem in detail.

### 1. Full Table Scan

Without an index on `studentID`, the database has no shortcut. It literally reads every row in the table and checks the WHERE condition. With 5 million rows, this means:

- Reading potentially gigabytes of data from disk
- Checking 5 million conditions
- Discarding 99.99% of the rows

This is like looking for your name in a phone book by reading every single entry instead of jumping to the right letter.

### 2. Sorting Cost

Even after filtering, the `ORDER BY createdAt ASC` requires sorting. If there's no index that already has the data in sorted order, the database performs an **in-memory sort** (called a "filesort" in MySQL).

- For small result sets (say 20 rows), this is fine
- For larger result sets (1000+ rows), it eats up memory
- If it exceeds the sort buffer, it spills to disk, which is even slower

### 3. Large Dataset Impact

At 5 million rows:

| Metric | Impact |
|--------|--------|
| Disk I/O | Full scan reads entire table — multiple disk reads |
| CPU | Evaluating WHERE clause 5 million times |
| Memory | Holding intermediate results + sort buffer |
| Concurrency | Long-running query blocks other queries (locks) |
| Response time | Could take seconds instead of milliseconds |

### 4. Memory Usage

- `SELECT *` fetches all columns (id, title, message, type, priority, studentID, isRead, createdAt)
- The `message` column is TEXT, which could be 500+ characters per row
- During sorting, all selected columns are loaded into the sort buffer
- If we only need `id` and `title` for a notification list, we're wasting memory loading everything else

### 5. Index Usage (or lack of it)

Without any indexes, the query optimizer has no choice but to do a sequential scan. Even if we have an index on just `studentID`, the database still has to:

1. Use the index to find student 1042's rows (fast)
2. Scan all of those rows to check `isRead = false` (slower than needed)
3. Sort the results by `createdAt` (still needs a sort step)

A single-column index helps, but doesn't solve the whole problem.

---

## Optimization

### Step 1: Create a Composite Index

The most important optimization is a **composite index** that covers all three columns used in the query:

```sql
CREATE INDEX idx_student_unread_date
ON notifications(studentID, isRead, createdAt);
```

### Why this column order?

The order of columns in a composite index matters a lot. Think of it like a phone book organized by:

1. **Last name** (most selective filter first)
2. **First name** (secondary filter)
3. **Phone number** (sorted within the group)

Our index follows the same logic:

| Position | Column | Reason |
|----------|--------|--------|
| 1st | `studentID` | **Most selective**. Narrows 5M rows down to ~100 rows for one student. Always used in the WHERE clause with `=` |
| 2nd | `isRead` | **Secondary filter**. Further narrows from ~100 to ~15 unread. Also used with `=` |
| 3rd | `createdAt` | **Sort column**. Data is already in order within the index, so the database skips the sort step entirely |

### Why composite is better than individual indexes

What if we create three separate indexes instead?

```sql
CREATE INDEX idx_student ON notifications(studentID);
CREATE INDEX idx_read ON notifications(isRead);
CREATE INDEX idx_date ON notifications(createdAt);
```

Here's the problem:

| Approach | What happens |
|----------|-------------|
| **3 separate indexes** | Database picks ONE index (usually `studentID`), finds matching rows, then scans them sequentially for `isRead = false`, then sorts by `createdAt` |
| **1 composite index** | Database does a single B-tree traversal that filters by `studentID`, then `isRead`, and returns results already sorted by `createdAt` — no extra scan, no extra sort |

The composite index does everything in **one operation**. Individual indexes still require additional filtering and sorting steps.

The database optimizer *can* sometimes merge multiple indexes (called "index merge"), but it's slower and not guaranteed. A composite index is always more efficient for queries that use multiple columns together.

### Indexing Strategy Summary

```sql
-- Primary index: covers the main query pattern
CREATE INDEX idx_student_unread_date
ON notifications(studentID, isRead, createdAt);

-- For filtering by type (Stage 1 API: filter by type)
CREATE INDEX idx_student_type
ON notifications(studentID, notificationType);

-- For priority notifications (Stage 1 API: get priority)
CREATE INDEX idx_student_priority
ON notifications(studentID, priority, createdAt);
```

---

## "Index Every Column" Discussion

Let's say another developer on the team says: *"Why don't we just create an index on every column? That way every query will be fast."*

Sounds logical at first, but it's actually a bad idea. Here's why:

### The Good

| Advantage | Explanation |
|-----------|-------------|
| Faster reads | Any WHERE clause on any column would have an index to use |
| Flexible queries | Ad-hoc queries from different parts of the app would all benefit |

### The Bad

| Disadvantage | Explanation |
|-------------|-------------|
| **Slower writes** | Every INSERT has to update every index. With 8 columns, that's 8 index updates per insert. At 5M rows, this adds up significantly |
| **Slower updates** | Every UPDATE that changes an indexed column has to update the old index entry and create a new one |
| **Storage overhead** | Each index is basically a copy of that column's data plus pointers. 8 indexes on a 5M row table could easily add 2-3 GB of extra storage |
| **Maintenance cost** | More indexes = more work during VACUUM (PostgreSQL) or OPTIMIZE TABLE (MySQL). This locks tables and slows down the system |
| **Index selection confusion** | The query optimizer has to evaluate more index options, which can actually slow down query planning |

### The Math

Let's do a rough estimate for our notifications table:

| Column | Index Size (approx per 5M rows) |
|--------|-------------------------------|
| `studentID` (UUID) | ~200 MB |
| `isRead` (BOOLEAN) | ~80 MB |
| `createdAt` (TIMESTAMP) | ~160 MB |
| `notificationType` (VARCHAR) | ~120 MB |
| `priority` (VARCHAR) | ~100 MB |
| `title` (VARCHAR) | ~400 MB |
| `message` (TEXT) | ~2+ GB |
| Total extra storage | ~3+ GB |

And every single INSERT would need to update all 7+ indexes. For a system that creates notifications frequently, this is a significant performance hit.

### The Rule of Thumb

> Only index columns that appear in WHERE, JOIN, ORDER BY, or GROUP BY clauses frequently. Don't index columns you rarely filter on.

For our notifications table:
- ✅ Index `studentID` — used in every query
- ✅ Index `isRead` — used for filtering unread
- ✅ Index `createdAt` — used for sorting
- ✅ Index `notificationType` — used for filtering by type
- ❌ Don't index `title` — we never search by title in WHERE
- ❌ Don't index `message` — way too large, never filtered
- ❌ Don't index `priority` alone — better as part of composite with `studentID`

---

## Optimized Query

Here's the improved version of the original query:

### Before (problematic)

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

### After (optimized)

```sql
SELECT id, title, message, notificationType, priority, createdAt
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

### What changed and why

| Change | Why |
|--------|-----|
| `SELECT *` → specific columns | Avoids fetching `studentID` and `isRead` in the result (we already know them from the WHERE clause). Reduces data transfer and memory usage |
| Composite index exists | `idx_student_unread_date(studentID, isRead, createdAt)` makes the query use a single index scan with no extra sort step |

If we only need a summary list (like showing notification titles in the UI), we can go even leaner:

```sql
SELECT id, title, notificationType, priority, createdAt
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

Less data returned = faster network transfer = snappier UI.

---

## Placement Notification Query

> Find all students who received a Placement notification within the last 7 days.

```sql
SELECT DISTINCT s.id, s.name, s.email, s.roll_number, s.branch
FROM students s
JOIN notifications n ON s.id = n.studentID
WHERE n.notificationType = 'Placement'
AND n.createdAt >= NOW() - INTERVAL '7 days'
ORDER BY s.name ASC;
```

### How it works, step by step:

1. **`JOIN notifications n ON s.id = n.studentID`** — links each student to their notifications
2. **`WHERE n.notificationType = 'Placement'`** — keeps only placement-type notifications
3. **`AND n.createdAt >= NOW() - INTERVAL '7 days'`** — keeps only notifications from the last 7 days. `NOW()` returns the current timestamp, and we subtract 7 days from it
4. **`DISTINCT`** — a student might have received multiple placement notifications in 7 days. DISTINCT makes sure each student appears only once in the result
5. **`ORDER BY s.name ASC`** — sorts alphabetically for readability

### Supporting index:

```sql
CREATE INDEX idx_type_date ON notifications(notificationType, createdAt);
```

This lets the database quickly find all Placement notifications from the last 7 days without scanning the entire table.

### Example output:

| id | name | email | roll_number | branch |
|----|------|-------|-------------|--------|
| s1 | Sarayu Burugu | sarayu@college.edu | 2303A51842 | CSE |
| s2 | Rahul Sharma | rahul@college.edu | 2303A51201 | ECE |

---

## Complexity Analysis

Let's compare the original unoptimized approach vs the optimized approach.

### Variables

| Symbol | Meaning | Example Value |
|--------|---------|---------------|
| N | Total rows in table | 5,000,000 |
| K | Notifications for student 1042 | ~200 |
| M | Unread notifications for student 1042 | ~15 |

### Original Approach (No Indexes)

```
Full table scan:     O(N)          → scan 5,000,000 rows
Filter by student:   O(N)          → check every row
Filter by isRead:    O(N)          → check every row (done in same pass)
Sort by createdAt:   O(M × log M)  → sort the M matching results

Total:               O(N) + O(M × log M)
                   ≈ O(N)           → dominated by the scan
                   ≈ O(5,000,000)
```

The scan dominates everything. Sorting 15 rows is negligible compared to scanning 5 million.

### Optimized Approach (Composite Index)

```
B-tree index lookup:  O(log N)      → find studentID = 1042
Navigate to isRead:   O(1)          → index already partitioned by isRead
Scan results:         O(M)          → read M unread rows (already sorted by createdAt)
Sort:                 O(1)          → no sort needed, index is already ordered

Total:                O(log N) + O(M)
                    ≈ O(log N)
                    ≈ O(23)          → log₂(5,000,000) ≈ 22.25
```

### Side-by-Side Comparison

| Metric | Without Index | With Composite Index |
|--------|--------------|---------------------|
| **Time complexity** | O(N) | O(log N) |
| **Rows scanned** | 5,000,000 | ~15 |
| **Sort needed?** | Yes (O(M log M)) | No (index is pre-sorted) |
| **Disk I/O** | Reads entire table | Reads a few index pages + data rows |
| **Estimated time** | 2-5 seconds | < 5 milliseconds |
| **Memory usage** | High (sort buffer) | Minimal |

### The Bottom Line

| Approach | Big-O | Practical Speed |
|----------|-------|-----------------|
| No index | O(N) = O(5,000,000) | Seconds |
| Single index on studentID | O(log N + K) = O(23 + 200) | ~50ms |
| Composite index | O(log N + M) = O(23 + 15) | < 5ms |

The composite index gets us from **scanning millions of rows** to **reading about 15 rows directly**. That's the difference between a user waiting 3 seconds and seeing results instantly.

For a campus system with 50K students checking their notifications throughout the day, this optimization is the difference between a server that handles load comfortably and one that falls over during peak hours (like result announcement day when everyone logs in at once).

---

# Stage 4

## Context

Right now, every time a student opens the notifications page, the frontend calls the API, and the API hits the database directly. This works fine with 100 students, but we've scaled to:

- **50,000 students**
- **5,000,000 notifications**
- Students refreshing their notifications page **multiple times a day**

The database is getting hammered with the same queries over and over, response times are climbing, and students are complaining that the page feels slow.

---

## Problem Analysis

### Why is fetching on every page load inefficient?

Think about what happens during a typical day:

1. Student opens the app → API call → database query → response
2. Student switches tabs, comes back → same API call → same database query → same response
3. Student refreshes the page → same thing again
4. **Multiply this by 50,000 students**

Most of the time, the data hasn't changed between requests. We're running the exact same query and getting the exact same result, but we're paying the full database cost every single time.

### Impact breakdown

| Area | Problem |
|------|---------|
| **Database performance** | 50K students × 3-4 page loads per day = 150,000-200,000 queries per day. The database spends most of its time answering identical questions. Connection pool gets exhausted during peak hours |
| **API response times** | Each query takes ~50-200ms with indexes (longer without). Under load, queries queue up and wait for database connections. Students start seeing 2-5 second load times |
| **User experience** | Slow page loads → students get frustrated. Spinner shows for too long. On mobile with slower connections, it's even worse. Students start thinking the app is broken |

### The core issue

The database is being treated like a cache — we ask it the same question repeatedly and expect the same answer. But databases aren't designed for that. They're designed for storing and querying data, not for serving the same result 10,000 times per hour.

---

## Performance Improvement Strategies

### 1. Pagination

Instead of loading all notifications at once, load them in small pages (10-20 at a time).

**How it reduces database load:**

```sql
-- Without pagination: loads everything
SELECT * FROM notifications WHERE studentID = $1;
-- Could return 200+ rows, all loaded into memory

-- With pagination: loads only what's visible
SELECT * FROM notifications WHERE studentID = $1
ORDER BY createdAt DESC
LIMIT 10 OFFSET 0;
-- Returns exactly 10 rows
```

**How it improves response time:**

| Metric | Without Pagination | With Pagination |
|--------|-------------------|-----------------|
| Rows fetched | 200+ | 10 |
| Data transferred | ~50 KB | ~2.5 KB |
| Response time | ~200ms | ~30ms |
| Memory used | High | Low |

**Tradeoffs:**

| Pros | Cons |
|------|------|
| Simple to implement | Still hits the database every time |
| Reduces data per request | OFFSET-based pagination slows down on later pages |
| Better UX — faster initial load | Need to track page state on frontend |
| Standard pattern everyone understands | Total count query adds overhead |

We already implemented pagination in Stage 1, so this is covered. But pagination alone doesn't solve the repeated-query problem.

---

### 2. Infinite Scrolling

Instead of numbered pages, load more notifications as the user scrolls down. This is what apps like Instagram and Twitter do.

**How it works:**

```
Initial load:  GET /api/notifications?limit=10
                → show first 10 notifications

User scrolls:  GET /api/notifications?limit=10&cursor=2026-06-15T11:00:00Z
                → load next 10, append to list

User scrolls:  GET /api/notifications?limit=10&cursor=2026-06-13T16:00:00Z
                → load next 10, append to list
```

**Advantages:**

- Feels smooth and modern — no clicking "next page"
- Loads data only when needed (lazy loading)
- Uses cursor-based pagination which is faster than OFFSET (as discussed in Stage 3)
- Better mobile experience — scrolling is natural on phones

**Disadvantages:**

- Harder to implement than numbered pagination
- Can't jump to a specific "page" — must scroll sequentially
- If the list is very long, memory usage on the frontend grows (all loaded items stay in state)
- Harder to bookmark or share a specific position in the list
- Need to handle the "no more items" state gracefully

**When to use it:**

Infinite scrolling works best for feed-like content where users naturally browse sequentially — exactly like notifications. It's not great for things like search results where users want to jump to page 5.

---

### 3. Redis Caching

This is the biggest win. Instead of hitting the database every time, store frequently accessed data in an in-memory cache (Redis).

**How caching works:**

```
Student requests notifications
    ↓
Check Redis cache
    ↓
┌─── Cache HIT ───────────────────┐
│  Return cached data immediately  │
│  Response time: ~2ms             │
└──────────────────────────────────┘
    ↓ (if miss)
┌─── Cache MISS ──────────────────┐
│  Query the database              │
│  Store result in Redis (TTL: 60s)│
│  Return data to student          │
│  Response time: ~50ms            │
└──────────────────────────────────┘
```

**What data should be cached:**

| Cache Key | Data | TTL | Reason |
|-----------|------|-----|--------|
| `notifications:student:{id}:page:1` | First page of notifications | 60 seconds | Most viewed — every student sees page 1 first |
| `notifications:student:{id}:unread_count` | Unread badge count | 30 seconds | Shown on every page, queried constantly |
| `notifications:latest` | Latest 20 notifications (global) | 60 seconds | Same for everyone, high hit rate |
| `notifications:priority` | High-priority notifications | 120 seconds | Changes rarely, queried frequently |

**Cache invalidation strategy:**

This is the hard part. When do we clear the cache?

| Event | Invalidation Action |
|-------|-------------------|
| New notification created | Delete `notifications:latest` and `notifications:student:{id}:page:1` for affected students |
| Student marks notification as read | Delete `notifications:student:{id}:*` (all that student's cached data) |
| Mark all as read | Delete `notifications:student:{id}:*` |
| Notification deleted | Delete `notifications:latest` and affected student caches |

The simplest approach is **TTL-based expiry** — set a 60-second TTL on everything. Even if we don't actively invalidate, stale data is at most 60 seconds old. For a notification system, that's acceptable. Nobody is going to complain that a notification showed up 30 seconds late.

**Benefits and tradeoffs:**

| Pros | Cons |
|------|------|
| Massive speed improvement (~2ms vs ~50ms) | Added infrastructure (Redis server) |
| Reduces database load by 80-90% | Cache invalidation is tricky to get right |
| Handles traffic spikes easily | Stale data risk (mitigated by short TTL) |
| Scales horizontally | Extra memory cost for storing cached data |

---

### 4. Read Replicas

Instead of one database server handling all reads and writes, add read-only copies (replicas) of the database.

**How it works:**

```
                    ┌─────────────┐
                    │   Primary   │
   Writes ────────→ │  (DB Master) │
                    └──────┬──────┘
                           │ replication
              ┌────────────┼────────────┐
              ↓            ↓            ↓
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Replica 1│ │ Replica 2│ │ Replica 3│
        └──────────┘ └──────────┘ └──────────┘
              ↑            ↑            ↑
              └────────────┼────────────┘
                           │
   Reads ←─────────────────┘
```

- All **writes** (CREATE, UPDATE, DELETE) go to the primary database
- All **reads** (SELECT) go to one of the replicas
- The primary automatically copies data to replicas

**Benefits:**

- Distributes read load across multiple servers
- If one replica goes down, others take over
- Primary database is free to handle writes efficiently
- Can have replicas in different regions for lower latency

**Drawbacks:**

| Issue | Explanation |
|-------|-------------|
| **Replication lag** | Replicas might be a few milliseconds behind the primary. A student marks a notification as read, then immediately refreshes — the replica might still show it as unread |
| **Cost** | Each replica is a full database server — more servers = more money |
| **Complexity** | Application needs to know which queries go to primary vs replica |
| **Write bottleneck** | Doesn't help if the bottleneck is writes, not reads. But for a notification system, reads vastly outnumber writes, so this works well |

---

### 5. Background Processing

Instead of doing everything in the request-response cycle, offload heavy work to background jobs.

**What can be done in the background:**

| Task | Why background? |
|------|----------------|
| Sending notification to 50K students | Creating 50K `notification_status` rows shouldn't block the API response |
| Computing unread counts | Pre-calculate and store, instead of running COUNT queries live |
| Cleaning up old notifications | Archiving shouldn't slow down active queries |
| Sending email/push notifications | External API calls are slow and can fail |

**Queue-based architecture:**

```
Admin creates notification
    ↓
API creates notification record, returns 201
    ↓
Pushes job to message queue (e.g., BullMQ, RabbitMQ)
    ↓
Background worker picks up job
    ↓
Worker creates notification_status rows for all targeted students
    ↓
Worker updates cached unread counts
    ↓
Worker triggers SSE push to connected clients
```

**Benefits:**

- API responds instantly (doesn't wait for heavy operations)
- Can retry failed jobs automatically
- Can process jobs at a controlled rate (don't overwhelm the database)
- Separates "create the notification" from "deliver it to everyone"

---

### 6. Notification Preloading

Load what the user most likely needs first, and defer the rest.

**Loading recent notifications first:**

When a student opens the app:
1. **Immediately:** Load the 10 most recent notifications (from cache if possible)
2. **After render:** Start prefetching the next page in the background
3. **On scroll:** Load older notifications on demand

```js
// Frontend implementation idea
const { data: recentNotifications } = useNotifications({ page: 1 }); // Loads immediately

// Prefetch page 2 in the background after initial render
useEffect(() => {
  if (recentNotifications.length > 0) {
    prefetchNotifications({ page: 2 }); // Fires fetch but doesn't block UI
  }
}, [recentNotifications]);
```

**Lazy loading older notifications:**

For notifications older than 30 days, don't load them at all unless the user specifically asks. Show a "Load older notifications" button instead of automatically loading everything.

**Benefits:**

- First page loads instantly (great first impression)
- Reduces unnecessary data fetching
- Works well combined with caching (page 1 is almost always cached)

---

## Recommended Solution

For our campus notification system, I'd recommend combining **four strategies**:

```
┌─────────────────────────────────────────────────────┐
│              Recommended Architecture                │
│                                                     │
│   1. Pagination      → Limit data per request       │
│   2. Redis Cache     → Avoid repeated DB queries     │
│   3. Read Replicas   → Distribute read load          │
│   4. Background Jobs → Offload heavy processing      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Why this combination?

| Strategy | What it solves | Priority |
|----------|---------------|----------|
| **Pagination** | Limits data per request, faster responses | Must have (already implemented) |
| **Redis Cache** | Eliminates 80-90% of database queries | Must have — biggest single improvement |
| **Read Replicas** | Handles the remaining 10-20% of cache misses across multiple servers | Nice to have — needed at 50K+ users |
| **Background Jobs** | Keeps API fast when creating notifications for all students | Must have — without it, creating a notification blocks for seconds |

### What I'd skip for now:

- **Infinite scrolling** — nice UX improvement but doesn't solve the database load problem. Can add later.
- **Notification preloading** — small optimization, worth doing but low priority compared to caching.

---

## Architecture Flow

Here's the complete flow when a student requests their notifications:

```
Student opens app
       │
       ↓
┌──────────────┐
│   Frontend   │  GET /api/notifications?page=1
│   (React)    │──────────────────────────────────┐
└──────────────┘                                  │
                                                  ↓
                                        ┌──────────────────┐
                                        │   API Server     │
                                        │   (Express.js)    │
                                        └────────┬─────────┘
                                                 │
                                                 ↓
                                        ┌──────────────────┐
                                        │   Check Redis    │
                                        │   Cache          │
                                        └────────┬─────────┘
                                                 │
                              ┌──────────────────┼──────────────────┐
                              │                                     │
                        Cache HIT                              Cache MISS
                              │                                     │
                              ↓                                     ↓
                    ┌──────────────────┐               ┌──────────────────┐
                    │ Return cached    │               │ Query Database   │
                    │ data (~2ms)      │               │ (Read Replica)   │
                    └──────────────────┘               └────────┬─────────┘
                                                                │
                                                                ↓
                                                     ┌──────────────────┐
                                                     │ Store in Redis   │
                                                     │ (TTL: 60s)       │
                                                     └────────┬─────────┘
                                                                │
                                                                ↓
                                                     ┌──────────────────┐
                                                     │ Return data      │
                                                     │ (~50ms)          │
                                                     └──────────────────┘
```

### Cache Hit (happy path — 80-90% of requests)

1. Student opens the app
2. Frontend sends `GET /api/notifications?page=1&studentId=s1`
3. API server checks Redis for key `notifications:student:s1:page:1`
4. **Key exists** → return the cached JSON directly
5. Response time: **~2-5ms**
6. Database is never touched

### Cache Miss (first request or after TTL expiry)

1. Student opens the app
2. Frontend sends `GET /api/notifications?page=1&studentId=s1`
3. API server checks Redis for key `notifications:student:s1:page:1`
4. **Key doesn't exist** → query the database (read replica)
5. Database returns the result (~30-50ms)
6. API server stores the result in Redis with a 60-second TTL
7. API server returns the data to the student
8. Response time: **~50-80ms**
9. Next request within 60 seconds will be a cache hit

### What happens when data changes

**Student marks a notification as read:**

```
1. Frontend sends PATCH /api/notifications/n1/read
2. API updates the primary database
3. API deletes Redis keys: notifications:student:s1:*
4. Next request will be a cache miss → fresh data loaded
```

**Admin creates a new notification:**

```
1. Admin sends POST /api/notifications
2. API creates notification record in primary database
3. API pushes "distribute notification" job to background queue
4. API returns 201 immediately
5. Background worker creates notification_status rows for targeted students
6. Worker invalidates relevant Redis caches
7. Worker pushes SSE event to connected clients
```

---

## Tradeoff Discussion

Every strategy comes with costs. Here's an honest comparison:

### Pagination

| Factor | Assessment |
|--------|-----------|
| **Advantages** | Simple to implement, reduces data per request, universally understood pattern |
| **Disadvantages** | Still hits database every request, OFFSET gets slow on large datasets |
| **Complexity** | Low — just add LIMIT/OFFSET to queries and page params to API |
| **Cost** | Zero — no additional infrastructure |

### Infinite Scrolling

| Factor | Assessment |
|--------|-----------|
| **Advantages** | Smooth UX, cursor-based pagination is fast, loads data only when needed |
| **Disadvantages** | More complex frontend code, can't jump to specific position, growing memory on client |
| **Complexity** | Medium — need cursor tracking, intersection observer on frontend, cursor-based queries on backend |
| **Cost** | Zero infrastructure cost, but more development time |

### Redis Caching

| Factor | Assessment |
|--------|-----------|
| **Advantages** | Biggest performance win (2ms vs 50ms), reduces DB load by 80-90%, handles traffic spikes |
| **Disadvantages** | Stale data risk, cache invalidation complexity, additional service to manage |
| **Complexity** | Medium — need to set up Redis, implement caching logic, handle invalidation |
| **Cost** | Low-Medium — Redis is free (open source), cloud managed Redis costs ~$15-50/month |

### Read Replicas

| Factor | Assessment |
|--------|-----------|
| **Advantages** | Distributes load, high availability, no code changes for simple setups |
| **Disadvantages** | Replication lag, higher cost, doesn't help with write-heavy workloads |
| **Complexity** | Medium — need to configure replication, route reads to replicas |
| **Cost** | Medium-High — each replica is a full database server ($50-200/month in cloud) |

### Background Processing

| Factor | Assessment |
|--------|-----------|
| **Advantages** | Keeps API fast, handles failures gracefully, controllable processing rate |
| **Disadvantages** | Eventual consistency (notification doesn't appear instantly for all users), additional infrastructure |
| **Complexity** | Medium-High — need a message queue (BullMQ/RabbitMQ), worker processes, job monitoring |
| **Cost** | Low — BullMQ uses Redis (already have it), RabbitMQ is free |

### Notification Preloading

| Factor | Assessment |
|--------|-----------|
| **Advantages** | Fast first load, reduces perceived latency, better UX |
| **Disadvantages** | Wastes bandwidth if user doesn't scroll, slightly more complex frontend |
| **Complexity** | Low — just prefetch the next page after initial render |
| **Cost** | Zero — purely a frontend optimization |

### Summary Table

| Strategy | Performance Gain | Implementation Effort | Infrastructure Cost | Recommended? |
|----------|-----------------|----------------------|--------------------|----|
| Pagination | ⭐⭐ | Low | Free | ✅ Already done |
| Infinite Scroll | ⭐⭐ | Medium | Free | ⏳ Nice to have |
| Redis Cache | ⭐⭐⭐⭐⭐ | Medium | Low | ✅ Do this first |
| Read Replicas | ⭐⭐⭐ | Medium | Medium-High | ⏳ When traffic grows |
| Background Jobs | ⭐⭐⭐⭐ | Medium-High | Low | ✅ Needed for bulk ops |
| Preloading | ⭐ | Low | Free | ⏳ Nice to have |

### What I'd implement in order:

1. **Redis Caching** — biggest bang for the buck. Do this first.
2. **Background Jobs** — needed as soon as we create notifications for all 50K students.
3. **Read Replicas** — when cache misses start adding up and DB load is still high.
4. **Infinite Scroll** — UX polish, do when the backend is solid.
5. **Preloading** — small win, add when everything else is stable.

For a campus project being evaluated, implementing pagination + Redis caching is realistic and demonstrates a solid understanding of performance optimization. Read replicas and background queues are good to discuss in a design interview but might be over-engineering for the actual implementation within the assessment timeframe.

---

