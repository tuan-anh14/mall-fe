import { get, post, put, del } from "../lib/api";
import { CartItem } from "../types";

export const cartService = {
  getCart(): Promise<{ cart: { items: CartItem[] } }> {
    return get<{ cart: { items: CartItem[] } }>("/api/v1/cart");
  },

  addItem(
    productId: string,
    quantity: number,
    color?: string,
    size?: string
  ): Promise<{ cart: { items: CartItem[] } }> {
    const body: any = { productId, quantity };
    if (color) body.color = color;
    if (size) body.size = size;
    return post<{ cart: { items: CartItem[] } }>("/api/v1/cart/items", body);
  },

  updateItem(
    itemId: string,
    quantity: number
  ): Promise<{ cart: { items: CartItem[] } }> {
    return put<{ cart: { items: CartItem[] } }>(
      `/api/v1/cart/items/${itemId}`,
      { quantity }
    );
  },

  removeItem(itemId: string): Promise<{ cart: { items: CartItem[] } }> {
    return del<{ cart: { items: CartItem[] } }>(`/api/v1/cart/items/${itemId}`);
  },
};
