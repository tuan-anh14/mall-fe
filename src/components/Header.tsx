import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Heart,
  Bell,
  MessageCircle,
  Settings,
  LogOut,
  Package,
  Store,
  Shield,
  Wallet,
  ChevronRight,
  ArrowRight,
  Trash2,
  CheckCheck,
  TrendingUp,
  BookOpen,
  PenTool,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { User as UserType } from "../types";
import { get, put } from "../lib/api";
import { formatCurrency } from "../lib/currency";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartCount?: number;
  wishlistCount?: number;
  notificationCount?: number;
  unreadChatCount?: number;
  isAuthenticated?: boolean;
  user?: UserType | null;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  onBecomeSellerRequest?: (message?: string) => Promise<void>;
  onNotificationsOpen?: () => void;
}

interface MiniNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface MiniCartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image?: string | null;
  };
}

interface PlatformPromotion {
  id: string;
  code: string;
  name?: string | null;
  description?: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number | string;
  minOrderAmount?: number | string | null;
}

function formatRelTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút`;
  if (h < 24) return `${h} giờ`;
  if (d === 1) return "hôm qua";
  return `${d} ngày`;
}

function getNotifIcon(type: string) {
  switch (type?.toUpperCase()) {
    case "ORDER": return Package;
    case "SALE":
    case "PROMOTION": return TrendingUp;
    default: return Bell;
  }
}

function getPromotionDiscountLabel(promotion: PlatformPromotion): string {
  return promotion.type === "PERCENTAGE"
    ? `${promotion.value}%`
    : formatCurrency(Number(promotion.value));
}

function getPromotionBannerText(promotion: PlatformPromotion): string {
  const discountLabel = getPromotionDiscountLabel(promotion);
  const title = promotion.name || `Giảm ${discountLabel}`;
  const description = promotion.description || `Dùng mã ${promotion.code} để nhận ưu đãi ${discountLabel}`;
  const minOrderText = promotion.minOrderAmount
    ? ` Đơn tối thiểu ${formatCurrency(Number(promotion.minOrderAmount))}.`
    : "";

  return `${title} - ${description}.${minOrderText}`.replace(/\.\s*\./g, ".").trim();
}

export function Header({
  currentPage,
  onNavigate,
  cartCount = 0,
  wishlistCount = 0,
  notificationCount = 0,
  unreadChatCount = 0,
  isAuthenticated = false,
  user = null,
  onLogout,
  onSearch,
  onBecomeSellerRequest,
  onNotificationsOpen,
}: HeaderProps) {
  console.log("[Header] Rendering with counts:", { notificationCount, unreadChatCount, isAuthenticated });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSellerDialog, setShowSellerDialog] = useState(false);
  const [sellerMessage, setSellerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification dropdown state
  const [notifOpen, setNotifOpen] = useState(false);
  const [miniNotifs, setMiniNotifs] = useState<MiniNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [localUnread, setLocalUnread] = useState(notificationCount);

  // Cart dropdown state
  const [cartOpen, setCartOpen] = useState(false);
  const [miniCart, setMiniCart] = useState<MiniCartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [promotions, setPromotions] = useState<PlatformPromotion[]>([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  // Auto-cycle promotions
  useEffect(() => {
    if (promotions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promotions.length);
    }, 3000); // Cycle every 6 seconds
    return () => clearInterval(interval);
  }, [promotions.length]);

  // Keep localUnread in sync with prop
  useEffect(() => {
    setLocalUnread(notificationCount);
  }, [notificationCount]);

  useEffect(() => {
    let isMounted = true;

    const fetchPromotions = async () => {
      try {
        const res = await get<{ promotions: PlatformPromotion[] }>("/api/v1/products/promotions");
        if (isMounted) {
          console.log("[Header] Promotions fetched:", res.promotions);
          setPromotions(res.promotions ?? []);
        }
      } catch {
        if (isMounted) {
          setPromotions([]);
        }
      }
    };

    fetchPromotions();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchMiniNotifs = useCallback(async () => {
    if (!isAuthenticated) return;
    setNotifLoading(true);
    try {
      const res = await get<{ notifications: MiniNotification[] }>("/api/v1/notifications?page=1&limit=5");
      console.log("[Header] Mini notifications fetched:", res.notifications);
      setMiniNotifs(res.notifications ?? []);
    } catch {
      /* ignore */
    } finally {
      setNotifLoading(false);
    }
  }, [isAuthenticated]);

  const fetchMiniCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setCartLoading(true);
    try {
      const res = await get<{ cart: { items: MiniCartItem[]; subtotal?: number; total?: number } }>("/api/v1/cart");
      console.log("[Header] Mini cart fetched:", res.cart);
      const items = res.cart?.items ?? [];
      setMiniCart(items);
      setCartTotal(res.cart?.subtotal ?? res.cart?.total ?? items.reduce((s, i) => s + i.product.price * i.quantity, 0));
    } catch {
      /* ignore */
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await put("/api/v1/notifications/read-all");
      setMiniNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setLocalUnread(0);
    } catch { /* ignore */ }
  };

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) {
      if (onSearch) onSearch(q);
      else onNavigate("shop");
      setSearchQuery("");
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSellerSubmit = async () => {
    if (!onBecomeSellerRequest) return;
    setIsSubmitting(true);
    try {
      await onBecomeSellerRequest(sellerMessage || undefined);
      setShowSellerDialog(false);
      setSellerMessage("");
    } catch {
      // error toast handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBuyer = user?.userType === "buyer";
  const isAdmin = user?.userType === "admin";
  const isSeller = user?.userType === "seller";
  const hasPendingRequest = user?.sellerRequestStatus === "PENDING";
  const hasRejectedRequest = user?.sellerRequestStatus === "REJECTED";
  const currentPromotion = promotions[currentPromoIndex];
  const currentBannerText = currentPromotion ? getPromotionBannerText(currentPromotion) : null;

  const navItems = [
    { key: "home", label: "Trang chủ", icon: <TrendingUp className="h-4.5 w-4.5" /> },
    { key: "shop", label: "Cửa hàng", icon: <Package className="h-4.5 w-4.5" /> },
    { key: "blog", label: "Blog", icon: <BookOpen className="h-4.5 w-4.5" /> },
    { key: "about", label: "Giới thiệu", icon: <User className="h-4.5 w-4.5" /> },
    { key: "contact", label: "Liên hệ", icon: <ArrowRight className="h-4.5 w-4.5" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        {/* Top Banner */}
        {currentPromotion && (
          <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 py-1.5 overflow-hidden h-7 flex items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentPromotion.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="text-[11px] text-blue-100/80 tracking-wide text-center w-full"
              >
                <span className="font-mono font-semibold text-amber-300">{currentPromotion.code}</span>
                <span className="mx-2 text-blue-200/50">|</span>
                {currentBannerText}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
        <div className="hidden bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 py-1.5">
          <p className="text-xs text-blue-100/80 tracking-wide text-center w-full">
            🎉 Sale Black Friday — Giảm đến <span className="font-semibold text-amber-300">50%</span> cho các sản phẩm được chọn!
          </p>
        </div>

        {/* Main Header */}
        <div className="bg-primary/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-blue-950/10">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between gap-4">
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] p-0 bg-white/95 backdrop-blur-xl border-r border-white/20 flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.1)]">
                  {/* Premium Mobile Header */}
                  <div className="relative p-6 pt-10 overflow-hidden">
                    {/* Decorative Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 opacity-95" />
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <circle cx="10" cy="10" r="15" fill="white" />
                        <circle cx="90" cy="30" r="20" fill="white" />
                        <circle cx="50" cy="80" r="10" fill="white" />
                      </svg>
                    </div>

                    <div className="relative z-10 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner group cursor-pointer" onClick={() => onNavigate("home")}>
                          <ShoppingCart className="h-5.5 w-5.5 text-white" />
                        </div>
                        {isAuthenticated && (
                          <div className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-bold text-white uppercase tracking-wider">
                            {isAdmin ? "Admin" : isSeller ? "Seller" : "Buyer"}
                          </div>
                        )}
                      </div>

                      {isAuthenticated ? (
                        <div className="flex items-center gap-3 mt-2">
                          <div className="relative">
                            <div className="h-14 w-14 rounded-2xl border-2 border-white/40 shadow-lg overflow-hidden bg-white/10">
                              {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-blue-500/20">
                                  <User className="h-7 w-7 text-white/80" />
                                </div>
                              )}
                            </div>
                            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-400 border-2 border-blue-700 rounded-full shadow-sm"></span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-lg leading-tight truncate">{user?.name}</h3>
                            <p className="text-blue-100/70 text-xs truncate mt-0.5">{user?.email}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <h3 className="text-white font-bold text-lg">Chào mừng bạn!</h3>
                          <p className="text-blue-100/70 text-xs mt-0.5">Khám phá hàng ngàn ưu đãi tại ShopMall</p>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="mt-4 bg-white text-blue-700 hover:bg-blue-50 font-bold px-5 rounded-lg shadow-lg"
                            onClick={() => onNavigate("login")}
                          >
                            Đăng nhập ngay
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation Content */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-8 scrollbar-hide">
                    {/* Main Nav Section */}
                    <div className="space-y-1.5">
                      {navItems.map((item) => (
                        <Button
                          key={item.key}
                          variant="ghost"
                          className={`w-full justify-start h-12 gap-3 px-4 rounded-[14px] transition-all duration-300 relative group ${currentPage === item.key
                            ? "bg-blue-50 text-blue-700 shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          onClick={() => onNavigate(item.key)}
                        >
                          <div className={`p-2 rounded-lg transition-colors ${currentPage === item.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                            }`}>
                            {item.icon}
                          </div>
                          <span className="text-sm font-medium">{item.label}</span>
                          {currentPage === item.key && (
                            <motion.div
                              layoutId="active-mobile-pill"
                              className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-600"
                            />
                          )}
                        </Button>
                      ))}

                      {/* Quick Logout for Mobile (Avoiding GTranslate overlap) */}
                      {isAuthenticated && (
                        <>
                          <div className="h-px bg-gray-100/60 my-2 mx-4" />
                          <Button
                            variant="ghost"
                            onClick={onLogout}
                            className="w-full justify-start h-12 gap-3 px-4 rounded-[14px] text-red-500 hover:text-red-600 hover:bg-red-50 transition-all group"
                          >
                            <div className="p-2 rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100 transition-colors">
                              <LogOut className="h-4.5 w-4.5" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-wider">Đăng xuất</span>
                          </Button>
                        </>
                      )}
                    </div>


                    {/* Role-specific Quick Links */}
                    {isAuthenticated && (isAdmin || isBuyer) && (
                      <div className="space-y-1.5">
                        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-3">Dành cho bạn</p>
                        {isAdmin && (
                          <Button variant="ghost" className="w-full justify-start h-12 gap-3 px-4 rounded-[14px] text-red-600 hover:bg-red-50 bg-red-50/30 mb-1" onClick={() => onNavigate("admin-dashboard")}>
                            <div className="p-2 rounded-lg bg-red-100 text-red-600"><Shield className="h-4.5 w-4.5" /></div>
                            <span className="text-sm font-semibold">Admin Dashboard</span>
                          </Button>
                        )}
                        {isBuyer && !isSeller && (
                          hasPendingRequest ? (
                            <div className="flex items-center gap-3 px-4 h-12 rounded-[14px] bg-amber-50/50 border border-amber-100 opacity-80 mb-1 ml-0 px-4">
                              <div className="p-2 rounded-lg bg-amber-100/50 text-amber-600"><Store className="h-4.5 w-4.5" /></div>
                              <span className="text-sm font-medium text-amber-700">Đã gửi yêu cầu bán hàng</span>
                            </div>
                          ) : (
                            <Button variant="ghost" className="w-full justify-start h-12 gap-3 px-4 rounded-[14px] text-blue-600 hover:bg-blue-50 border border-blue-100 mb-1" onClick={() => setShowSellerDialog(true)}>
                              <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><Store className="h-4.5 w-4.5" /></div>
                              <span className="text-sm font-semibold">{hasRejectedRequest ? "Gửi lại yêu cầu" : "Trở thành Người bán"}</span>
                            </Button>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Foot Actions */}
                  <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col items-center justify-center">
                    <p className="text-[10px] text-gray-400 font-medium">© 2026 ShopMall. All rights reserved.</p>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <div
                className="flex items-center gap-2.5 cursor-pointer group"
                onClick={() => onNavigate("home")}
              >
                <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl tracking-tight text-white">
                  <span className="font-light">Shop</span>{" "}
                  <span className="font-bold">MALL</span>
                </span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-0.5">
                {navItems.map((item) => (
                  <Button
                    key={item.key}
                    variant="ghost"
                    onClick={() => onNavigate(item.key)}
                    className={`relative rounded-lg px-4 h-9 text-sm transition-all duration-200 ${currentPage === item.key
                      ? "bg-white/20 text-white font-medium"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    {item.label}
                  </Button>
                ))}
                {isBuyer && (
                  hasPendingRequest ? (
                    <Button
                      variant="ghost"
                      disabled
                      className="text-white/40 border border-white/10 opacity-70 cursor-not-allowed rounded-lg h-9 text-sm ml-1"
                    >
                      <Store className="h-4 w-4 mr-1.5" />
                      Đã gửi yêu cầu
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => setShowSellerDialog(true)}
                      className="text-white/80 hover:text-white hover:bg-white/15 border border-white/20 rounded-lg h-9 text-sm ml-1 transition-all duration-200"
                    >
                      <Store className="h-4 w-4 mr-1.5" />
                      {hasRejectedRequest ? "Gửi lại yêu cầu" : "Trở thành Người bán"}
                    </Button>
                  )
                )}
                {isAdmin && (
                  <Button
                    variant={currentPage.startsWith("admin") ? "default" : "ghost"}
                    onClick={() => onNavigate("admin-dashboard")}
                    className="bg-white/10 hover:bg-white/20 text-white hover:text-white border border-white/20 rounded-lg h-9 text-sm ml-1 transition-all duration-200"
                  >
                    <Shield className="h-4 w-4 mr-1.5" />
                    Admin
                  </Button>
                )}
              </nav>

              {/* Search Bar */}
              <div className="hidden md:flex flex-1 max-w-md">
                <div className="relative w-full">
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10 pr-20 h-10 bg-white/10 border-white/25 text-white placeholder:text-white/60 rounded-xl backdrop-blur-sm focus:bg-white/15 focus:border-white/40 transition-all"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white z-10" size={16} strokeWidth={2.5} />
                  <Button
                    size="sm"
                    onClick={handleSearch}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-white h-7 px-3 rounded-lg text-xs font-medium shadow-sm transition-all duration-200"
                  >
                    Tìm kiếm
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {isAuthenticated && (
                  <DropdownMenu open={notifOpen} onOpenChange={(open) => { setNotifOpen(open); if (open) fetchMiniNotifs(); }}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex relative h-9 w-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                      >
                        <Bell className="h-[18px] w-[18px]" />
                        {localUnread > 0 && (
                          <Badge className="absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px] rounded-full px-1 flex items-center justify-center text-[10px] font-bold bg-amber-500 text-white border-2 border-blue-700">
                            {localUnread > 99 ? "99+" : localUnread}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 bg-white border-gray-200 rounded-xl shadow-xl shadow-gray-900/10 p-0 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-900">Thông báo</span>
                        {localUnread > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Đọc tất cả
                          </button>
                        )}
                      </div>
                      {/* List */}
                      <div className="max-h-[340px] overflow-y-auto">
                        {notifLoading ? (
                          <div className="flex items-center justify-center py-8 text-gray-400 text-sm">Đang tải...</div>
                        ) : miniNotifs.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <Bell className="h-8 w-8 mb-2 opacity-30" />
                            <span className="text-sm">Không có thông báo</span>
                          </div>
                        ) : (
                          miniNotifs.map((n) => {
                            const Icon = getNotifIcon(n.type);
                            return (
                              <div
                                key={n.id}
                                onClick={() => { setNotifOpen(false); onNotificationsOpen?.(); onNavigate("notifications"); }}
                                className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.isRead ? "bg-blue-50/40" : ""}`}
                              >
                                <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.type?.toUpperCase() === "ORDER" ? "bg-blue-100" : n.type?.toUpperCase() === "PROMOTION" ? "bg-amber-100" : "bg-gray-100"}`}>
                                  <Icon className={`h-4 w-4 ${n.type?.toUpperCase() === "ORDER" ? "text-blue-600" : n.type?.toUpperCase() === "PROMOTION" ? "text-amber-600" : "text-gray-500"}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm leading-tight truncate ${!n.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                                  <p className="text-[11px] text-gray-400 mt-1">{formatRelTime(n.createdAt)}</p>
                                </div>
                                {!n.isRead && <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                      {/* Footer */}
                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => { setNotifOpen(false); onNotificationsOpen?.(); onNavigate("notifications"); }}
                          className="flex items-center justify-center gap-1.5 w-full py-3 text-sm text-blue-600 hover:text-blue-700 hover:bg-gray-50 font-medium transition-colors"
                        >
                          Xem tất cả thông báo
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onNavigate("chat")}
                    className="hidden md:flex relative h-9 w-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <MessageCircle className="h-[18px] w-[18px]" />
                    {unreadChatCount > 0 && (
                      <Badge className="absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px] rounded-full px-1 flex items-center justify-center text-[10px] font-bold bg-amber-500 text-white border-2 border-blue-700">
                        {unreadChatCount > 99 ? "99+" : unreadChatCount}
                      </Badge>
                    )}
                  </Button>
                )}

                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onNavigate("wishlist")}
                    className="hidden md:flex relative h-9 w-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <Heart className="h-[18px] w-[18px]" />
                    {wishlistCount > 0 && (
                      <Badge className="absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px] rounded-full px-1 flex items-center justify-center text-[10px] font-bold bg-amber-500 text-white border-2 border-blue-700">
                        {wishlistCount}
                      </Badge>
                    )}
                  </Button>
                )}

                <div className="w-px h-6 bg-white/10 mx-1 hidden md:block" />

                <DropdownMenu open={cartOpen} onOpenChange={(open) => { setCartOpen(open); if (open) fetchMiniCart(); }}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-9 w-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                      <ShoppingCart className="h-[18px] w-[18px]" />
                      {cartCount > 0 && (
                        <Badge className="absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px] rounded-full px-1 flex items-center justify-center text-[10px] font-bold bg-amber-500 text-white border-2 border-blue-700">
                          {cartCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-white border-gray-200 rounded-xl shadow-xl shadow-gray-900/10 p-0 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">Giỏ hàng</span>
                        <button
                          onClick={() => { setCartOpen(false); onNavigate("cart"); }}
                          className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                        >
                          (Xem tất cả)
                        </button>
                      </div>
                      {cartCount > 0 && <span className="text-xs text-gray-500">{cartCount} sản phẩm</span>}
                    </div>
                    {/* List */}
                    <div className="max-h-[320px] overflow-y-auto">
                      {cartLoading ? (
                        <div className="flex items-center justify-center py-8 text-gray-400 text-sm">Đang tải...</div>
                      ) : miniCart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                          <ShoppingCart className="h-8 w-8 mb-2 opacity-30" />
                          <span className="text-sm">Giỏ hàng trống</span>
                        </div>
                      ) : (
                        miniCart.slice(0, 5).map((item) => (
                          <div key={item.id} className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {item.product.image ? (
                                <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <ShoppingCart className="h-5 w-5 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 font-medium truncate">{item.product.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">x{item.quantity}</p>
                              <p className="text-sm text-blue-600 font-semibold mt-0.5">{formatCurrency(item.product.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {/* Footer */}
                    {miniCart.length > 0 && (
                      <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Tổng cộng</span>
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(cartTotal)}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setCartOpen(false); onNavigate("cart"); }}
                            className="flex-1 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg font-medium transition-colors"
                          >
                            Xem giỏ hàng
                          </button>
                          <button
                            onClick={() => { setCartOpen(false); onNavigate("checkout"); }}
                            className="flex-1 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                          >
                            Thanh toán
                          </button>
                        </div>
                      </div>
                    )}
                    {miniCart.length === 0 && (
                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => { setCartOpen(false); onNavigate("shop"); }}
                          className="flex items-center justify-center gap-1.5 w-full py-3 text-sm text-blue-600 hover:text-blue-700 hover:bg-gray-50 font-medium transition-colors"
                        >
                          Tiếp tục mua sắm
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Dropdown */}
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="h-full w-full rounded-lg object-cover" />
                        ) : (
                          <User className="h-[18px] w-[18px]" />
                        )}
                        <div className="absolute -bottom-0 -right-0 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-blue-700" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200 rounded-xl shadow-xl shadow-gray-900/10 p-1.5">
                      <div className="px-3 py-3 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md mt-2 inline-block ${isAdmin ? "bg-red-50 text-red-600" : isSeller ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                          }`}>
                          {isAdmin ? "Admin" : isSeller ? "Người bán" : "Người mua"}
                        </span>
                      </div>
                      <DropdownMenuSeparator className="bg-gray-100" />
                      <DropdownMenuItem onClick={() => onNavigate("profile")} className="text-gray-700 hover:text-gray-900 cursor-pointer rounded-lg h-9">
                        <User className="h-4 w-4 mr-2.5 text-gray-400" />
                        Hồ sơ cá nhân
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate("orders")} className="text-gray-700 hover:text-gray-900 cursor-pointer rounded-lg h-9">
                        <Package className="h-4 w-4 mr-2.5 text-gray-400" />
                        Đơn hàng của tôi
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate("wallet")} className="text-gray-700 hover:text-gray-900 cursor-pointer rounded-lg h-9">
                        <Wallet className="h-4 w-4 mr-2.5 text-gray-400" />
                        Ví của tôi
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate("settings")} className="text-gray-700 hover:text-gray-900 cursor-pointer rounded-lg h-9">
                        <Settings className="h-4 w-4 mr-2.5 text-gray-400" />
                        Cài đặt
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator className="bg-gray-100" />
                          <DropdownMenuItem
                            onClick={() => onNavigate("admin-dashboard")}
                            className="text-red-600 hover:text-red-700 cursor-pointer rounded-lg h-9"
                          >
                            <Shield className="h-4 w-4 mr-2.5" />
                            Admin Dashboard
                          </DropdownMenuItem>
                        </>
                      )}
                      {isBuyer && (
                        <>
                          <DropdownMenuSeparator className="bg-gray-100" />
                          {hasPendingRequest ? (
                            <DropdownMenuItem
                              disabled
                              className="text-amber-600/60 opacity-70 cursor-not-allowed rounded-lg h-9"
                            >
                              <Store className="h-4 w-4 mr-2.5" />
                              Đã gửi yêu cầu bán hàng
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => setShowSellerDialog(true)}
                              className="text-blue-600 hover:text-blue-700 cursor-pointer rounded-lg h-9"
                            >
                              <Store className="h-4 w-4 mr-2.5" />
                              {hasRejectedRequest ? "Gửi lại yêu cầu bán hàng" : "Trở thành Người bán"}
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => onNavigate("my-blogs")}
                        className="text-gray-700 hover:text-gray-900 cursor-pointer rounded-lg h-9"
                      >
                        <PenTool className="h-4 w-4 mr-2.5 text-gray-400" />
                        Bài viết của tôi
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-100" />
                      <DropdownMenuItem onClick={onLogout} className="text-red-600 hover:text-red-700 cursor-pointer rounded-lg h-9">
                        <LogOut className="h-4 w-4 mr-2.5" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onNavigate("login")}
                    className="bg-amber-500 hover:bg-amber-400 text-white rounded-lg h-9 px-4 text-sm font-medium shadow-sm shadow-amber-500/20 transition-all duration-200 hover:-translate-y-px"
                  >
                    Đăng nhập
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Become Seller Dialog */}
      <Dialog open={showSellerDialog} onOpenChange={setShowSellerDialog}>
        <DialogContent className="bg-white border-gray-200 max-w-md rounded-2xl">
          <DialogHeader>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 mb-3">
              <Store className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-gray-900 text-xl font-bold">
              Đăng ký trở thành Người bán
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Yêu cầu của bạn sẽ được Admin xem xét và phê duyệt. Bạn sẽ được thông báo sau khi có kết quả.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Lý do muốn trở thành người bán <span className="text-gray-400">(tuỳ chọn)</span>
              </label>
              <textarea
                value={sellerMessage}
                onChange={(e) => setSellerMessage(e.target.value)}
                placeholder="Ví dụ: Tôi muốn bán đồ điện tử, phụ kiện công nghệ..."
                rows={3}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 border border-gray-200 rounded-xl h-11 hover:bg-gray-50"
                onClick={() => setShowSellerDialog(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 shadow-sm shadow-blue-600/20 transition-all duration-200"
                onClick={handleSellerSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
