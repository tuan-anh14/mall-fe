import { useEffect, useRef, useState, useCallback } from "react";
import { API_URL } from "@/lib/api";

export interface StreamNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionPage?: string;
}

export function useNotificationStream(isAuthenticated: boolean) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<StreamNotification | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/notifications?limit=1&isRead=false`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setUnreadCount(json.data?.unreadCount ?? 0);
      }
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      setUnreadCount(0);
      return;
    }

    const es = new EventSource(`${API_URL}/api/v1/notifications/stream`, {
      withCredentials: true,
    });
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "notification" && payload.notification) {
          const notif: StreamNotification = payload.notification;
          setLatestNotification(notif);
          if (!notif.isRead) {
            setUnreadCount((c) => c + 1);
          }
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // SSE will auto-reconnect; no action needed
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [isAuthenticated]);

  const decrementUnread = useCallback((by = 1) => {
    setUnreadCount((c) => Math.max(0, c - by));
  }, []);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  return { unreadCount, latestNotification, decrementUnread, clearUnread, refetchCount: fetchUnreadCount };
}
