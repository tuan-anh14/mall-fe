// Map page name → URL path (for simple pages without dynamic segments)
export const PAGE_TO_PATH: Record<string, string> = {
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
  "seller-returns": "/seller/returns",
  "seller-reviews": "/seller/reviews",
  "seller-coupons": "/seller/coupons",
  "seller-inventory": "/seller/inventory",
  "add-product": "/seller/add-product",
  "edit-product": "/seller/edit-product",
  // Admin pages
  "admin-dashboard": "/admin",
  "admin-accounts": "/admin/accounts",
  "admin-categories": "/admin/categories",
  "admin-coupons": "/admin/coupons",
  "admin-reviews": "/admin/reviews",
  "admin-seller-requests": "/admin/seller-requests",
  "admin-stats": "/admin/stats",
  "admin-audit-log": "/admin/audit-log",
  "admin-contacts": "/admin/contacts",
  "admin-products": "/admin/products",
  "admin-finance": "/admin/finance",
  // Auth
  login: "/login",
  "forgot-password": "/forgot-password",
  "reset-password": "/reset-password",
  "oauth-callback": "/auth/oauth/callback",
  // Static
  about: "/about",
  contact: "/contact",
  terms: "/terms",
  privacy: "/privacy",
  help: "/help",
  wishlist: "/wishlist",
  notifications: "/notifications",
  chat: "/chat",
  settings: "/settings",
  wallet: "/wallet",
  "view-history": "/view-history",
  "admin-wallets": "/admin/wallets",
  careers: "/careers",
  returns: "/returns",
  shipping: "/shipping",
  cookies: "/cookies",
  gdpr: "/gdpr",
  "seller-profile": "/seller-profile",
  // Blog
  blog: "/blog",
  "my-blogs": "/my-blogs",
  "admin-blogs": "/admin/blogs",
};

export const SELLER_PAGES = [
  "dashboard",
  "seller-products",
  "seller-orders",
  "seller-returns",
  "seller-reviews",
  "seller-coupons",
  "seller-inventory",
  "add-product",
  "edit-product",
];

export const ADMIN_PAGES = [
  "admin-dashboard",
  "admin-accounts",
  "admin-categories",
  "admin-coupons",
  "admin-reviews",
  "admin-seller-requests",
  "admin-stats",
  "admin-audit-log",
  "admin-wallets",
  "admin-blogs",
  "admin-contacts",
  "admin-products",
  "admin-finance",
];

// Derive the Page name from a pathname (for header/footer logic)
const PATHNAME_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([page, path]) => [path, page])
);

export function getPageFromPathname(pathname: string): string {
  if (pathname.startsWith("/product/")) return "product";
  if (pathname.startsWith("/admin")) {
    return PATHNAME_TO_PAGE[pathname] ?? "admin-dashboard";
  }
  return PATHNAME_TO_PAGE[pathname] ?? "home";
}
