import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SellerHeader } from "./components/SellerHeader";
import { Footer } from "./components/Footer";
import { ChatWidget } from "./components/ChatWidget";
import { HomePage } from "./components/pages/HomePage";
import { ShopPage } from "./components/pages/ShopPage";
import { ProductDetailPage } from "./components/pages/ProductDetailPage";
import { CartPage } from "./components/pages/CartPage";
import { CheckoutPage } from "./components/pages/CheckoutPage";
import { OrderTrackingPage } from "./components/pages/OrderTrackingPage";
import { ProfilePage } from "./components/pages/ProfilePage";
import { DashboardPage } from "./components/pages/DashboardPage";
import { SellerProductsPage } from "./components/pages/SellerProductsPage";
import { SellerOrdersPage } from "./components/pages/SellerOrdersPage";
import { AddProductPage } from "./components/pages/AddProductPage";
import { LoginPage } from "./components/pages/LoginPage";
import { ForgotPasswordPage } from "./components/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/pages/ResetPasswordPage";
import { 
  AboutPage, 
  ContactPage, 
  TermsPage, 
  PrivacyPage,
  CareersPage,
  ReturnsPage,
  ShippingPage,
  CookiesPage,
  GDPRPage
} from "./components/pages/StaticPages";
import { NotificationsPage } from "./components/pages/NotificationsPage";
import { WishlistPage } from "./components/pages/WishlistPage";
import { SettingsPage } from "./components/pages/SettingsPage";
import { HelpPage } from "./components/pages/HelpPage";
import { ChatPage } from "./components/pages/ChatPage";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";

export interface CartItem {
  id: number;
  product: any;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface WishlistItem {
  id: number;
  product: any;
}

export interface User {
  email: string;
  name: string;
  userType: "buyer" | "seller";
}

type Page =
  | "home"
  | "shop"
  | "product"
  | "cart"
  | "checkout"
  | "orders"
  | "profile"
  | "dashboard"
  | "seller-products"
  | "seller-orders"
  | "add-product"
  | "edit-product"
  | "login"
  | "forgot-password"
  | "reset-password"
  | "about"
  | "contact"
  | "terms"
  | "privacy"
  | "help"
  | "wishlist"
  | "notifications"
  | "chat"
  | "settings"
  | "careers"
  | "returns"
  | "shipping"
  | "cookies"
  | "gdpr";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [pageData, setPageData] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Apply dark mode to html element
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const navigate = (page: Page, data?: any) => {
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo(0, 0);
  };

