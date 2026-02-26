import { Bell, Package, ShoppingCart, Heart, Tag, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { motion } from "motion/react";

interface NotificationsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const notifications = [
    {
      id: 1,
      type: "order",
      icon: Package,
      title: "Order Shipped",
      message: "Your order #ORD-2024-001 has been shipped and is on its way!",
      time: "2 hours ago",
      isRead: false,
      actionText: "Track Order",
      actionPage: "orders",
    },
    {
      id: 2,
      type: "sale",
      icon: Tag,
      title: "Flash Sale Alert",
      message: "50% off on Electronics! Limited time offer - Don't miss out!",
      time: "5 hours ago",
      isRead: false,
      actionText: "Shop Now",
      actionPage: "shop",
      actionData: { category: "electronics" },
    },
    {
      id: 3,
      type: "wishlist",
      icon: Heart,
      title: "Price Drop",
      message: "Good news! The Sony WH-1000XM5 in your wishlist is now 20% off!",
      time: "1 day ago",
      isRead: false,
      actionText: "View Product",
      actionPage: "wishlist",
    },
    {
      id: 4,
      type: "order",
      icon: CheckCircle2,
      title: "Order Delivered",
      message: "Your order #ORD-2024-002 has been delivered successfully.",
      time: "2 days ago",
      isRead: true,
      actionText: "Review Product",
      actionPage: "orders",
    },
    {
      id: 5,
      type: "promotion",
      icon: TrendingUp,
      title: "New Arrivals",
      message: "Check out our latest collection of premium headphones!",
      time: "3 days ago",
      isRead: true,
      actionText: "Explore",
      actionPage: "shop",
    },
    {
      id: 6,
      type: "order",
      icon: ShoppingCart,
      title: "Cart Reminder",
      message: "You have items in your cart. Complete your purchase now!",
      time: "4 days ago",
      isRead: true,
      actionText: "View Cart",
      actionPage: "cart",
    },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
            <Button variant="ghost" size="sm">
              Mark all as read
            </Button>
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
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
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
                        <notification.icon
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
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-purple-500 flex-shrink-0 mt-2" />
                          )}
                        </div>
                        <p className="text-sm text-white/60 mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/40">{notification.time}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-400 hover:text-purple-300"
                            onClick={() =>
                              onNavigate(notification.actionPage, notification.actionData)
                            }
                          >
                            {notification.actionText}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {notifications
              .filter((n) => n.type === "order")
              .map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
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
                          <notification.icon
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
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-purple-500 flex-shrink-0 mt-2" />
                            )}
                          </div>
                          <p className="text-sm text-white/60 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/40">{notification.time}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-400 hover:text-purple-300"
                              onClick={() =>
                                onNavigate(notification.actionPage, notification.actionData)
                              }
                            >
                              {notification.actionText}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </TabsContent>

          <TabsContent value="promotions" className="space-y-4">
            {notifications
              .filter((n) => n.type === "sale" || n.type === "promotion")
              .map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
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
                          <notification.icon
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
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-purple-500 flex-shrink-0 mt-2" />
                            )}
                          </div>
                          <p className="text-sm text-white/60 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/40">{notification.time}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-400 hover:text-purple-300"
                              onClick={() =>
                                onNavigate(notification.actionPage, notification.actionData)
                              }
                            >
                              {notification.actionText}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {notifications.length === 0 && (
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
