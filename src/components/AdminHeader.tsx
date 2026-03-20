import {
  LayoutDashboard,
  Users,
  Tag,
  Ticket,
  Star,
  UserCheck,
  BarChart3,
  LogOut,
  ShoppingCart,
  Menu,
  History,
  Wallet,
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { User } from "../types";

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
  { page: "admin-coupons", label: "Mã giảm giá", icon: Ticket },
  { page: "admin-reviews", label: "Đánh giá", icon: Star },
  { page: "admin-seller-requests", label: "Duyệt Seller", icon: UserCheck },
  { page: "admin-stats", label: "Thống kê", icon: BarChart3 },
  { page: "admin-audit-log", label: "Audit Log", icon: History },
  { page: "admin-wallets", label: "Ví người dùng", icon: Wallet },
];

export function AdminHeader({ currentPage, onNavigate, onLogout, user }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-red-500/20 bg-background/90 backdrop-blur-xl">
      <div className="bg-gradient-to-r from-red-700 to-orange-600 px-4 py-1.5 text-center">
        <p className="text-xs text-foreground font-medium">Admin Dashboard — ShopHub</p>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] bg-card border-border">
              <nav className="flex flex-col gap-2 mt-8">
                {navItems.map(({ page, label, icon: Icon }) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => onNavigate(page)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="justify-start text-muted-foreground mt-4"
                  onClick={() => onNavigate("home")}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Về trang chủ
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate("admin-dashboard")}
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-foreground" />
            </div>
            <span className="text-base font-semibold text-foreground hidden sm:block">Admin</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {navItems.map(({ page, label, icon: Icon }) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => onNavigate(page)}
                className={
                  currentPage === page
                    ? "bg-red-600/90 hover:bg-red-700 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                <Icon className="h-4 w-4 mr-1.5" />
                {label}
              </Button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hidden md:flex"
              onClick={() => onNavigate("home")}
            >
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              Shop
            </Button>
            {user && (
              <span className="text-muted-foreground text-sm hidden md:block">
                {user.name}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-red-400"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
