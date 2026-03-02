import { useState, useEffect } from "react";
import { Bell, Package, Heart, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { motion } from "motion/react";
import { get, put, del } from "../../lib/api";
import { toast } from "sonner@2.0.3";

interface NotificationsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionType?: string;
  actionId?: string;
}

interface UiNotification {
  id: string;
  type: string;
  icon: React.ElementType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionText: string;
  actionPage: string;
  actionData?: any;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getIconForType(type: string): React.ElementType {
  switch (type?.toUpperCase()) {
    case "ORDER":
      return Package;
    case "SALE":
    case "PROMOTION":
      return TrendingUp;
    case "WISHLIST":
      return Heart;
    default:
      return Bell;
  }
}

function getActionPageForType(actionType?: string): string {
  switch (actionType?.toUpperCase()) {
    case "ORDER":
      return "orders";
    case "WISHLIST":
      return "wishlist";
    case "PROMOTION":
    case "SALE":
      return "shop";
    default:
      return "home";
  }
}

function getActionTextForType(actionType?: string): string {
  switch (actionType?.toUpperCase()) {
    case "ORDER":
      return "View Order";
    case "WISHLIST":
      return "View Wishlist";
    case "PROMOTION":
    case "SALE":
      return "Shop Now";
    default:
      return "View";
  }
}

function mapApiNotification(n: ApiNotification): UiNotification {
  return {
    id: n.id,
    type: n.type?.toLowerCase() ?? "other",
    icon: getIconForType(n.type),
    title: n.title,
    message: n.message,
    time: formatRelativeTime(n.createdAt),
    isRead: n.isRead,
    actionText: getActionTextForType(n.actionType),
    actionPage: getActionPageForType(n.actionType),
  };
}

function NotificationCard({
  notification,
  onAction,
  onMarkRead,
  onDelete,
}: {
  notification: UiNotification;
  onAction: (page: string, data?: any) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = notification.icon;
  return (
    <Card
      className={`bg-white/5 border-white/10 hover:bg-white/10 transition-colors ${
        !notification.isRead ? "border-purple-500/50" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div
            className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
              !notification.isRead
                ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20"
                : "bg-white/5"
            }`}
          >
            <Icon
              className={`h-6 w-6 ${
                !notification.isRead ? "text-purple-400" : "text-white/60"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-1">
              <h3
                className={`text-white ${!notification.isRead ? "" : "text-white/80"}`}
              >
                {notification.title}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!notification.isRead && (
                  <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/40 hover:text-red-400 h-6 w-6 p-0"
                  onClick={() => onDelete(notification.id)}
                  title="Delete notification"
                >
                  &times;
                </Button>
              </div>
            </div>
            <p className="text-sm text-white/60 mb-2">{notification.message}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">{notification.time}</span>
              <div className="flex gap-2">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/50 hover:text-white/80 text-xs"
                    onClick={() => onMarkRead(notification.id)}
                  >
                    Mark read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-400 hover:text-purple-300"
                  onClick={() => onAction(notification.actionPage, notification.actionData)}
                >
                  {notification.actionText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<UiNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await get<{
        notifications: ApiNotification[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        unreadCount: number;
      }>("/api/v1/notifications?page=1&limit=50");
      const mapped = (res.notifications ?? []).map(mapApiNotification);
      setNotifications(mapped);
      setUnreadCount(res.unreadCount ?? mapped.filter((n) => !n.isRead).length);
    } catch (err: any) {
      toast.error(err.message || "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await put(`/api/v1/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      toast.error(err.message || "Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await put("/api/v1/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err: any) {
      toast.error(err.message || "Failed to mark all as read");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await del(`/api/v1/notifications/${id}`);
      const deleted = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete notification");
    }
  };

  const orderNotifications = notifications.filter((n) => n.type === "order");
  const promotionNotifications = notifications.filter(
    (n) => n.type === "sale" || n.type === "promotion"
  );

  const renderList = (list: UiNotification[]) => {
    if (isLoading) {
      return (
        <div className="text-center py-8 text-white/40">
          Loading notifications...
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <div className="text-center py-8">
          <Bell className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No notifications in this category</p>
        </div>
      );
    }
    return list.map((notification, index) => (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <NotificationCard
          notification={notification}
          onAction={onNavigate}
          onMarkRead={markAsRead}
          onDelete={deleteNotification}
        />
      </motion.div>
    ));
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-white">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-white/60">
                    You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </motion.div>

        {/* Notifications Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 bg-white/5">
            <TabsTrigger value="all">
              All
              {unreadCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderList(notifications)}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {renderList(orderNotifications)}
          </TabsContent>

          <TabsContent value="promotions" className="space-y-4">
            {renderList(promotionNotifications)}
          </TabsContent>
        </Tabs>

        {/* Empty State (global) */}
        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-16">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Bell className="h-10 w-10 text-white/40" />
            </div>
            <h2 className="text-white/80 mb-2">No notifications</h2>
            <p className="text-white/60 text-sm">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
