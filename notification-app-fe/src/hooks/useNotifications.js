import { useState, useEffect } from "react";
import { fetchNotifications } from "../api/notifications";

export function useNotifications(filter, page = 1, pageSize = 10) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications({ filter, page, pageSize });
        if (!cancelled) {
          setNotifications(data.notifications ?? []);
          setTotal(data.total ?? 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load notifications");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [filter, page, pageSize]);

  const totalPages = Math.ceil(total / pageSize);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, total, totalPages, unreadCount, loading, error };
}
