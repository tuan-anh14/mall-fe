import { lazy, Suspense, useEffect, useRef } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Header } from "./components/Header";
import { SellerHeader } from "./components/SellerHeader";
import { AdminHeader } from "./components/AdminHeader";
import { Footer } from "./components/Footer";
import { ChatWidget } from "./components/ChatWidget";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { useAuth } from "./hooks/useAuth";
import { useCart } from "./hooks/useCart";
import { useWishlist } from "./hooks/useWishlist";
import { useNotificationStream } from "./hooks/useNotificationStream";
import {
  PAGE_TO_PATH,
  SELLER_PAGES,
  ADMIN_PAGES,
  getPageFromPathname,
} from "./constants/routes";
import { ImagePreviewProvider } from "./context/ImagePreviewContext";
import { ImagePreview } from "./components/ui/image-preview";

// Re-export types so existing imports keep working
export type { CartItem, WishlistItem, User } from "./types";

// ─── Lazy page imports ────────────────────────────────────────────────────────
const HomePage = lazy(() =>
  import("./components/pages/HomePage").then((m) => ({ default: m.HomePage })),
);
const ShopPage = lazy(() =>
  import("./components/pages/ShopPage").then((m) => ({ default: m.ShopPage })),
);
const ProductDetailPage = lazy(() =>
  import("./components/pages/ProductDetailPage").then((m) => ({
    default: m.ProductDetailPage,
  })),
);
const CartPage = lazy(() =>
  import("./components/pages/CartPage").then((m) => ({ default: m.CartPage })),
);
const CheckoutPage = lazy(() =>
  import("./components/pages/CheckoutPage").then((m) => ({
    default: m.CheckoutPage,
  })),
);
const OrderTrackingPage = lazy(() =>
  import("./components/pages/OrderTrackingPage").then((m) => ({
    default: m.OrderTrackingPage,
  })),
);
const ProfilePage = lazy(() =>
  import("./components/pages/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  })),
);
const DashboardPage = lazy(() =>
  import("./components/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const SellerProductsPage = lazy(() =>
  import("./components/pages/SellerProductsPage").then((m) => ({
    default: m.SellerProductsPage,
  })),
);
const SellerOrdersPage = lazy(() =>
  import("./components/pages/SellerOrdersPage").then((m) => ({
    default: m.SellerOrdersPage,
  })),
);
const SellerReviewsPage = lazy(() =>
  import("./components/pages/SellerReviewsPage").then((m) => ({
    default: m.SellerReviewsPage,
  })),
);
const SellerCouponsPage = lazy(() =>
  import("./components/pages/SellerCouponsPage").then((m) => ({
    default: m.SellerCouponsPage,
  })),
);
const AddProductPage = lazy(() =>
  import("./components/pages/AddProductPage").then((m) => ({
    default: m.AddProductPage,
  })),
);
const LoginPage = lazy(() =>
  import("./components/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("./components/pages/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("./components/pages/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);
const NotificationsPage = lazy(() =>
  import("./components/pages/NotificationsPage").then((m) => ({
    default: m.NotificationsPage,
  })),
);
const WishlistPage = lazy(() =>
  import("./components/pages/WishlistPage").then((m) => ({
    default: m.WishlistPage,
  })),
);
const SettingsPage = lazy(() =>
  import("./components/pages/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);
const HelpPage = lazy(() =>
  import("./components/pages/HelpPage").then((m) => ({ default: m.HelpPage })),
);
const ChatPage = lazy(() =>
  import("./components/pages/ChatPage").then((m) => ({ default: m.ChatPage })),
);
const SellerProfilePage = lazy(() =>
  import("./components/pages/SellerProfilePage").then((m) => ({
    default: m.SellerProfilePage,
  })),
);
const BuyerProfilePage = lazy(() =>
  import("./components/pages/BuyerProfilePage").then((m) => ({
    default: m.BuyerProfilePage,
  })),
);

// Admin pages
const AdminDashboardPage = lazy(() =>
  import("./components/pages/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const AdminAccountsPage = lazy(() =>
  import("./components/pages/AdminAccountsPage").then((m) => ({
    default: m.AdminAccountsPage,
  })),
);
const AdminCategoriesPage = lazy(() =>
  import("./components/pages/AdminCategoriesPage").then((m) => ({
    default: m.AdminCategoriesPage,
  })),
);
const AdminCouponsPage = lazy(() =>
  import("./components/pages/AdminCouponsPage").then((m) => ({
    default: m.AdminCouponsPage,
  })),
);
const AdminReviewsPage = lazy(() =>
  import("./components/pages/AdminReviewsPage").then((m) => ({
    default: m.AdminReviewsPage,
  })),
);
const AdminSellerRequestsPage = lazy(() =>
  import("./components/pages/AdminSellerRequestsPage").then((m) => ({
    default: m.AdminSellerRequestsPage,
  })),
);
const AdminStatsPage = lazy(() =>
  import("./components/pages/AdminStatsPage").then((m) => ({
    default: m.AdminStatsPage,
  })),
);
const AdminAuditLogPage = lazy(() =>
  import("./components/pages/AdminAuditLogPage").then((m) => ({
    default: m.AdminAuditLogPage,
  })),
);
const WalletDashboard = lazy(() =>
  import("./components/pages/WalletDashboard").then((m) => ({
    default: m.WalletDashboard,
  })),
);
const AdminWalletPage = lazy(() =>
  import("./components/pages/AdminWalletPage").then((m) => ({
    default: m.AdminWalletPage,
  })),
);

// Static pages — one chunk for the whole module
const AboutPage = lazy(() =>
  import("./components/pages/StaticPages").then((m) => ({
    default: m.AboutPage,
  })),
);
const ContactPage = lazy(() =>
  import("./components/pages/StaticPages").then((m) => ({
    default: m.ContactPage,
  })),
);
const TermsPage = lazy(() =>
  import("./components/pages/StaticPages").then((m) => ({
    default: m.TermsPage,
  })),
);
const PrivacyPage = lazy(() =>
  import("./components/pages/StaticPages").then((m) => ({
    default: m.PrivacyPage,
  })),
);
const CareersPage = lazy(() =>
  import("./components/pages/StaticPages").then((m) => ({
    default: m.CareersPage,
  })),
);
const ReturnsPage = lazy(() =>
  import("./components/pages/StaticPages").then((m) => ({
    default: m.ReturnsPage,
  })),
);
const ShippingPage = lazy(() =>
  import("./components/pages/StaticPages").then((m) => ({
    default: m.ShippingPage,
  })),
);
const CookiesPage = lazy(() =>
  import("./components/pages/StaticPages").then((m) => ({
    default: m.CookiesPage,
  })),
);
const GDPRPage = lazy(() =>
  import("./components/pages/StaticPages").then((m) => ({
    default: m.GDPRPage,
  })),
);

// ─── Page loading fallback ────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
    </div>
  );
}

// Redirect component that fires toast only once (avoids calling toast in render)
function RedirectWithToast({ to, message }: { to: string; message: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (!fired.current) {
      fired.current = true;
      toast.error(message);
    }
  }, [message]);
  return <Navigate to={to} replace />;
}

export default function App() {
  const reactNavigate = useNavigate();
  const location = useLocation();

  const {
    user,
    isAuthenticated,
    isAuthLoading,
    checkAuth,
    login,
    register,
    logout,
    becomeSellerRequest,
  } = useAuth();
  const {
    cartItems,
    fetchCart,
    addToCart: cartAdd,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  } = useCart();
  const {
    wishlistItems,
    fetchWishlist,
    addToWishlist: wishlistAdd,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  } = useWishlist();
  const {
    unreadCount: notificationCount,
    latestNotification,
    clearUnread,
  } = useNotificationStream(isAuthenticated);

  const currentPage = getPageFromPathname(location.pathname);

  useEffect(() => {
    document.documentElement.classList.add("light");
  }, []);

  // Show toast for new real-time notifications
  useEffect(() => {
    if (latestNotification) {
      toast(latestNotification.title, {
        description: latestNotification.message,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestNotification]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetToken = params.get("token");
    if (resetToken) {
      reactNavigate("/reset-password", {
        state: { token: resetToken },
        replace: true,
      });
    }
    checkAuth().then((authenticated) => {
      if (authenticated) fetchCartAndWishlist();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = (page: string, data?: any) => {
    window.scrollTo(0, 0);
    if (page === "product" && data?.id) {
      try {
        sessionStorage.setItem(`product_${data.id}`, JSON.stringify(data));
      } catch {}
      reactNavigate(`/product/${data.id}`, { state: data });
    } else if (page === "shop") {
      const params = new URLSearchParams();
      if (data?.category) params.set("category", data.category);
      if (data?.search) params.set("search", data.search);
      const qs = params.toString();
      reactNavigate(qs ? `/shop?${qs}` : "/shop");
    } else if (page === "orders" && data?.orderId) {
      reactNavigate(`/orders?orderId=${encodeURIComponent(data.orderId)}`);
    } else if (page === "buyer-profile" && data?.buyerUserId) {
      reactNavigate(
        `/buyer-profile?userId=${encodeURIComponent(data.buyerUserId)}`,
      );
    } else if (page === "seller-profile" && data?.sellerUserId) {
      reactNavigate(
        `/seller-profile?userId=${encodeURIComponent(data.sellerUserId)}`,
      );
    } else if (page === "chat") {
      if (data) {
        try {
          sessionStorage.setItem("chat_seller", JSON.stringify(data));
        } catch {}
      }
      reactNavigate("/chat", { state: data });
    } else if (page === "edit-product") {
      if (data) {
        try {
          sessionStorage.setItem("edit_product", JSON.stringify(data));
        } catch {}
      }
      reactNavigate("/seller/edit-product", { state: data });
    } else {
      reactNavigate(PAGE_TO_PATH[page] ?? "/");
    }
  };

  const fetchCartAndWishlist = async () => {
    await Promise.allSettled([fetchCart(), fetchWishlist()]);
  };

  const handleLogin = async (email: string, password: string) => {
    const me = await login(email, password);
    await fetchCartAndWishlist();
    if (me.userType === "admin") navigate("admin-dashboard");
    else if (me.userType === "seller") navigate("dashboard");
    else navigate("home");
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
  ) => {
    await register(name, email, password);
    await fetchCartAndWishlist();
    navigate("home");
  };

  const handleLogout = async () => {
    await logout();
    clearCart();
    clearWishlist();
    navigate("home");
  };

  const addToCart = async (
    product: any,
    quantity: number = 1,
    selectedColor?: string,
    selectedSize?: string,
  ) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("login");
      throw new Error("Not authenticated");
    }
    try {
      await cartAdd(product.id, quantity, selectedColor, selectedSize);
    } catch (err: any) {
      toast.error(err.message || "Không thể thêm vào giỏ hàng");
      throw err;
    }
  };

  const addToWishlist = async (product: any) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      navigate("login");
      return;
    }
    if (wishlistItems.some((item) => item.productId === product.id)) return;
    try {
      await wishlistAdd(product.id);
    } catch (err: any) {
      toast.error(err.message || "Không thể thêm vào danh sách yêu thích");
    }
  };

  const readSession = (key: string): any => {
    try {
      const v = sessionStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  };

  const productId = location.pathname.match(/^\/product\/(.+)$/)?.[1];
  const productData =
    (location.state as any) ??
    (productId ? readSession(`product_${productId}`) : null);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Đang tải...</div>
      </div>
    );
  }

  const isSellerPage = SELLER_PAGES.includes(currentPage);
  const isAdminPage = ADMIN_PAGES.includes(currentPage);
  const isSeller = user?.userType === "seller";
  const isAdmin = user?.userType === "admin";
  const showSellerHeader = isAuthenticated && isSeller && isSellerPage;
  const showAdminHeader = isAuthenticated && isAdmin && isAdminPage;
  const showBuyerHeader =
    currentPage !== "login" &&
    currentPage !== "forgot-password" &&
    currentPage !== "reset-password" &&
    !showSellerHeader &&
    !showAdminHeader;

  const authRedirect = (msg: string) => (
    <RedirectWithToast to="/login" message={msg} />
  );
  const sellerRedirect = (msg: string) => (
    <RedirectWithToast to="/" message={msg} />
  );
  const adminRedirect = (msg: string) => (
    <RedirectWithToast to="/" message={msg} />
  );

  return (
    <ImagePreviewProvider>
      <div className="min-h-screen bg-white text-gray-800 flex flex-col">
        <ImagePreview />
        {showSellerHeader && (
        <SellerHeader
          currentPage={currentPage}
          onNavigate={navigate}
          onLogout={handleLogout}
          user={user}
        />
      )}
      {showAdminHeader && (
        <AdminHeader
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
          cartCount={cartItems.reduce(
            (total, item) => total + item.quantity,
            0,
          )}
          wishlistCount={wishlistItems.length}
          notificationCount={notificationCount}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
          onSearch={(q) => navigate("shop", { search: q })}
          onBecomeSellerRequest={becomeSellerRequest}
          onNotificationsOpen={clearUnread}
        />
      )}

      <main
        className={
          showAdminHeader
            ? "flex-1 min-h-0 bg-gray-50/50"
            : "flex-1 min-h-0"
        }
      >
        <Suspense fallback={<PageLoader />}>
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
                  isAuthenticated={isAuthenticated}
                />
              }
            />
            <Route
              path="/shop"
              element={
                <ShopPage
                  onNavigate={navigate}
                  initialCategory={
                    new URLSearchParams(location.search).get("category") ??
                    undefined
                  }
                  initialSearch={
                    new URLSearchParams(location.search).get("search") ??
                    undefined
                  }
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
                    user={user}
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
                  sellerUserId={
                    new URLSearchParams(location.search).get("userId") ??
                    undefined
                  }
                />
              }
            />
            <Route
              path="/buyer-profile"
              element={
                !isAuthenticated ? (
                  authRedirect("Vui lòng đăng nhập")
                ) : (
                  <BuyerProfilePage
                    onNavigate={navigate}
                    buyerUserId={
                      new URLSearchParams(location.search).get("userId") ??
                      undefined
                    }
                  />
                )
              }
            />

            {/* Auth pages */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate
                    to={isAdmin ? "/admin" : isSeller ? "/dashboard" : "/"}
                    replace
                  />
                ) : (
                  <LoginPage
                    onNavigate={navigate}
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                  />
                )
              }
            />
            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage onNavigate={navigate} />}
            />
            <Route
              path="/reset-password"
              element={
                <ResetPasswordPage
                  onNavigate={navigate}
                  token={
                    (location.state as any)?.token ??
                    new URLSearchParams(location.search).get("token")
                  }
                />
              }
            />

            {/* Buyer protected pages */}
            <Route
              path="/cart"
              element={
                !isAuthenticated ? (
                  authRedirect("Vui lòng đăng nhập để xem giỏ hàng")
                ) : (
                  <CartPage
                    onNavigate={navigate}
                    cartItems={cartItems}
                    onRemoveItem={removeFromCart}
                    onUpdateQuantity={updateCartQuantity}
                  />
                )
              }
            />
            <Route
              path="/checkout"
              element={
                !isAuthenticated ? (
                  authRedirect("Vui lòng đăng nhập để thanh toán")
                ) : (
                  <CheckoutPage
                    onNavigate={navigate}
                    cartItems={cartItems}
                    onOrderPlaced={() => clearCart()}
                    user={user}
                  />
                )
              }
            />
            <Route
              path="/orders"
              element={
                !isAuthenticated ? (
                  authRedirect("Vui lòng đăng nhập để xem đơn hàng")
                ) : (
                  <OrderTrackingPage
                    onNavigate={navigate}
                    orderId={
                      new URLSearchParams(location.search).get("orderId") ??
                      undefined
                    }
                  />
                )
              }
            />
            <Route
              path="/profile"
              element={
                !isAuthenticated ? (
                  authRedirect("Vui lòng đăng nhập để xem hồ sơ")
                ) : (
                  <ProfilePage
                    onNavigate={navigate}
                    onLogout={handleLogout}
                    user={user}
                  />
                )
              }
            />
            <Route
              path="/notifications"
              element={
                !isAuthenticated ? (
                  authRedirect("Vui lòng đăng nhập để xem thông báo")
                ) : (
                  <NotificationsPage onNavigate={navigate} />
                )
              }
            />
            <Route
              path="/wishlist"
              element={
                !isAuthenticated ? (
                  authRedirect("Vui lòng đăng nhập để xem danh sách yêu thích")
                ) : (
                  <WishlistPage
                    onNavigate={navigate}
                    wishlistItems={wishlistItems}
                    onRemoveItem={removeFromWishlist}
                    onAddToCart={addToCart}
                  />
                )
              }
            />
            <Route
              path="/settings"
              element={
                !isAuthenticated ? (
                  authRedirect("Vui lòng đăng nhập để truy cập cài đặt")
                ) : (
                  <SettingsPage onNavigate={navigate} onLogout={handleLogout} />
                )
              }
            />
            <Route
              path="/wallet"
              element={
                !isAuthenticated ? (
                  authRedirect("Vui lòng đăng nhập để xem ví")
                ) : (
                  <WalletDashboard onNavigate={navigate} />
                )
              }
            />
            <Route
              path="/chat"
              element={
                !isAuthenticated ? (
                  authRedirect("Vui lòng đăng nhập để trò chuyện với người bán")
                ) : (
                  <ChatPage
                    onNavigate={navigate}
                    sellerInfo={chatData}
                    userId={user?.id}
                    userType={user?.userType}
                    userAvatar={user?.avatar}
                  />
                )
              }
            />

            {/* Seller protected pages */}
            <Route
              path="/dashboard"
              element={
                !isAuthenticated || !isSeller ? (
                  sellerRedirect(
                    "Truy cập bị từ chối. Cần tài khoản người bán.",
                  )
                ) : (
                  <DashboardPage onNavigate={navigate} />
                )
              }
            />
            <Route
              path="/seller/products"
              element={
                !isAuthenticated || !isSeller ? (
                  sellerRedirect(
                    "Truy cập bị từ chối. Cần tài khoản người bán.",
                  )
                ) : (
                  <SellerProductsPage onNavigate={navigate} />
                )
              }
            />
            <Route
              path="/seller/orders"
              element={
                !isAuthenticated || !isSeller ? (
                  sellerRedirect(
                    "Truy cập bị từ chối. Cần tài khoản người bán.",
                  )
                ) : (
                  <SellerOrdersPage onNavigate={navigate} />
                )
              }
            />
            <Route
              path="/seller/reviews"
              element={
                !isAuthenticated || !isSeller ? (
                  sellerRedirect(
                    "Truy cập bị từ chối. Cần tài khoản người bán.",
                  )
                ) : (
                  <SellerReviewsPage onNavigate={navigate} />
                )
              }
            />
            <Route
              path="/seller/coupons"
              element={
                !isAuthenticated || !isSeller ? (
                  sellerRedirect(
                    "Truy cập bị từ chối. Cần tài khoản người bán.",
                  )
                ) : (
                  <SellerCouponsPage />
                )
              }
            />
            <Route
              path="/seller/add-product"
              element={
                !isAuthenticated || !isSeller ? (
                  sellerRedirect(
                    "Truy cập bị từ chối. Cần tài khoản người bán.",
                  )
                ) : (
                  <AddProductPage onNavigate={navigate} />
                )
              }
            />
            <Route
              path="/seller/edit-product"
              element={
                !isAuthenticated || !isSeller ? (
                  sellerRedirect(
                    "Truy cập bị từ chối. Cần tài khoản người bán.",
                  )
                ) : (
                  <AddProductPage
                    onNavigate={navigate}
                    initialProduct={editProductData}
                  />
                )
              }
            />

            {/* Admin protected pages */}
            <Route
              path="/admin"
              element={
                !isAuthenticated || !isAdmin ? (
                  adminRedirect("Truy cập bị từ chối. Cần quyền Admin.")
                ) : (
                  <AdminDashboardPage onNavigate={navigate} />
                )
              }
            />
            <Route
              path="/admin/accounts"
              element={
                !isAuthenticated || !isAdmin ? (
                  adminRedirect("Truy cập bị từ chối. Cần quyền Admin.")
                ) : (
                  <AdminAccountsPage />
                )
              }
            />
            <Route
              path="/admin/categories"
              element={
                !isAuthenticated || !isAdmin ? (
                  adminRedirect("Truy cập bị từ chối. Cần quyền Admin.")
                ) : (
                  <AdminCategoriesPage />
                )
              }
            />
            <Route
              path="/admin/coupons"
              element={
                !isAuthenticated || !isAdmin ? (
                  adminRedirect("Truy cập bị từ chối. Cần quyền Admin.")
                ) : (
                  <AdminCouponsPage />
                )
              }
            />
            <Route
              path="/admin/reviews"
              element={
                !isAuthenticated || !isAdmin ? (
                  adminRedirect("Truy cập bị từ chối. Cần quyền Admin.")
                ) : (
                  <AdminReviewsPage />
                )
              }
            />
            <Route
              path="/admin/seller-requests"
              element={
                !isAuthenticated || !isAdmin ? (
                  adminRedirect("Truy cập bị từ chối. Cần quyền Admin.")
                ) : (
                  <AdminSellerRequestsPage />
                )
              }
            />
            <Route
              path="/admin/stats"
              element={
                !isAuthenticated || !isAdmin ? (
                  adminRedirect("Truy cập bị từ chối. Cần quyền Admin.")
                ) : (
                  <AdminStatsPage />
                )
              }
            />
            <Route
              path="/admin/audit-log"
              element={
                !isAuthenticated || !isAdmin ? (
                  adminRedirect("Truy cập bị từ chối. Cần quyền Admin.")
                ) : (
                  <AdminAuditLogPage />
                )
              }
            />
            <Route
              path="/admin/wallets"
              element={
                !isAuthenticated || !isAdmin ? (
                  adminRedirect("Truy cập bị từ chối. Cần quyền Admin.")
                ) : (
                  <AdminWalletPage />
                )
              }
            />

            {/* 404 fallback */}
            <Route
              path="*"
              element={
                <div className="container mx-auto px-4 py-16 text-center">
                  <h1 className="text-4xl text-gray-900 mb-4">
                    Trang Đang Xây Dựng
                  </h1>
                  <p className="text-gray-500 mb-8">Trang này sẽ sớm ra mắt!</p>
                  <button
                    onClick={() => navigate("home")}
                    className="text-blue-500 hover:text-blue-400"
                  >
                    ← Quay về Trang chủ
                  </button>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>

      {showBuyerHeader && (
        <>
          <Footer onNavigate={navigate} />
          {isAuthenticated && !isSeller && !isAdmin && <ChatWidget />}
        </>
      )}

      <Toaster />
      </div>
    </ImagePreviewProvider>
  );
}
