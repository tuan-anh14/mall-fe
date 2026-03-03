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
import { get, post, del, put } from "./lib/api";

export interface CartItem {
  id: string;
  productId: string;
  product: any;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: any;
}

export interface User {
  id?: string;
  email: string;
  name: string;
  avatar?: string;
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
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Apply dark mode to html element
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Restore session on mount + handle reset-password token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token");
    if (resetToken) {
      setCurrentPage("reset-password");
      setPageData({ token: resetToken });
      window.history.replaceState({}, "", "/");
    }

    get<{ user: User }>("/api/v1/auth/me")
      .then(async ({ user: me }) => {
        setUser(me);
        setIsAuthenticated(true);
        await fetchCartAndWishlist();
      })
      .catch(() => {
        // Not authenticated, stay as guest
      })
      .finally(() => setIsAuthLoading(false));
  }, []);

  const navigate = (page: Page, data?: any) => {
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo(0, 0);
  };

  const fetchCartAndWishlist = async () => {
    const [cartRes, wishlistRes] = await Promise.allSettled([
      get<{ items: CartItem[] }>("/api/v1/cart"),
      get<{ items: WishlistItem[] }>("/api/v1/wishlist"),
    ]);
    if (cartRes.status === "fulfilled") setCartItems(cartRes.value.items ?? []);
    if (wishlistRes.status === "fulfilled") setWishlistItems(wishlistRes.value.items ?? []);
  };

  const handleLogin = async (email: string, password: string) => {
    const { user: me } = await post<{ user: User }>("/api/v1/auth/login", { email, password });
    setUser(me);
    setIsAuthenticated(true);
    await fetchCartAndWishlist();
    toast.success(`Welcome back, ${me.name}!`);
    if (me.userType === "seller") {
      navigate("dashboard");
    } else {
      navigate("home");
    }
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
    userType: "buyer" | "seller"
  ) => {
    const { user: me } = await post<{ user: User }>("/api/v1/auth/register", {
      name,
      email,
      password,
      userType,
    });
    setUser(me);
    setIsAuthenticated(true);
    await fetchCartAndWishlist();
    toast.success(`Welcome, ${me.name}!`);
    if (me.userType === "seller") {
      navigate("dashboard");
    } else {
      navigate("home");
    }
  };

  const handleLogout = async () => {
    try {
      await post("/api/v1/auth/logout");
    } catch {
      // Session may have already expired
    }
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

  const addToCart = async (product: any, quantity: number, selectedColor?: string, selectedSize?: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("login");
      return;
    }
    try {
      const res = await post<{ items: CartItem[] }>("/api/v1/cart/items", {
        productId: product.id,
        quantity,
        selectedColor: selectedColor ?? null,
        selectedSize: selectedSize ?? null,
      });
      setCartItems(res.items ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart");
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await del<{ items: CartItem[] }>(`/api/v1/cart/items/${itemId}`);
      setCartItems(res.items ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove from cart");
    }
  };

  const updateCartQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await put<{ items: CartItem[] }>(`/api/v1/cart/items/${itemId}`, { quantity });
      setCartItems(res.items ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to update cart");
    }
  };

  const addToWishlist = async (product: any) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      navigate("login");
      return;
    }
    if (wishlistItems.some((item) => item.productId === product.id)) return;
    try {
      const res = await post<{ items: WishlistItem[] }>("/api/v1/wishlist", {
        productId: product.id,
      });
      setWishlistItems(res.items ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to add to wishlist");
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await del<{ items: WishlistItem[] }>(`/api/v1/wishlist/${productId}`);
      setWishlistItems(res.items ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove from wishlist");
    }
  };

  const isInWishlist = (productId: string | number) => {
    return wishlistItems.some((item) => item.productId === String(productId));
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
        return (
          <CheckoutPage
            onNavigate={navigate}
            cartItems={cartItems}
            onOrderPlaced={() => setCartItems([])}
          />
        );
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
        return <OrderTrackingPage onNavigate={navigate} orderId={pageData?.orderId} />;
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
        return <AddProductPage onNavigate={navigate} initialProduct={pageData} />;
      case "login":
        if (isAuthenticated) {
          setTimeout(() => navigate(user?.userType === "seller" ? "dashboard" : "home"), 0);
          return null;
        }
        return <LoginPage onNavigate={navigate} onLogin={handleLogin} onRegister={handleRegister} />;
      case "forgot-password":
        return <ForgotPasswordPage onNavigate={navigate} />;
      case "reset-password":
        return <ResetPasswordPage onNavigate={navigate} token={pageData?.token ?? null} />;
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
        return <SettingsPage onNavigate={navigate} onLogout={handleLogout} />;
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
        return <ChatPage onNavigate={navigate} sellerInfo={pageData} userId={user?.id} />;
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

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading...</div>
      </div>
    );
  }

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
