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

export const SELLER_PAGES = [
  "dashboard",
  "seller-products",
  "seller-orders",
  "add-product",
  "edit-product",
];

// Derive the Page name from a pathname (for header/footer logic)
const PATHNAME_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([page, path]) => [path, page])
);

export function getPageFromPathname(pathname: string): string {
  if (pathname.startsWith("/product/")) return "product";
  return PATHNAME_TO_PAGE[pathname] ?? "home";
}
