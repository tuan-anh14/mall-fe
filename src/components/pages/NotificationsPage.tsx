import { useState, useEffect } from "react";
import { Bell, Package, Heart, TrendingUp, X, Check, CheckCheck, ArrowRight, Inbox } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { motion, AnimatePresence } from "motion/react";
import { get, put, del } from "../../lib/api";
import { toast } from "sonner";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
};

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

const typeStyles: Record<string, { color: string; bg: string; accent: string }> = {
  ORDER: { color: "text-blue-600", bg: "bg-blue-50", accent: "bg-blue-500" },
  SALE: { color: "text-amber-600", bg: "bg-amber-50", accent: "bg-amber-500" },
  PROMOTION: { color: "text-amber-600", bg: "bg-amber-50", accent: "bg-amber-500" },
  WISHLIST: { color: "text-rose-600", bg: "bg-rose-50", accent: "bg-rose-500" },
  DEFAULT: { color: "text-blue-600", bg: "bg-blue-50", accent: "bg-blue-500" },
  READ: { color: "text-gray-400", bg: "bg-gray-100", accent: "bg-transparent" },
};

function getTypeStyle(type: string, isRead: boolean) {
  if (isRead) return typeStyles.READ;
  return typeStyles[type?.toUpperCase()] ?? typeStyles.DEFAULT;
}

function getActionPageForType(actionType?: string): string {
  switch (actionType?.toUpperCase()) {
    case "ORDER": return "orders";
    case "WISHLIST": return "wishlist";
    case "PROMOTION":
    case "SALE": return "shop";
    default: return "home";
  }
}

