import { useState } from "react";
import { Search, ShoppingCart, User, Menu, Heart, Bell, Settings, LogOut, Package, LayoutDashboard } from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { User as UserType } from "../App";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartCount?: number;
  wishlistCount?: number;
  isAuthenticated?: boolean;
  user?: UserType | null;
  onLogout?: () => void;
}

export function Header({ 
  currentPage, 
  onNavigate, 
  cartCount = 0, 
  wishlistCount = 0,
  isAuthenticated = false,
  user = null,
  onLogout
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-center">
        <p className="text-sm text-white">
          🎉 Black Friday Sale - Up to 50% OFF on selected items! Limited time only
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
            <SheetContent side="left" className="w-[300px] bg-zinc-950 border-white/10">
              <nav className="flex flex-col gap-4 mt-8">
                <Button
                  variant={currentPage === "home" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => onNavigate("home")}
                >
                  Home
                </Button>
                <Button
                  variant={currentPage === "shop" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => onNavigate("shop")}
                >
                  Shop
                </Button>
                <Button
                  variant={currentPage === "about" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => onNavigate("about")}
                >
                  About
                </Button>
                <Button
                  variant={currentPage === "contact" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => onNavigate("contact")}
                >
                  Contact
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("home")}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl tracking-tight text-white">ShopHub</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Button
              variant={currentPage === "home" ? "default" : "ghost"}
              onClick={() => onNavigate("home")}
            >
              Home
            </Button>
            <Button
              variant={currentPage === "shop" ? "default" : "ghost"}
              onClick={() => onNavigate("shop")}
            >
              Shop
            </Button>
            <Button
              variant={currentPage === "about" ? "default" : "ghost"}
              onClick={() => onNavigate("about")}
            >
              About
            </Button>
            <Button
              variant={currentPage === "contact" ? "default" : "ghost"}
              onClick={() => onNavigate("contact")}
            >
              Contact
            </Button>
            {user?.userType === "seller" && (
              <Button
                variant={currentPage === "dashboard" ? "default" : "ghost"}
                onClick={() => onNavigate("dashboard")}
                className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Seller Dashboard
              </Button>
            )}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button variant="ghost" size="icon" onClick={() => onNavigate("notifications")} className="hidden md:flex relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  2
                </Badge>
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

            <div className="relative">
              {isAuthenticated ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onNavigate("profile")}
                  className="relative"
                >
                  <User className="h-5 w-5" />
                  <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full border border-black" />
                </Button>
              ) : (
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => onNavigate("login")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
