import React, { useState, useEffect } from "react";
import { User, ShoppingBag, Heart, Settings, LogOut, Package, LayoutDashboard } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";
import { get } from "../../lib/api";

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
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function getStatusBadgeClass(status: string): string {
  const s = status?.toLowerCase();
  if (s === "delivered") return "bg-green-500/20 text-green-400 border-green-500/30";
  if (s === "cancelled" || s === "refunded") return "bg-red-500/20 text-red-400 border-red-500/30";
  return "bg-blue-500/20 text-blue-400 border-blue-500/30";
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
    toast.error("Account deletion is not available in demo mode");
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      toast.error("Logout function not available");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-white/10 rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-white/10">
            <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-500 to-blue-500">
              {profileLoading ? "..." : displayAvatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl text-white mb-2">
              {profileLoading ? "Loading..." : displayName}
            </h1>
            <p className="text-white/60 mb-1">{displayEmail}</p>
            {displayMemberSince && (
              <p className="text-sm text-white/50">Member since {displayMemberSince}</p>
            )}
            {displayUserType && (
              <Badge className="mt-2 bg-purple-500/20 text-purple-400 border-purple-500/30">
                {displayUserType === "seller" ? "Seller Account" : "Buyer Account"}
              </Badge>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {displayUserType === "seller" && (
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600"
                onClick={() => onNavigate("dashboard")}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Seller Dashboard
              </Button>
            )}
            <Button variant="outline" onClick={() => onNavigate("settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <ShoppingBag className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <p className="text-3xl text-white mb-1">
            {ordersLoading ? "—" : ordersTotal}
          </p>
          <p className="text-sm text-white/60">Total Orders</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <Package className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <p className="text-3xl text-white mb-1">
            {ordersLoading ? "—" : inTransitCount}
          </p>
          <p className="text-sm text-white/60">In Transit</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <Heart className="h-8 w-8 text-pink-400 mx-auto mb-2" />
          <p className="text-3xl text-white mb-1">
            {wishlistLoading ? "—" : wishlistItems.length}
          </p>
          <p className="text-sm text-white/60">Wishlist</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <span className="text-3xl mb-2 block">💰</span>
          <p className="text-3xl text-white mb-1">
            {ordersLoading
              ? "—"
              : `$${orders.reduce((sum, o) => sum + Number(o.total), 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          </p>
          <p className="text-sm text-white/60">Total Spent</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="w-full justify-start bg-white/5 border-b border-white/10 rounded-none">
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-8">
          {ordersLoading ? (
            <div className="text-white/60 text-center py-12">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-4">No orders yet.</p>
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600"
                onClick={() => onNavigate("shop")}
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const orderDate = order.date ?? order.createdAt;
                const formattedDate = orderDate
                  ? new Date(orderDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—";

                return (
                  <div
                    key={order.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all cursor-pointer"
                    onClick={() => onNavigate("orders", { orderId: order.id })}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div>
                        <h3 className="text-xl text-white mb-1">Order {order.id}</h3>
                        <p className="text-sm text-white/60">Placed on {formattedDate}</p>
                      </div>
                      <Badge className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </Badge>
                    </div>

                    <div className="flex gap-4 mb-4">
                      {order.items.slice(0, 3).map((item) => {
                        const imgSrc = item.productImage ?? item.product?.image;
                        const imgAlt = item.productName ?? item.product?.name ?? "Product";
                        return (
                          <div
                            key={item.id}
                            className="w-20 h-20 bg-white/5 rounded-lg overflow-hidden flex-shrink-0"
                          >
                            <ImageWithFallback
                              src={imgSrc}
                              alt={imgAlt}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        );
                      })}
                      {order.items.length > 3 && (
                        <div className="w-20 h-20 bg-white/5 rounded-lg flex items-center justify-center">
                          <span className="text-white/50">+{order.items.length - 3}</span>
                        </div>
                      )}
                    </div>

                    <Separator className="bg-white/10 mb-4" />

                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-white/60">Total: </span>
                        <span className="text-xl text-white">${Number(order.total).toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2">
                        {order.status?.toLowerCase() !== "delivered" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate("orders", { orderId: order.id });
                            }}
                          >
                            Track Order
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate("orders", { orderId: order.id });
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="mt-8">
          {wishlistLoading ? (
            <div className="text-white/60 text-center py-12">Loading wishlist...</div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-4">Your wishlist is empty.</p>
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600"
                onClick={() => onNavigate("shop")}
              >
                Discover Products
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-white/60">{wishlistItems.length} saved item{wishlistItems.length !== 1 ? "s" : ""}</p>
                <Button variant="ghost" size="sm" className="text-purple-400" onClick={() => onNavigate("wishlist")}>
                  View All →
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {wishlistItems.slice(0, 8).map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group"
                    onClick={() => onNavigate("product", item.product)}
                  >
                    <div className="aspect-square overflow-hidden bg-white/5">
                      <ImageWithFallback
                        src={item.product?.image}
                        alt={item.product?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-white text-sm line-clamp-2 mb-1">{item.product?.name}</p>
                      <p className="text-purple-400 font-semibold">${Number(item.product?.price ?? 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {wishlistItems.length > 8 && (
                <div className="text-center mt-6">
                  <Button variant="outline" onClick={() => onNavigate("wishlist")}>
                    View All {wishlistItems.length} Items
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-8">
          <div className="max-w-2xl">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-xl text-white mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white">Email Notifications</p>
                      <p className="text-sm text-white/60">
                        Receive updates about your orders
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onNavigate("settings")}>
                      Configure
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white">Password</p>
                      <p className="text-sm text-white/60">Change your password</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onNavigate("settings")}>
                      Update
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white">Payment Methods</p>
                      <p className="text-sm text-white/60">Manage saved cards</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onNavigate("settings")}>
                      Manage
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white">Shipping Addresses</p>
                      <p className="text-sm text-white/60">Manage delivery addresses</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onNavigate("settings")}>
                      Manage
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="text-xl text-white mb-4">Danger Zone</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10"
                    onClick={handleLogoutClick}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10"
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