  const handleLogin = (email: string, password: string, userType: "buyer" | "seller") => {
    // Simulate authentication
    const newUser: User = {
      email,
      name: email.split("@")[0],
      userType,
    };
    setUser(newUser);
    setIsAuthenticated(true);
    toast.success(`Welcome back, ${newUser.name}!`);
    
    // Navigate based on user type
    if (userType === "seller") {
      navigate("dashboard");
    } else {
      navigate("home");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCartItems([]);
    setWishlistItems([]);
    toast.success("Logged out successfully");
    navigate("home");
  };

  const requireAuth = (action: () => void, actionName: string = "perform this action") => {
    if (!isAuthenticated) {
      toast.error(`Please login to ${actionName}`);
      navigate("login");
      return false;
    }
    action();
    return true;
  };

  const addToCart = (product: any, quantity: number, selectedColor?: string, selectedSize?: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("login");
      return;
    }

    setCartItems((prev) => {
      // Check if item with same product, color, and size already exists
      const existingItemIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updated = [...prev];
        updated[existingItemIndex].quantity += quantity;
        return updated;
      } else {
        // Add new item
        return [
          ...prev,
          {
            id: Date.now(),
            product,
            quantity,
            selectedColor,
            selectedSize,
          },
        ];
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateCartQuantity = (itemId: number, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const addToWishlist = (product: any) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      navigate("login");
      return;
    }

    setWishlistItems((prev) => {
      // Check if product already in wishlist
      if (prev.some((item) => item.product.id === product.id)) {
        return prev;
      }
      return [...prev, { id: Date.now(), product }];
    });
  };

  const removeFromWishlist = (itemId: number) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some((item) => item.product.id === productId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <HomePage 
            onNavigate={navigate}
            onAddToCart={addToCart}
            onAddToWishlist={addToWishlist}
            isInWishlist={isInWishlist}
          />
        );
      case "shop":
        return (
          <ShopPage 
            onNavigate={navigate} 
            initialCategory={pageData?.category}
            onAddToCart={addToCart}
            onAddToWishlist={addToWishlist}
            isInWishlist={isInWishlist}
          />
        );
      case "product":
        return (
          <ProductDetailPage
            product={pageData}
            onNavigate={navigate}
            onAddToCart={addToCart}
            onAddToWishlist={addToWishlist}
            onRemoveFromWishlist={removeFromWishlist}
            isInWishlist={isInWishlist(pageData?.id)}
          />
        );
      case "cart":
        if (!isAuthenticated) {
          toast.error("Please login to view your cart");
          setTimeout(() => navigate("login"), 100);
          return (
            <div className="container mx-auto px-4 py-16 text-center">
              <p className="text-white/60">Redirecting to login...</p>
            </div>
          );
        }
        return (
          <CartPage
            onNavigate={navigate}
            cartItems={cartItems}
            onRemoveItem={removeFromCart}
            onUpdateQuantity={updateCartQuantity}
          />
        );
      case "checkout":
        if (!isAuthenticated) {
          toast.error("Please login to checkout");
          setTimeout(() => navigate("login"), 100);
          return (
            <div className="container mx-auto px-4 py-16 text-center">
              <p className="text-white/60">Redirecting to login...</p>
            </div>
          );
        }
        return <CheckoutPage onNavigate={navigate} cartItems={cartItems} />;
      case "orders":
        if (!isAuthenticated) {
          toast.error("Please login to view your orders");
          setTimeout(() => navigate("login"), 100);
          return (
            <div className="container mx-auto px-4 py-16 text-center">
              <p className="text-white/60">Redirecting to login...</p>
            </div>
          );
        }
        return <OrderTrackingPage onNavigate={navigate} />;
      case "profile":
        if (!isAuthenticated) {
          toast.error("Please login to view your profile");
          setTimeout(() => navigate("login"), 100);
          return (
            <div className="container mx-auto px-4 py-16 text-center">
              <p className="text-white/60">Redirecting to login...</p>
            </div>
          );
        }
        return <ProfilePage onNavigate={navigate} onLogout={handleLogout} user={user} />;
      case "dashboard":
        if (!isAuthenticated || user?.userType !== "seller") {
          toast.error("Access denied. Seller account required.");
          setTimeout(() => navigate("home"), 100);
          return (
            <div className="container mx-auto px-4 py-16 text-center">
              <p className="text-white/60">Redirecting...</p>
            </div>
          );
        }
        return <DashboardPage onNavigate={navigate} />;
      case "seller-products":
        if (!isAuthenticated || user?.userType !== "seller") {
          toast.error("Access denied. Seller account required.");
          setTimeout(() => navigate("home"), 100);
          return (
            <div className="container mx-auto px-4 py-16 text-center">
              <p className="text-white/60">Redirecting...</p>
            </div>
          );
        }
        return <SellerProductsPage onNavigate={navigate} />;
      case "seller-orders":
        if (!isAuthenticated || user?.userType !== "seller") {
          toast.error("Access denied. Seller account required.");
          setTimeout(() => navigate("home"), 100);
          return (
            <div className="container mx-auto px-4 py-16 text-center">
              <p className="text-white/60">Redirecting...</p>
            </div>
          );
        }
        return <SellerOrdersPage onNavigate={navigate} />;
      case "add-product":
        if (!isAuthenticated || user?.userType !== "seller") {
          toast.error("Access denied. Seller account required.");
          setTimeout(() => navigate("home"), 100);
          return (
            <div className="container mx-auto px-4 py-16 text-center">
              <p className="text-white/60">Redirecting...</p>
            </div>
          );
        }
        return <AddProductPage onNavigate={navigate} />;
      case "edit-product":
        if (!isAuthenticated || user?.userType !== "seller") {
          toast.error("Access denied. Seller account required.");
          setTimeout(() => navigate("home"), 100);
          return (
            <div className="container mx-auto px-4 py-16 text-center">
              <p className="text-white/60">Redirecting...</p>
            </div>
          );
        }
        return <AddProductPage onNavigate={navigate} />;
      case "login":
        return <LoginPage onNavigate={navigate} onLogin={handleLogin} />;
      case "forgot-password":
        return <ForgotPasswordPage onNavigate={navigate} />;
      case "reset-password":
        return <ResetPasswordPage onNavigate={navigate} />;
      case "about":
        return <AboutPage />;
      case "contact":
        return <ContactPage />;
      case "terms":
        return <TermsPage />;
      case "privacy":
        return <PrivacyPage />;
      case "notifications":
        if (!isAuthenticated) {
          toast.error("Please login to view notifications");
          setTimeout(() => navigate("login"), 100);
          return (
            <div className="container mx-auto px-4 py-16 text-center">
              <p className="text-white/60">Redirecting to login...</p>
            </div>
          );
        }
        return <NotificationsPage onNavigate={navigate} />;
      case "wishlist":
        if (!isAuthenticated) {
          toast.error("Please login to view your wishlist");
          setTimeout(() => navigate("login"), 100);
          return (
            <div className="container mx-auto px-4 py-16 text-center">
              <p className="text-white/60">Redirecting to login...</p>
            </div>
          );
        }
        return (
          <WishlistPage
            onNavigate={navigate}
            wishlistItems={wishlistItems}
            onRemoveItem={removeFromWishlist}
            onAddToCart={addToCart}
          />
        );
      case "settings":
        if (!isAuthenticated) {
          toast.error("Please login to access settings");
          setTimeout(() => navigate("login"), 100);
          return (
            <div className="container mx-auto px-4 py-16 text-center">
              <p className="text-white/60">Redirecting to login...</p>
            </div>
          );
        }
        return <SettingsPage onNavigate={navigate} />;
      case "help":
        return <HelpPage onNavigate={navigate} />;
      case "chat":
        if (!isAuthenticated) {
          toast.error("Please login to chat with sellers");
          setTimeout(() => navigate("login"), 100);
          return (
            <div className="container mx-auto px-4 py-16 text-center">
              <p className="text-white/60">Redirecting to login...</p>
            </div>
          );
        }
        return <ChatPage onNavigate={navigate} sellerInfo={pageData} />;
      case "careers":
        return <CareersPage />;
      case "returns":
        return <ReturnsPage />;
      case "shipping":
        return <ShippingPage />;
      case "cookies":
        return <CookiesPage />;
      case "gdpr":
        return <GDPRPage />;
      default:
        return (
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl text-white mb-4">Page Under Construction</h1>
            <p className="text-white/60 mb-8">This page is coming soon!</p>
            <button
              onClick={() => navigate("home")}
              className="text-purple-400 hover:text-purple-300"
            >
              ← Back to Home
            </button>
          </div>
        );
    }
  };

  const isSellerPage = ["dashboard", "seller-products", "seller-orders", "add-product", "edit-product"].includes(currentPage);
  const isSeller = user?.userType === "seller";
  const showSellerHeader = isAuthenticated && isSeller && isSellerPage;
  const showBuyerHeader = currentPage !== "login" && currentPage !== "forgot-password" && currentPage !== "reset-password" && !showSellerHeader;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {showSellerHeader && (
        <SellerHeader
          currentPage={currentPage}
          onNavigate={navigate}
          onLogout={handleLogout}
          user={user}
        />
      )}
      
      {showBuyerHeader && (
        <Header
          currentPage={currentPage}
          onNavigate={navigate}
          cartCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
          wishlistCount={wishlistItems.length}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
        />
      )}
      
      <main className="flex-1">
        {renderPage()}
      </main>

      {showBuyerHeader && (
        <>
          <Footer onNavigate={navigate} />
          {isAuthenticated && !isSeller && <ChatWidget />}
        </>
      )}
      
      <Toaster />
    </div>
  );
}
