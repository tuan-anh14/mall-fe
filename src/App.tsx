import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
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
  GDPRPage,
} from "./components/pages/StaticPages";
import { NotificationsPage } from "./components/pages/NotificationsPage";
import { WishlistPage } from "./components/pages/WishlistPage";
import { SettingsPage } from "./components/pages/SettingsPage";
import { HelpPage } from "./components/pages/HelpPage";
import { ChatPage } from "./components/pages/ChatPage";
import { SellerProfilePage } from "./components/pages/SellerProfilePage";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
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

// Map page name → URL path (for simple pages without dynamic segments)
const PAGE_TO_PATH: Record<string, string> = {
  home: "/",
  shop: "/shop",
  product: "/product",
  cart: "/cart",
  checkout: "/checkout",
  orders: "/orders",
  profile: "/profile",
  dashboard: "/dashboard",
  "seller-products": "/seller/products",
  "seller-orders": "/seller/orders",
  "add-product": "/seller/add-product",
  "edit-product": "/seller/edit-product",
  login: "/login",
  "forgot-password": "/forgot-password",
  "reset-password": "/reset-password",
  about: "/about",
  contact: "/contact",
  terms: "/terms",
  privacy: "/privacy",
  help: "/help",
  wishlist: "/wishlist",
  notifications: "/notifications",
  chat: "/chat",
  settings: "/settings",
  careers: "/careers",
  returns: "/returns",
  shipping: "/shipping",
  cookies: "/cookies",
  gdpr: "/gdpr",
  "seller-profile": "/seller-profile",
};

// Derive the Page name from a pathname (for header/footer logic)
const PATHNAME_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([page, path]) => [path, page])
);

function getPageFromPathname(pathname: string): string {
  if (pathname.startsWith("/product/")) return "product";
  return PATHNAME_TO_PAGE[pathname] ?? "home";
}

