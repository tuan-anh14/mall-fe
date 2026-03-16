// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductSeller {
  userId?: string;
  storeName?: string;
  isVerified?: boolean;
  positiveRating?: number;
  avatar?: string;
}

export interface Product {
  id: string | number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  discount?: number;
  stock: number;
  brand?: string;
  description?: string;
  specifications?: Record<string, string>;
  colors?: string[];
  sizes?: string[];
  featured?: boolean;
  trending?: boolean;
  seller?: ProductSeller;
}

export interface Category {
  name: string;
  icon?: string;
  productCount?: number;
  count?: number;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id?: string;
  email: string;
  name: string;
  avatar?: string;
  userType: "buyer" | "seller" | "admin";
  sellerRequestStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
}
