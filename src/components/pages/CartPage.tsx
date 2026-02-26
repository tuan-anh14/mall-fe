import { useState } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { CartItem } from "../../App";

interface CartPageProps {
  onNavigate: (page: string) => void;
  cartItems: CartItem[];
  onRemoveItem: (itemId: number) => void;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
}

export function CartPage({ onNavigate, cartItems, onRemoveItem, onUpdateQuantity }: CartPageProps) {
  const [couponCode, setCouponCode] = useState("");

  const updateQuantity = (itemId: number, delta: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (item) {
      onUpdateQuantity(itemId, Math.max(1, item.quantity + delta));
    }
  };

  const removeItem = (itemId: number) => {
    onRemoveItem(itemId);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-white mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-24 w-24 text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl text-white mb-2">Your cart is empty</h2>
          <p className="text-white/60 mb-6">Add some products to get started!</p>
          <Button
            onClick={() => onNavigate("shop")}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-white/5 rounded-xl overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <div>
                        <Badge className="mb-2">{item.product.category}</Badge>
                        <h3 className="text-xl text-white mb-1">{item.product.name}</h3>
                        <p className="text-sm text-white/60">{item.product.brand}</p>
                        {(item.selectedColor || item.selectedSize) && (
                          <div className="flex gap-2 mt-1">
                            {item.selectedColor && (
                              <span className="text-xs text-white/50">Color: {item.selectedColor}</span>
                            )}
                            {item.selectedSize && (
                              <span className="text-xs text-white/50">Size: {item.selectedSize}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-4 text-white">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl text-white">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-white/50">
                            ${item.product.price} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={() => onNavigate("shop")}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <h2 className="text-2xl text-white">Order Summary</h2>

              {/* Coupon Code */}
              <div>
                <label className="text-sm text-white/70 mb-2 block">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        FREE
                      </Badge>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                {shipping > 0 && subtotal < 50 && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <p className="text-sm text-purple-400">
                      Add ${(50 - subtotal).toFixed(2)} more to get free shipping!
                    </p>
                  </div>
                )}
              </div>

              <Separator className="bg-white/10" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-xl text-white">Total</span>
                <span className="text-3xl text-white">${total.toFixed(2)}</span>
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => onNavigate("checkout")}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Security Badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="text-2xl mb-1">🔒</div>
                  <p className="text-xs text-white/60">Secure Payment</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">📦</div>
                  <p className="text-xs text-white/60">Fast Delivery</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">↩️</div>
                  <p className="text-xs text-white/60">Easy Returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