export default function App() {
  const reactNavigate = useNavigate();
  const location = useLocation();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Derive current page from URL
  const currentPage = getPageFromPathname(location.pathname);

  // Apply dark mode to html element
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Restore session on mount + handle reset-password token in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetToken = params.get("token");
    if (resetToken) {
      // Move token from query string into route state for security
      reactNavigate("/reset-password", { state: { token: resetToken }, replace: true });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // navigate() keeps the same string signature as before so no child component changes
  const navigate = (page: string, data?: any) => {
    window.scrollTo(0, 0);

    if (page === "product" && data?.id) {
      // Cache product so the page survives F5
      try { sessionStorage.setItem(`product_${data.id}`, JSON.stringify(data)); } catch {}
      reactNavigate(`/product/${data.id}`, { state: data });
    } else if (page === "shop") {
      const params = new URLSearchParams();
      if (data?.category) params.set("category", data.category);
      if (data?.search) params.set("search", data.search);
      const qs = params.toString();
      reactNavigate(qs ? `/shop?${qs}` : "/shop");
    } else if (page === "orders" && data?.orderId) {
      reactNavigate(`/orders?orderId=${encodeURIComponent(data.orderId)}`);
    } else if (page === "seller-profile" && data?.sellerUserId) {
      reactNavigate(`/seller-profile?userId=${encodeURIComponent(data.sellerUserId)}`);
    } else if (page === "chat") {
      // Cache sellerInfo so chat survives F5
      if (data) { try { sessionStorage.setItem("chat_seller", JSON.stringify(data)); } catch {} }
      reactNavigate("/chat", { state: data });
    } else if (page === "edit-product") {
      // Cache product data so edit form survives F5
      if (data) { try { sessionStorage.setItem("edit_product", JSON.stringify(data)); } catch {} }
      reactNavigate("/seller/edit-product", { state: data });
    } else {
      reactNavigate(PAGE_TO_PATH[page] ?? "/");
    }
  };

  const fetchCartAndWishlist = async () => {
    const [cartRes, wishlistRes] = await Promise.allSettled([
      get<{ cart: { items: CartItem[] } }>("/api/v1/cart"),
      get<{ items: WishlistItem[] }>("/api/v1/wishlist"),
    ]);
    if (cartRes.status === "fulfilled") setCartItems(cartRes.value.cart?.items ?? []);
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
      throw new Error("Not authenticated");
    }
    try {
      const body: any = { productId: product.id, quantity };
      if (selectedColor) body.color = selectedColor;
      if (selectedSize) body.size = selectedSize;
      const res = await post<{ cart: { items: CartItem[] } }>("/api/v1/cart/items", body);
      setCartItems(res.cart?.items ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart");
      throw err;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await del<{ cart: { items: CartItem[] } }>(`/api/v1/cart/items/${itemId}`);
      setCartItems(res.cart?.items ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove from cart");
    }
  };

  const updateCartQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await put<{ cart: { items: CartItem[] } }>(`/api/v1/cart/items/${itemId}`, { quantity });
      setCartItems(res.cart?.items ?? []);
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

  // --- sessionStorage fallback helpers ---
  const readSession = (key: string): any => {
    try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
  };

  // Resolve data for pages that pass objects via location.state (survives F5 via sessionStorage)
  const productId = location.pathname.match(/^\/product\/(.+)$/)?.[1];
  const productData = (location.state as any) ?? (productId ? readSession(`product_${productId}`) : null);

  const chatData =
    location.pathname === "/chat"
      ? ((location.state as any) ?? readSession("chat_seller"))
      : null;

  const editProductData =
    location.pathname === "/seller/edit-product"
      ? ((location.state as any) ?? readSession("edit_product"))
      : null;

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
  const showBuyerHeader =
    currentPage !== "login" &&
    currentPage !== "forgot-password" &&
    currentPage !== "reset-password" &&
    !showSellerHeader;

  // Helpers for protected routes
  const authRedirect = (msg: string) => {
    toast.error(msg);
    return <Navigate to="/login" replace />;
  };
  const sellerRedirect = (msg: string) => {
    toast.error(msg);
    return <Navigate to="/" replace />;
  };

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
          onSearch={(q) => navigate("shop", { search: q })}
        />
      )}

      <main className="flex-1">
        <Routes>
          {/* Public pages */}
          <Route
            path="/"
            element={
              <HomePage
                onNavigate={navigate}
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
                isInWishlist={isInWishlist}
              />
            }
          />
          <Route
            path="/shop"
            element={
              <ShopPage
                onNavigate={navigate}
                initialCategory={new URLSearchParams(location.search).get("category") ?? undefined}
                initialSearch={new URLSearchParams(location.search).get("search") ?? undefined}
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
                isInWishlist={isInWishlist}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              productData ? (
                <ProductDetailPage
                  product={productData}
                  onNavigate={navigate}
                  onAddToCart={addToCart}
                  onAddToWishlist={addToWishlist}
                  onRemoveFromWishlist={removeFromWishlist}
                  isInWishlist={isInWishlist(productData?.id)}
                  isAuthenticated={isAuthenticated}
                />
              ) : (
                <Navigate to="/shop" replace />
              )
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/help" element={<HelpPage onNavigate={navigate} />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/gdpr" element={<GDPRPage />} />
          <Route
            path="/seller-profile"
            element={
              <SellerProfilePage
                onNavigate={navigate as any}
                sellerUserId={new URLSearchParams(location.search).get("userId") ?? undefined}
              />
            }
          />

          {/* Auth pages */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={user?.userType === "seller" ? "/dashboard" : "/"} replace />
              ) : (
                <LoginPage onNavigate={navigate} onLogin={handleLogin} onRegister={handleRegister} />
              )
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage onNavigate={navigate} />} />
          <Route
            path="/reset-password"
            element={
              <ResetPasswordPage
                onNavigate={navigate}
                token={(location.state as any)?.token ?? new URLSearchParams(location.search).get("token")}
              />
            }
          />

          {/* Buyer protected pages */}
          <Route
            path="/cart"
            element={
              !isAuthenticated
                ? authRedirect("Please login to view your cart")
                : <CartPage onNavigate={navigate} cartItems={cartItems} onRemoveItem={removeFromCart} onUpdateQuantity={updateCartQuantity} />
            }
          />
          <Route
            path="/checkout"
            element={
              !isAuthenticated
                ? authRedirect("Please login to checkout")
                : <CheckoutPage onNavigate={navigate} cartItems={cartItems} onOrderPlaced={() => setCartItems([])} user={user} />
            }
          />
          <Route
            path="/orders"
            element={
              !isAuthenticated
                ? authRedirect("Please login to view your orders")
                : <OrderTrackingPage onNavigate={navigate} orderId={new URLSearchParams(location.search).get("orderId") ?? undefined} />
            }
          />
          <Route
            path="/profile"
            element={
              !isAuthenticated
                ? authRedirect("Please login to view your profile")
                : <ProfilePage onNavigate={navigate} onLogout={handleLogout} user={user} />
            }
          />
          <Route
            path="/notifications"
            element={
              !isAuthenticated
                ? authRedirect("Please login to view notifications")
                : <NotificationsPage onNavigate={navigate} />
            }
          />
          <Route
            path="/wishlist"
            element={
              !isAuthenticated
                ? authRedirect("Please login to view your wishlist")
                : <WishlistPage onNavigate={navigate} wishlistItems={wishlistItems} onRemoveItem={removeFromWishlist} onAddToCart={addToCart} />
            }
          />
          <Route
            path="/settings"
            element={
              !isAuthenticated
                ? authRedirect("Please login to access settings")
                : <SettingsPage onNavigate={navigate} onLogout={handleLogout} />
            }
          />
          <Route
            path="/chat"
            element={
              !isAuthenticated
                ? authRedirect("Please login to chat with sellers")
                : <ChatPage onNavigate={navigate} sellerInfo={chatData} userId={user?.id} userType={user?.userType} />
            }
          />

          {/* Seller protected pages */}
          <Route
            path="/dashboard"
            element={
              !isAuthenticated || user?.userType !== "seller"
                ? sellerRedirect("Access denied. Seller account required.")
                : <DashboardPage onNavigate={navigate} />
            }
          />
          <Route
            path="/seller/products"
            element={
              !isAuthenticated || user?.userType !== "seller"
                ? sellerRedirect("Access denied. Seller account required.")
                : <SellerProductsPage onNavigate={navigate} />
            }
          />
          <Route
            path="/seller/orders"
            element={
              !isAuthenticated || user?.userType !== "seller"
                ? sellerRedirect("Access denied. Seller account required.")
                : <SellerOrdersPage onNavigate={navigate} />
            }
          />
          <Route
            path="/seller/add-product"
            element={
              !isAuthenticated || user?.userType !== "seller"
                ? sellerRedirect("Access denied. Seller account required.")
                : <AddProductPage onNavigate={navigate} />
            }
          />
          <Route
            path="/seller/edit-product"
            element={
              !isAuthenticated || user?.userType !== "seller"
                ? sellerRedirect("Access denied. Seller account required.")
                : <AddProductPage onNavigate={navigate} initialProduct={editProductData} />
            }
          />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl text-white mb-4">Page Under Construction</h1>
                <p className="text-white/60 mb-8">This page is coming soon!</p>
                <button onClick={() => navigate("home")} className="text-purple-400 hover:text-purple-300">
                  ← Back to Home
                </button>
              </div>
            }
          />
        </Routes>
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
