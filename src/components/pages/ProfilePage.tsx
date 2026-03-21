import React, { useState, useEffect } from "react";
import { User, ShoppingBag, Heart, Settings, LogOut, Package, LayoutDashboard, ChevronRight, MapPin, CreditCard, Bell, Lock, Shield, Wallet, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner";
import { get } from "../../lib/api";
import { formatCurrency } from "../../lib/currency";

interface ProfilePageProps {
  onNavigate: (page: string, data?: any) => void;
  onLogout?: () => void;
  user?: any;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  memberSince?: string;
  createdAt?: string;
  userType?: string;
}

interface ApiOrder {
  id: string;
  date?: string;
  createdAt?: string;
  status: string;
  total: number;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    productName?: string;
    productImage?: string;
    product?: { id: string; name: string; price: number; image?: string };
  }>;
}

function formatMemberSince(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
}

function getStatusBadgeClass(status: string): string {
  const s = status?.toLowerCase();
  if (s === "delivered") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "cancelled" || s === "refunded") return "bg-red-50 text-red-700 border-red-200";
  if (s === "processing" || s === "confirmed") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export function ProfilePage({ onNavigate, onLogout, user: userProp }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const data = await get<{ user: UserProfile }>("/api/v1/users/me");
        setProfile(data.user);
      } catch {
        // Fall back to userProp
      } finally {
        setProfileLoading(false);
      }
    };

    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const res = await get<{ orders: ApiOrder[]; total: number }>(
          "/api/v1/orders?page=1&limit=5"
        );
        setOrders(res.orders ?? []);
        setOrdersTotal(res.total ?? 0);
      } catch {
        // Leave orders empty
      } finally {
        setOrdersLoading(false);
      }
    };

    const fetchWishlist = async () => {
      setWishlistLoading(true);
      try {
        const res = await get<{ items: any[] }>("/api/v1/wishlist");
        setWishlistItems(res.items ?? []);
      } catch {
        // Leave wishlist empty
      } finally {
        setWishlistLoading(false);
      }
    };

    fetchProfile();
    fetchOrders();
    fetchWishlist();
  }, []);

  // Derive display values: prefer real profile, fall back to userProp
  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : (userProp?.name ?? "");

  const displayEmail = profile?.email ?? userProp?.email ?? "";

  const displayAvatar = profile
    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
    : (userProp?.avatar ?? (displayName ? displayName.slice(0, 2).toUpperCase() : "U"));

  const displayMemberSince = profile
    ? formatMemberSince(profile.memberSince ?? profile.createdAt)
    : (userProp?.memberSince ?? "");

  const displayUserType = profile?.userType ?? userProp?.userType;

  const inTransitCount = orders.filter((o) => {
    const s = o.status?.toLowerCase();
    return s !== "delivered" && s !== "cancelled" && s !== "refunded";
  }).length;

  const handleDeleteAccount = () => {
    toast.error("Không thể xóa tài khoản trong chế độ demo");
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      toast.error("Chức năng đăng xuất không khả dụng");
    }
  };

  const statsData = [
    { icon: ShoppingBag, label: "Tổng đơn hàng", value: ordersLoading ? "—" : ordersTotal, color: "text-blue-600 bg-blue-50" },
    { icon: Package, label: "Đang giao", value: ordersLoading ? "—" : inTransitCount, color: "text-orange-600 bg-orange-50" },
    { icon: Heart, label: "Yêu thích", value: wishlistLoading ? "—" : wishlistItems.length, color: "text-rose-600 bg-rose-50" },
    { icon: Wallet, label: "Tổng chi tiêu", value: ordersLoading ? "—" : formatCurrency(orders.reduce((sum, o) => sum + Number(o.total), 0)), color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 lg:py-10">

      {/* Profile Header */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="h-28 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),transparent_70%)]" />
        </div>
        <div className="px-6 lg:px-8 pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 -mt-12">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-2 ring-white/50">
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                {profileLoading ? "..." : displayAvatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left pt-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {profileLoading ? "Đang tải..." : displayName}
                </h1>
                {displayUserType && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 font-medium text-xs w-fit mx-auto md:mx-0">
                    {displayUserType?.toUpperCase() === "SELLER" ? "Người bán" : "Người mua"}
                  </Badge>
                )}
              </div>
              <p className="text-gray-500 text-sm">{displayEmail}</p>
              {displayMemberSince && (
                <p className="text-xs text-gray-400 mt-0.5">Thành viên từ {displayMemberSince}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pb-1">
              {displayUserType?.toUpperCase() === "SELLER" && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 font-medium shadow-sm"
                  onClick={() => onNavigate("dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Bảng điều khiển
                </Button>
              )}
              <Button variant="outline" onClick={() => onNavigate("settings")} className="rounded-xl h-10 font-medium">
                <Settings className="h-4 w-4 mr-2" />
                Chỉnh sửa hồ sơ
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statsData.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-gray-900 tabular-nums truncate">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
      <Tabs defaultValue="orders" variant="underline" className="w-full">
        <TabsList>
          <TabsTrigger value="orders">
            <ShoppingBag className="h-4 w-4" />
            Đơn hàng
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            <Heart className="h-4 w-4" />
            Yêu thích
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4" />
            Cài đặt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="p-5 lg:p-6">
          {ordersLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm mt-3">Đang tải đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-semibold mb-1">Chưa có đơn hàng</p>
              <p className="text-gray-400 text-sm mb-5">Bắt đầu mua sắm để xem đơn hàng tại đây</p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 font-medium shadow-sm"
                onClick={() => onNavigate("shop")}
              >
                Khám phá cửa hàng
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const orderDate = order.date ?? order.createdAt;
                const formattedDate = orderDate
                  ? new Date(orderDate).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—";

                return (
                  <div
                    key={order.id}
                    className="group bg-gray-50/50 border border-gray-100 rounded-xl p-4 lg:p-5 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => onNavigate("orders", { orderId: order.id })}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900">#{order.id.slice(-8)}</h3>
                          <Badge variant="secondary" className={`text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{formattedDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(Number(order.total))}</span>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.items.slice(0, 4).map((item) => {
                        const imgSrc = item.productImage ?? item.product?.image;
                        const imgAlt = item.productName ?? item.product?.name ?? "Sản phẩm";
                        return (
                          <div
                            key={item.id}
                            className="w-14 h-14 bg-white border border-gray-100 rounded-lg overflow-hidden flex-shrink-0"
                          >
                            <ImageWithFallback
                              src={imgSrc}
                              alt={imgAlt}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        );
                      })}
                      {order.items.length > 4 && (
                        <div className="w-14 h-14 bg-white border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-400 text-xs font-medium">+{order.items.length - 4}</span>
                        </div>
                      )}
                      <span className="text-xs text-gray-400 ml-auto hidden sm:block">{order.items.length} sản phẩm</span>
                    </div>
                  </div>
                );
              })}
              {ordersTotal > 5 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" className="text-blue-600 font-medium" onClick={() => onNavigate("orders")}>
                    Xem tất cả đơn hàng →
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="p-5 lg:p-6">
          {wishlistLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm mt-3">Đang tải yêu thích...</p>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-rose-300" />
              </div>
              <p className="text-gray-900 font-semibold mb-1">Chưa có sản phẩm yêu thích</p>
              <p className="text-gray-400 text-sm mb-5">Lưu sản phẩm bạn thích để dễ dàng tìm lại</p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 font-medium shadow-sm"
                onClick={() => onNavigate("shop")}
              >
                Khám phá sản phẩm
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 text-sm">{wishlistItems.length} sản phẩm đã lưu</p>
                <Button variant="ghost" size="sm" className="text-blue-600 font-medium text-sm" onClick={() => onNavigate("wishlist")}>
                  Xem tất cả →
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {wishlistItems.slice(0, 8).map((item: any) => (
                  <div
                    key={item.id}
                    className="group bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden hover:bg-white hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                    onClick={() => onNavigate("product", item.product)}
                  >
                    <div className="aspect-square overflow-hidden bg-gray-50">
                      <ImageWithFallback
                        src={item.product?.image}
                        alt={item.product?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-gray-900 text-sm font-medium line-clamp-2 leading-snug mb-1.5">{item.product?.name}</p>
                      <p className="text-blue-700 font-bold text-sm tabular-nums">{formatCurrency(Number(item.product?.price ?? 0))}</p>
                    </div>
                  </div>
                ))}
              </div>
              {wishlistItems.length > 8 && (
                <div className="text-center mt-5">
                  <Button variant="outline" onClick={() => onNavigate("wishlist")} className="rounded-xl font-medium">
                    Xem tất cả {wishlistItems.length} sản phẩm
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="p-5 lg:p-6">
          <div className="max-w-2xl">
            <div className="space-y-2">
              {[
                { icon: Bell, label: "Thông báo email", desc: "Nhận cập nhật về đơn hàng của bạn", action: "Cấu hình", color: "text-blue-600 bg-blue-50" },
                { icon: Lock, label: "Mật khẩu", desc: "Đổi mật khẩu tài khoản", action: "Cập nhật", color: "text-violet-600 bg-violet-50" },
                { icon: CreditCard, label: "Phương thức thanh toán", desc: "Quản lý thẻ đã lưu", action: "Quản lý", color: "text-emerald-600 bg-emerald-50" },
                { icon: MapPin, label: "Địa chỉ giao hàng", desc: "Quản lý địa chỉ giao hàng", action: "Quản lý", color: "text-orange-600 bg-orange-50" },
                { icon: Shield, label: "Bảo mật", desc: "Xác thực hai yếu tố & bảo mật", action: "Cài đặt", color: "text-sky-600 bg-sky-50" },
              ].map(({ icon: Icon, label, desc, action, color }) => (
                <div
                  key={label}
                  onClick={() => onNavigate("settings")}
                  className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-semibold">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                </div>
              ))}
            </div>

            <Separator className="bg-gray-100 my-5" />

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-1">Khác</p>
              <div className="space-y-1">
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 cursor-pointer transition-colors group text-left"
                >
                  <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                    <LogOut className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-red-600 text-sm font-semibold">Đăng xuất</p>
                    <p className="text-xs text-gray-400">Đăng xuất khỏi tài khoản</p>
                  </div>
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 cursor-pointer transition-colors group text-left"
                >
                  <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-red-600 text-sm font-semibold">Xóa tài khoản</p>
                    <p className="text-xs text-gray-400">Xóa vĩnh viễn tài khoản và dữ liệu</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      </div>
      </div>
    </div>
  );
}
