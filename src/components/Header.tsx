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
  const hasPendingRequest = user?.sellerRequestStatus === "PENDING";
  const hasRejectedRequest = user?.sellerRequestStatus === "REJECTED";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-xl">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-center">
          <p className="text-sm text-white">
            🎉 Sale Black Friday - Giảm đến 50% cho các sản phẩm được chọn! Chỉ trong thời gian có hạn
          </p>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-card border-border">
                <nav className="flex flex-col gap-4 mt-8">
                  <Button
                    variant={currentPage === "home" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => onNavigate("home")}
                  >
                    Trang chủ
                  </Button>
                  <Button
                    variant={currentPage === "shop" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => onNavigate("shop")}
                  >
                    Cửa hàng
                  </Button>
                  <Button
                    variant={currentPage === "about" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => onNavigate("about")}
                  >
                    Giới thiệu
                  </Button>
                  <Button
                    variant={currentPage === "contact" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => onNavigate("contact")}
                  >
                    Liên hệ
                  </Button>
                  {isBuyer && (
                    hasPendingRequest ? (
                      <Button
                        variant="ghost"
                        disabled
                        className="justify-start text-yellow-400/60 opacity-70 cursor-not-allowed"
                      >
                        <Store className="h-4 w-4 mr-2" />
                        Đã gửi yêu cầu
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="justify-start text-purple-400"
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
                      className="justify-start text-red-400"
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
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("home")}>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xl tracking-tight text-foreground">ShopHub</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Button
                variant={currentPage === "home" ? "default" : "ghost"}
                onClick={() => onNavigate("home")}
              >
                Trang chủ
              </Button>
              <Button
                variant={currentPage === "shop" ? "default" : "ghost"}
                onClick={() => onNavigate("shop")}
              >
                Cửa hàng
              </Button>
              <Button
                variant={currentPage === "about" ? "default" : "ghost"}
                onClick={() => onNavigate("about")}
              >
                Giới thiệu
              </Button>
              <Button
                variant={currentPage === "contact" ? "default" : "ghost"}
                onClick={() => onNavigate("contact")}
              >
                Liên hệ
              </Button>
              {isBuyer && (
                hasPendingRequest ? (
                  <Button
                    variant="ghost"
                    disabled
                    className="text-yellow-400/60 border border-yellow-500/20 opacity-70 cursor-not-allowed"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Đã gửi yêu cầu
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => setShowSellerDialog(true)}
                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/30"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    {hasRejectedRequest ? "Gửi lại yêu cầu" : "Trở thành Người bán"}
                  </Button>
                )
              )}
              {isAdmin && (
                <Button
                  variant={currentPage.startsWith("admin") ? "default" : "ghost"}
                  onClick={() => onNavigate("admin-dashboard")}
                  className="bg-gradient-to-r from-red-600/20 to-orange-600/20 hover:from-red-600/30 hover:to-orange-600/30 text-red-400 hover:text-red-300 border border-red-500/30"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full flex gap-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10 bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button size="sm" onClick={handleSearch} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-3">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { onNotificationsOpen?.(); onNavigate("notifications"); }}
                  className="hidden md:flex relative"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </Badge>
                  )}
                </Button>
              )}

              {isAuthenticated && (
                <Button variant="ghost" size="icon" onClick={() => onNavigate("chat")} className="hidden md:flex">
                  <MessageCircle className="h-5 w-5" />
                </Button>
              )}

              {isAuthenticated && (
                <Button variant="ghost" size="icon" onClick={() => onNavigate("wishlist")} className="hidden md:flex relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={() => onNavigate("cart")} className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* User Dropdown */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <User className="h-5 w-5" />
                      <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full border border-black" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-secondary border-border">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block ${
                        isAdmin ? "bg-red-500/20 text-red-400" : "bg-purple-500/20 text-purple-400"
                      }`}>
                        {isAdmin ? "Admin" : "Người mua"}
                      </span>
                    </div>
                    <DropdownMenuSeparator className="bg-foreground/10" />
                    <DropdownMenuItem onClick={() => onNavigate("profile")} className="text-muted-foreground hover:text-foreground cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Hồ sơ cá nhân
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("orders")} className="text-muted-foreground hover:text-foreground cursor-pointer">
                      <Package className="h-4 w-4 mr-2" />
                      Đơn hàng của tôi
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("wallet")} className="text-muted-foreground hover:text-foreground cursor-pointer">
                      <Wallet className="h-4 w-4 mr-2" />
                      Ví của tôi
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("settings")} className="text-muted-foreground hover:text-foreground cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Cài đặt
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="bg-foreground/10" />
                        <DropdownMenuItem
                          onClick={() => onNavigate("admin-dashboard")}
                          className="text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </>
                    )}
                    {isBuyer && (
                      <>
                        <DropdownMenuSeparator className="bg-foreground/10" />
                        {hasPendingRequest ? (
                          <DropdownMenuItem
                            disabled
                            className="text-yellow-400/60 opacity-70 cursor-not-allowed"
                          >
                            <Store className="h-4 w-4 mr-2" />
                            Đã gửi yêu cầu bán hàng
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => setShowSellerDialog(true)}
                            className="text-purple-400 hover:text-purple-300 cursor-pointer"
                          >
                            <Store className="h-4 w-4 mr-2" />
                            {hasRejectedRequest ? "Gửi lại yêu cầu bán hàng" : "Trở thành Người bán"}
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-foreground/10" />
                    <DropdownMenuItem onClick={onLogout} className="text-red-400 hover:text-red-300 cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onNavigate("login")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <User className="h-4 w-4 mr-2" />
                  Đăng nhập
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Become Seller Dialog */}
      <Dialog open={showSellerDialog} onOpenChange={setShowSellerDialog}>
        <DialogContent className="bg-secondary border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Store className="h-5 w-5 text-purple-400" />
              Đăng ký trở thành Người bán
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Yêu cầu của bạn sẽ được Admin xem xét và phê duyệt. Bạn sẽ được thông báo sau khi có kết quả.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Lý do muốn trở thành người bán <span className="text-muted-foreground">(tuỳ chọn)</span>
              </label>
              <textarea
                value={sellerMessage}
                onChange={(e) => setSellerMessage(e.target.value)}
                placeholder="Ví dụ: Tôi muốn bán đồ điện tử, phụ kiện công nghệ..."
                rows={3}
                className="w-full rounded-lg bg-foreground/5 border border-border text-white placeholder:text-muted-foreground px-3 py-2 text-sm resize-none focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 border border-border"
                onClick={() => setShowSellerDialog(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
