import { useState } from "react";
import { toast } from "sonner";
import { CartItem } from "../types";
import { cartService } from "../services/cart.service";

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCart = async (): Promise<void> => {
    const res = await cartService.getCart();
    setCartItems(res.cart?.items ?? []);
  };

  const addToCart = async (
    productId: string,
    quantity: number,
    color?: string,
    size?: string
  ): Promise<void> => {
    const res = await cartService.addItem(productId, quantity, color, size);
    setCartItems(res.cart?.items ?? []);
  };

  const removeFromCart = async (itemId: string): Promise<void> => {
    try {
      const res = await cartService.removeItem(itemId);
      setCartItems(res.cart?.items ?? []);
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa khỏi giỏ hàng");
    }
  };

  const updateCartQuantity = async (
    itemId: string,
    quantity: number
  ): Promise<void> => {
    try {
      const res = await cartService.updateItem(itemId, quantity);
      setCartItems(res.cart?.items ?? []);
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật giỏ hàng");
    }
  };

  const clearCart = (): void => {
    setCartItems([]);
  };

  return {
    cartItems,
    fetchCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  };
}
