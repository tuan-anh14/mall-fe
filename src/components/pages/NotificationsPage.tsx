import { useState, useEffect } from "react";
import { Bell, Package, Heart, TrendingUp, X } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { motion } from "motion/react";
import { get, put, del } from "../../lib/api";
import { toast } from "sonner";

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

  if (diffSecs < 60) return "vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "1 ngày trước";
  if (diffDays < 30) return `${diffDays} ngày trước`;
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
      return "Xem đơn hàng";
    case "WISHLIST":
      return "Xem yêu thích";
    case "PROMOTION":
    case "SALE":
      return "Mua ngay";
    default:
      return "Xem";
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
  onOpen,
}: {
  notification: UiNotification;
  onAction: (page: string, data?: any) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (n: UiNotification) => void;
}) {
  const Icon = notification.icon;
  return (
    <Card
      className={`bg-foreground/5 border-border hover:bg-foreground/10 transition-colors cursor-pointer ${
        !notification.isRead ? "border-purple-500/50" : ""
      }`}
      onClick={() => onOpen(notification)}
    >
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div
            className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
              !notification.isRead
                ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20"
                : "bg-foreground/5"
            }`}
          >
            <Icon
              className={`h-6 w-6 ${
                !notification.isRead ? "text-purple-400" : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-1">
              <h3
                className={`text-foreground ${!notification.isRead ? "" : "text-muted-foreground"}`}
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
                  className="text-muted-foreground hover:text-red-400 h-6 w-6 p-0"
                  onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                  title="Xóa thông báo"
                >
                  &times;
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{notification.message}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{notification.time}</span>
              <div className="flex gap-2">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-muted-foreground text-xs"
                    onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
                  >
                    Đánh dấu đã đọc
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-400 hover:text-purple-300"
                  onClick={(e) => { e.stopPropagation(); onAction(notification.actionPage, notification.actionData); }}
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
  const [detailNotification, setDetailNotification] = useState<UiNotification | null>(null);

  const openDetail = (n: UiNotification) => {
    setDetailNotification(n);
    if (!n.isRead) markAsRead(n.id);
  };

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
      toast.error(err.message || "Không thể tải thông báo");
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
      toast.error(err.message || "Không thể đánh dấu đã đọc");
    }
  };

  const markAllAsRead = async () => {
    try {
      await put("/api/v1/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("Đã đánh dấu tất cả đã đọc");
    } catch (err: any) {
      toast.error(err.message || "Không thể đánh dấu tất cả đã đọc");
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
      toast.error(err.message || "Không thể xóa thông báo");
    }
  };

  const orderNotifications = notifications.filter((n) => n.type === "order");
  const promotionNotifications = notifications.filter(
    (n) => n.type === "sale" || n.type === "promotion"
  );

  const renderList = (list: UiNotification[]) => {
    if (isLoading) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Đang tải thông báo...
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <div className="text-center py-8">
          <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Không có thông báo trong danh mục này</p>
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
          onOpen={openDetail}
        />
      </motion.div>
    ));
  };

  return (
    <div className="min-h-screen bg-background py-8">
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
                <Bell className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h1 className="text-foreground">Thông báo</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Bạn có {unreadCount} thông báo chưa đọc
                  </p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        </motion.div>

        {/* Notifications Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 bg-foreground/5">
            <TabsTrigger value="all">
              Tất cả
              {unreadCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
            <TabsTrigger value="promotions">Khuyến mãi</TabsTrigger>
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
            <div className="h-20 w-20 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
              <Bell className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-muted-foreground mb-2">Không có thông báo</h2>
            <p className="text-muted-foreground text-sm">Bạn đã xem hết thông báo!</p>
          </div>
        )}
      </div>

      {/* Notification Detail Dialog */}
      <Dialog open={!!detailNotification} onOpenChange={(o: boolean) => !o && setDetailNotification(null)}>
        <DialogContent className="bg-secondary border-border text-foreground max-w-md">
          {detailNotification && (() => {
            const Icon = detailNotification.icon;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <DialogTitle className="text-foreground leading-tight">{detailNotification.title}</DialogTitle>
                  </div>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <p className="text-muted-foreground text-sm leading-relaxed">{detailNotification.message}</p>
                  <p className="text-muted-foreground text-xs">{detailNotification.time}</p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border"
                    onClick={() => setDetailNotification(null)}
                  >
                    Đóng
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                    onClick={() => {
                      setDetailNotification(null);
                      onNavigate(detailNotification.actionPage, detailNotification.actionData);
                    }}
                  >
                    {detailNotification.actionText}
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
