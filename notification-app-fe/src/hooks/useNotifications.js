import { useState, useEffect, useCallback } from "react";
import { fetchNotifications, markNotificationAsRead } from "../api/notifications";
import createLogger from "../utils/logger";

const log = createLogger("useNotifications");

export function useNotifications(filter, page = 1, pageSize = 10, refreshTrigger = 0) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    log.info("Hook triggered", { filter, page, pageSize, refreshTrigger });

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications({ filter, page, pageSize });
        if (!cancelled) {
          setNotifications(data.notifications ?? []);
          setTotal(data.total ?? 0);
          setUnreadCount(data.unreadCount ?? 0);
          log.info("Notifications loaded", { count: data.notifications?.length, total: data.total });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load notifications");
          log.error("Failed to load notifications", { error: err.message });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [filter, page, pageSize, refreshTrigger]);

  const markAsRead = useCallback(async (id) => {
    log.info("Marking notification as read", { id });
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationAsRead(id);
      log.info("Notification marked as read successfully", { id });
    } catch (err) {
      log.error("Failed to mark as read, reverting", { id, error: err.message });
      // Revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  const totalPages = Math.ceil(total / pageSize);

  return { notifications, total, totalPages, unreadCount, loading, error, markAsRead };
}