function getActionTextForType(actionType?: string): string {
  switch (actionType?.toUpperCase()) {
    case "ORDER": return "Xem đơn hàng";
    case "WISHLIST": return "Xem yêu thích";
    case "PROMOTION":
    case "SALE": return "Mua ngay";
    default: return "Xem";
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
  const style = getTypeStyle(notification.type, notification.isRead);
  const isUnread = !notification.isRead;

  return (
    <div
      className={`group relative flex rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 ${
        isUnread
          ? "bg-white border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-px"
          : "bg-white/70 border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-sm"
      }`}
      onClick={() => onOpen(notification)}
    >
      {/* Left accent bar */}
      <div className={`w-1 flex-shrink-0 ${isUnread ? style.accent : "bg-transparent"}`} />

      <div className="flex-1 p-4 md:p-5">
        <div className="flex gap-3.5">
          {/* Icon */}
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg} transition-transform duration-300 group-hover:scale-105`}>
            <Icon className={`h-5 w-5 ${style.color}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm leading-snug truncate ${isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-500"}`}>
                    {notification.title}
                  </h3>
                  {isUnread && (
                    <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-600" />
                  )}
                </div>
                <p className={`text-sm mt-0.5 line-clamp-2 leading-relaxed ${isUnread ? "text-gray-600" : "text-gray-400"}`}>
                  {notification.message}
                </p>
              </div>

              {/* Delete */}
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-7 w-7 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200 -mt-0.5"
                onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] text-gray-400 font-medium">{notification.time}</span>
              <div className="flex gap-1">
                {isUnread && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 text-[11px] h-6 px-2 rounded-md transition-all duration-200"
                    onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
                  >
                    <Check className="h-3 w-3 mr-0.5" />
                    Đã đọc
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-[11px] h-6 px-2 rounded-md font-semibold transition-all duration-200"
                  onClick={(e) => { e.stopPropagation(); onAction(notification.actionPage, notification.actionData); }}
                >
                  {notification.actionText}
                  <ArrowRight className="h-3 w-3 ml-0.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

  const hasNoNotifications = !isLoading && notifications.length === 0;

  const renderList = (list: UiNotification[]) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative w-11 h-11">
              <div className="absolute inset-0 rounded-full border-[3px] border-blue-100" />
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 animate-spin" />
            </div>
            <p className="text-gray-400 text-sm">Đang tải thông báo...</p>
          </motion.div>
        </div>
      );
    }
    if (list.length === 0) return null;
    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-2.5"
      >
        <AnimatePresence mode="popLayout">
          {list.map((notification) => (
            <motion.div
              key={notification.id}
              layout
              variants={staggerItem}
              exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
            >
              <NotificationCard
                notification={notification}
                onAction={onNavigate}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
                onOpen={openDetail}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Bell className="h-6 w-6 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Thông báo</h1>
                <p className="text-gray-500 mt-0.5 text-sm">
                  {isLoading
                    ? "Đang tải..."
                    : unreadCount > 0
                      ? `Bạn có ${unreadCount} thông báo chưa đọc`
                      : notifications.length > 0
                        ? "Tất cả thông báo đã được đọc"
                        : "Chưa có thông báo nào"}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 rounded-xl h-9 transition-all duration-200"
              >
                <CheckCheck className="h-4 w-4 mr-1.5" />
                Đọc tất cả
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {hasNoNotifications ? (
          /* Single clean empty state when there are zero notifications */
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Bell className="h-10 w-10 text-blue-300" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Tất cả đã cập nhật!</h2>
            <p className="text-gray-500 max-w-sm mx-auto text-center leading-relaxed mb-8">
              Bạn không có thông báo nào. Chúng tôi sẽ cho bạn biết khi có đơn hàng, khuyến mãi hoặc cập nhật mới.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Package className="h-4 w-4 text-blue-400" />
                </div>
                <span>Đơn hàng</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-amber-400" />
                </div>
                <span>Khuyến mãi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-rose-400" />
                </div>
                <span>Yêu thích</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Tabs + notification list when there are notifications */
          <Tabs defaultValue="all" variant="compact" className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease }}
            >
              <TabsList className="mb-6">
                <TabsTrigger value="all">
                  Tất cả
                  {unreadCount > 0 && (
                    <Badge className="ml-2 h-[18px] min-w-[18px] rounded-full px-1 flex items-center justify-center text-[10px] font-bold bg-blue-600 text-white border-0">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <Package className="h-3.5 w-3.5" />
                  Đơn hàng
                  {orderNotifications.filter(n => !n.isRead).length > 0 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="promotions">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Khuyến mãi
                  {promotionNotifications.filter(n => !n.isRead).length > 0 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  )}
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              <TabsContent value="all">{renderList(notifications)}</TabsContent>
              <TabsContent value="orders">
                {renderList(orderNotifications) || (
                  <div className="text-center py-16 text-gray-400 text-sm">Không có thông báo đơn hàng</div>
                )}
              </TabsContent>
              <TabsContent value="promotions">
                {renderList(promotionNotifications) || (
                  <div className="text-center py-16 text-gray-400 text-sm">Không có thông báo khuyến mãi</div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>

      {/* Notification Detail Dialog */}
      <Dialog open={!!detailNotification} onOpenChange={(o: boolean) => !o && setDetailNotification(null)}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-md rounded-2xl p-0 overflow-hidden">
          {detailNotification && (() => {
            const Icon = detailNotification.icon;
            const style = getTypeStyle(detailNotification.type, false);
            return (
              <>
                {/* Colored header strip */}
                <div className={`${style.bg} px-6 pt-6 pb-5`}>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <Icon className={`h-5 w-5 ${style.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <DialogTitle className="text-gray-900 leading-snug text-base">{detailNotification.title}</DialogTitle>
                        <p className="text-xs text-gray-500 mt-0.5">{detailNotification.time}</p>
                      </div>
                    </div>
                  </DialogHeader>
                </div>
                <div className="px-6 py-5">
                  <p className="text-gray-600 text-sm leading-relaxed">{detailNotification.message}</p>
                </div>
                <div className="flex justify-end gap-2.5 px-6 pb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 rounded-xl h-9 hover:bg-gray-50 transition-all"
                    onClick={() => setDetailNotification(null)}
                  >
                    Đóng
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 shadow-sm shadow-blue-600/20 transition-all duration-200 hover:-translate-y-px"
                    onClick={() => {
                      setDetailNotification(null);
                      onNavigate(detailNotification.actionPage, detailNotification.actionData);
                    }}
                  >
                    {detailNotification.actionText}
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
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
