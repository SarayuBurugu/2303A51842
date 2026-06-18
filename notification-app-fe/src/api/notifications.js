import createLogger from "../utils/logger";

const log = createLogger("API");

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

// Sample notifications — used when the backend API is unavailable
const SAMPLE_NOTIFICATIONS = [
  { id: "n1",  title: "TCS Placement Drive",        message: "TCS on-campus recruitment July 5th. CSE, ECE, EEE eligible. Min CGPA: 7.0",       type: "Placement", priority: "high",   read: false, createdAt: "2026-06-18T09:00:00.000Z" },
  { id: "n2",  title: "Semester Results Published",  message: "B.Tech 3rd semester results are out. Check the portal.",                          type: "Result",    priority: "normal", read: true,  createdAt: "2026-06-17T14:30:00.000Z" },
  { id: "n3",  title: "Annual Tech Fest",            message: "Register for Innovision 2026! Hackathon, paper presentations, coding contests.",  type: "Event",     priority: "normal", read: false, createdAt: "2026-06-16T10:00:00.000Z" },
  { id: "n4",  title: "Infosys InfyTQ Results",      message: "InfyTQ certification results out. Passed students shortlisted for interview.",    type: "Placement", priority: "high",   read: false, createdAt: "2026-06-15T11:00:00.000Z" },
  { id: "n5",  title: "Mid-Semester Exam Schedule",  message: "Mid-semester exams for all branches commence from July 10th.",                    type: "Result",    priority: "high",   read: false, createdAt: "2026-06-14T08:00:00.000Z" },
  { id: "n6",  title: "Campus Cultural Night",       message: "Annual cultural night on June 28th. All students welcome!",                       type: "Event",     priority: "normal", read: false, createdAt: "2026-06-13T16:00:00.000Z" },
  { id: "n7",  title: "Wipro Hiring Drive",          message: "Wipro NLTH registrations open. Apply before June 30th.",                          type: "Placement", priority: "high",   read: false, createdAt: "2026-06-12T09:30:00.000Z" },
  { id: "n8",  title: "Lab Exam Results",            message: "Physics and Chemistry lab exam results published.",                                type: "Result",    priority: "normal", read: true,  createdAt: "2026-06-11T13:00:00.000Z" },
  { id: "n9",  title: "Sports Day Registration",     message: "Inter-department sports day. Register by June 20th.",                              type: "Event",     priority: "normal", read: false, createdAt: "2026-06-10T10:00:00.000Z" },
  { id: "n10", title: "Cognizant GenC Next",         message: "Cognizant GenC Next drive on June 25th. B.Tech CSE only.",                         type: "Placement", priority: "high",   read: false, createdAt: "2026-06-09T08:00:00.000Z" },
  { id: "n11", title: "Supplementary Exam Notice",   message: "Supplementary exams for failed subjects. Apply by June 22nd.",                    type: "Result",    priority: "high",   read: false, createdAt: "2026-06-08T09:00:00.000Z" },
  { id: "n12", title: "Guest Lecture — AI in 2026",  message: "Guest lecture by Dr. Ramesh on AI trends. Seminar Hall, June 19th.",               type: "Event",     priority: "normal", read: false, createdAt: "2026-06-07T11:00:00.000Z" },
  { id: "n13", title: "Amazon SDE Internship",       message: "Amazon SDE internship for pre-final year. CGPA > 8.0 required.",                  type: "Placement", priority: "high",   read: false, createdAt: "2026-06-18T11:30:00.000Z" },
  { id: "n14", title: "GATE Mock Test Results",      message: "GATE mock test scores are available. Check the placement portal.",                 type: "Result",    priority: "normal", read: false, createdAt: "2026-06-17T16:00:00.000Z" },
  { id: "n15", title: "NSS Blood Donation Camp",     message: "NSS blood donation camp on June 21st. Volunteers needed.",                         type: "Event",     priority: "normal", read: false, createdAt: "2026-06-15T14:00:00.000Z" },
];

function applyLocalFilters(notifications, { filter, page, pageSize }) {
  let filtered = [...notifications];

  if (filter && filter !== "All") {
    filtered = filtered.filter((n) => n.type === filter);
  }

  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return {
    notifications: paged,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    unreadCount: notifications.filter((n) => !n.read).length,
  };
}

export async function fetchNotifications({ filter, page = 1, pageSize = 10 } = {}) {
  log.info("Fetching notifications", { filter, page, pageSize });

  try {
    const params = new URLSearchParams({ page, pageSize });
    if (filter && filter !== "All") params.set("type", filter);

    const url = `${API_BASE}/notifications?${params}`;
    log.debug("API request", { url });

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    log.info("API response received", { count: data.notifications?.length, total: data.total });
    return data;
  } catch (err) {
    log.warn("API unavailable, using sample data", { error: err.message });
    return applyLocalFilters(SAMPLE_NOTIFICATIONS, { filter, page, pageSize });
  }
}

export async function fetchAllNotifications() {
  log.info("Fetching all notifications for priority ranking");

  try {
    const url = `${API_BASE}/notifications?page=1&pageSize=100`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    log.info("All notifications fetched", { count: data.notifications?.length });
    return data.notifications ?? [];
  } catch (err) {
    log.warn("API unavailable for priority fetch, using sample data", { error: err.message });
    return SAMPLE_NOTIFICATIONS;
  }
}

export async function markNotificationAsRead(id) {
  log.info("Marking notification as read", { id });
  try {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: "PATCH" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    log.info("Notification marked as read", { id });
    return data;
  } catch (err) {
    log.warn("Mark-as-read API failed, applying locally", { id, error: err.message });
    // Update local state if needed (simulated)
    const notif = SAMPLE_NOTIFICATIONS.find((n) => n.id === id);
    if (notif) notif.read = true;
    return { id, read: true };
  }
}

export async function createNotification(notification) {
  log.info("Creating notification via API", notification);
  try {
    const res = await fetch(`${API_BASE}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notification),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    log.info("Notification created successfully", { id: data.id });
    return data;
  } catch (err) {
    log.warn("Create notification API failed, applying locally (simulated)", { error: err.message });
    const newNotif = {
      id: "local_" + Math.random().toString(36).substring(2, 9),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    SAMPLE_NOTIFICATIONS.unshift(newNotif);
    return newNotif;
  }
}
