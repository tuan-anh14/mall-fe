import { Package, ShoppingBag, BarChart3, LogOut, Store, Home } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface SellerHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  user: any;
}

export function SellerHeader({ currentPage, onNavigate, onLogout, user }: SellerHeaderProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "seller-products", label: "Products", icon: Package },
    { id: "seller-orders", label: "Orders", icon: ShoppingBag },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate("dashboard")}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl text-white">Seller Portal</h1>
              <p className="text-xs text-white/60">Manage your store</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`gap-2 ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("home")}
              className="hidden md:flex"
            >
              <Home className="h-4 w-4 mr-2" />
              Browse Shop
            </Button>
            <div className="hidden sm:block text-right">
              <p className="text-sm text-white">{user?.name || "Seller"}</p>
              <p className="text-xs text-white/60">Seller Account</p>
            </div>
            <Avatar 
              className="h-10 w-10 cursor-pointer border-2 border-white/10"
              onClick={() => onNavigate("profile")}
            >
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                {user?.name?.[0]?.toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="hidden md:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`gap-2 flex-shrink-0 ${
                  isActive
                    ? "text-white bg-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 flex-shrink-0 text-white/60 hover:text-white hover:bg-white/5"
            onClick={() => onNavigate("home")}
          >
            <Home className="h-4 w-4" />
            Browse Shop
          </Button>
        </nav>
      </div>
    </header>
  );
}
