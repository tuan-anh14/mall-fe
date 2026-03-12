import { get, post, del } from "../lib/api";
import { WishlistItem } from "../types";

export const wishlistService = {
  getWishlist(): Promise<{ items: WishlistItem[] }> {
    return get<{ items: WishlistItem[] }>("/api/v1/wishlist");
  },

  addItem(productId: string): Promise<{ items: WishlistItem[] }> {
    return post<{ items: WishlistItem[] }>("/api/v1/wishlist", { productId });
  },

  removeItem(productId: string): Promise<{ items: WishlistItem[] }> {
    return del<{ items: WishlistItem[] }>(`/api/v1/wishlist/${productId}`);
  },
};
