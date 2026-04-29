import {
  LayoutDashboard,
  Users,
  Tag,
  Ticket,
  Star,
  UserCheck,
  Package,
  BarChart3,
  LogOut,
  ShoppingCart,
  Menu,
  History,
  Wallet,
  Shield,
  BookOpen,
  Mail,
  DollarSign,
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { User } from "../types";
import { cn } from "./ui/utils";

interface AdminHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  user?: User | null;
}

const navItems = [
  { page: "admin-dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { page: "admin-accounts", label: "Tài khoản", icon: Users },
  { page: "admin-categories", label: "Danh mục", icon: Tag },
  { page: "admin-blogs", label: "Bài viết", icon: BookOpen },
  { page: "admin-coupons", label: "Mã giảm giá", icon: Ticket },
  { page: "admin-reviews", label: "Đánh giá", icon: Star },
  { page: "admin-seller-requests", label: "Duyệt Seller", icon: UserCheck },
  { page: "admin-products", label: "Sản phẩm", icon: Package },
  { page: "admin-stats", label: "Thống kê", icon: BarChart3 },
  { page: "admin-audit-log", label: "Audit Log", icon: History },
  { page: "admin-wallets", label: "Ví người dùng", icon: Wallet },
  { page: "admin-finance", label: "Tài chính", icon: DollarSign },
  { page: "admin-contacts", label: "Liên hệ", icon: Mail },
];

export function AdminHeader({ currentPage, onNavigate, onLogout, user }: AdminHeaderProps) {
  const getInitials = (name: string) => {
    if (!name) return "A";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-800 bg-primary shadow-md">
      {/* Cùng họ màu với Kênh người bán (primary #1A56DB) */}
      <div className="h-0.5 w-full bg-gradient-to-r from-sky-300/90 via-white/40 to-indigo-300/80" aria-hidden />

      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-[3.25rem] items-center gap-3 sm:gap-4">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-blue-100 hover:bg-white/15 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-[min(100%,280px)] flex-col border-slate-200 bg-white p-0"
            >
              <div className="border-b border-blue-800/20 bg-primary px-4 py-4 text-white">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Quản trị</p>
                    <p className="text-[11px] text-blue-100">Shop HUB</p>
                  </div>
                </div>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
                {navItems.map(({ page, label, icon: Icon }) => {
                  const active = currentPage === page;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => onNavigate(page)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                        active
                          ? "border border-blue-100 bg-blue-50 text-blue-900 shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active ? "text-primary" : "text-slate-400",
                        )}
                      />
                      {label}
                    </button>
                  );
                })}
                <div className="my-2 border-t border-slate-100" />
                <Button
                  variant="ghost"
                  className="justify-start rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => onNavigate("home")}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Về cửa hàng
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          <button
            type="button"
            onClick={() => onNavigate("admin-dashboard")}
            className="flex min-w-0 items-center gap-2 rounded-xl py-1 text-left transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-white">Quản trị</p>
              <p className="truncate text-[11px] text-blue-100">Shop HUB</p>
            </div>
          </button>

          <nav className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto py-1 [scrollbar-width:thin] lg:flex">
            {navItems.map(({ page, label, icon: Icon }) => {
              const active = currentPage === page;
              return (
                <Button
                  key={page}
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate(page)}
                  className={cn(
                    "h-8 shrink-0 rounded-lg px-2.5 text-xs font-medium sm:h-9 sm:px-3 sm:text-sm",
                    active
                      ? "bg-white/20 text-white hover:bg-white/25 hover:text-white"
                      : "text-blue-100 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {label}
                </Button>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden text-blue-100 hover:bg-white/10 hover:text-white md:inline-flex"
              onClick={() => onNavigate("home")}
            >
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              Cửa hàng
            </Button>
            {user && (
              <div className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80" onClick={() => onNavigate("profile")}>
                <span className="hidden max-w-[8rem] truncate text-xs text-blue-100 lg:inline lg:max-w-[10rem] lg:text-sm lg:text-white font-medium">
                  {user.name}
                </span>
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-white/20 shadow-sm overflow-hidden bg-blue-700">
                  {user.avatar ? <AvatarImage src={user.avatar} className="object-cover" /> : null}
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-medium text-xs sm:text-sm">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-100 hover:bg-white/10 hover:text-white"
              onClick={onLogout}
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
