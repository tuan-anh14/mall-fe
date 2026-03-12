import { useState } from "react";
import { toast } from "sonner";
import { WishlistItem } from "../types";
import { wishlistService } from "../services/wishlist.service";

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const fetchWishlist = async (): Promise<void> => {
    const res = await wishlistService.getWishlist();
    setWishlistItems(res.items ?? []);
  };

  const addToWishlist = async (productId: string): Promise<void> => {
    const res = await wishlistService.addItem(productId);
    setWishlistItems(res.items ?? []);
  };

  const removeFromWishlist = async (productId: string): Promise<void> => {
    try {
      const res = await wishlistService.removeItem(productId);
      setWishlistItems(res.items ?? []);
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa khỏi danh sách yêu thích");
    }
  };

  const isInWishlist = (productId: string | number): boolean => {
    return wishlistItems.some((item) => item.productId === String(productId));
  };

  const clearWishlist = (): void => {
    setWishlistItems([]);
  };

  return {
    wishlistItems,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  };
}
