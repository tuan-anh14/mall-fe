import React, { useState } from "react";
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

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartCount?: number;
  wishlistCount?: number;
  notificationCount?: number;
  isAuthenticated?: boolean;
  user?: UserType | null;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  onBecomeSellerRequest?: (message?: string) => Promise<void>;
  onNotificationsOpen?: () => void;
}

export function Header({
  currentPage,
  onNavigate,
  cartCount = 0,
  wishlistCount = 0,
  notificationCount = 0,
  isAuthenticated = false,
  user = null,
  onLogout,
  onSearch,
  onBecomeSellerRequest,
  onNotificationsOpen,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSellerDialog, setShowSellerDialog] = useState(false);
  const [sellerMessage, setSellerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const navItems = [
    { key: "home", label: "Trang chủ" },
    { key: "shop", label: "Cửa hàng" },
    { key: "about", label: "Giới thiệu" },
    { key: "contact", label: "Liên hệ" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 py-1.5">
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
                <SheetContent side="left" className="w-[300px] bg-white border-gray-200">
                  <div className="flex items-center gap-2 mb-8 mt-2">
                    <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl tracking-tight text-gray-900"><span className="font-light">Shop</span> <span className="font-bold">MALL</span></span>
                  </div>
                  <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <Button
                        key={item.key}
                        variant="ghost"
                        className={`justify-between h-11 rounded-xl transition-all ${
                          currentPage === item.key
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                        onClick={() => onNavigate(item.key)}
                      >
                        {item.label}
                        <ChevronRight className={`h-4 w-4 transition-opacity ${currentPage === item.key ? "opacity-100" : "opacity-0"}`} />
                      </Button>
                    ))}
                    <div className="h-px bg-gray-100 my-3" />
                    {isBuyer && (
                      hasPendingRequest ? (
                        <Button
                          variant="ghost"
                          disabled
                          className="justify-start h-11 rounded-xl text-amber-600/60 opacity-70 cursor-not-allowed"
                        >
                          <Store className="h-4 w-4 mr-2" />
                          Đã gửi yêu cầu
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          className="justify-start h-11 rounded-xl text-blue-600 hover:bg-blue-50"
                          onClick={() => setShowSellerDialog(true)}
                        >
                          <Store className="h-4 w-4 mr-2" />
                          {hasRejectedRequest ? "Gửi lại yêu cầu" : "Trở thành Người bán"}
                        </Button>
                      )
                    )}
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        className="justify-start h-11 rounded-xl text-red-600 hover:bg-red-50"
                        onClick={() => onNavigate("admin-dashboard")}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Button>
                    )}
                  </nav>
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
                    className={`relative rounded-lg px-4 h-9 text-sm transition-all duration-200 ${
                      currentPage === item.key
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
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" color="white" size={16} strokeWidth={2.5} />
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10 pr-20 h-10 bg-white/10 border-white/25 text-white placeholder:text-white/60 rounded-xl backdrop-blur-sm focus:bg-white/15 focus:border-white/40 transition-all"
                  />
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { onNotificationsOpen?.(); onNavigate("notifications"); }}
                    className="hidden md:flex relative h-9 w-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <Bell className="h-[18px] w-[18px]" />
                    {notificationCount > 0 && (
                      <Badge className="absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px] rounded-full px-1 flex items-center justify-center text-[10px] font-bold bg-amber-500 text-white border-2 border-blue-700">
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </Badge>
                    )}
                  </Button>
                )}

                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onNavigate("chat")}
                    className="hidden md:flex h-9 w-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <MessageCircle className="h-[18px] w-[18px]" />
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

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate("cart")}
                  className="relative h-9 w-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <ShoppingCart className="h-[18px] w-[18px]" />
                  {cartCount > 0 && (
                    <Badge className="absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px] rounded-full px-1 flex items-center justify-center text-[10px] font-bold bg-amber-500 text-white border-2 border-blue-700">
                      {cartCount}
                    </Badge>
                  )}
                </Button>

                {/* User Dropdown */}
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200">
                        <User className="h-[18px] w-[18px]" />
                        <div className="absolute -bottom-0 -right-0 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-blue-700" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200 rounded-xl shadow-xl shadow-gray-900/10 p-1.5">
                      <div className="px-3 py-3 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md mt-2 inline-block ${
                          isAdmin ? "bg-red-50 text-red-600" : isSeller ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
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
