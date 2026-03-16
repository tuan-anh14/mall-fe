import { useState } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { CartItem } from "../../types";
import { post } from "../../lib/api";
import { toast } from "sonner";

interface CartPageProps {
  onNavigate: (page: string) => void;
  cartItems: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export function CartPage({ onNavigate, cartItems, onRemoveItem, onUpdateQuantity }: CartPageProps) {
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");
  const [couponSellerName, setCouponSellerName] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const updateQuantity = (itemId: string, delta: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (item) {
      onUpdateQuantity(itemId, Math.max(1, item.quantity + delta));
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await post<{ discount: number; coupon: { code: string; sellerId?: string | null; sellerName?: string | null } }>(
        "/api/v1/cart/coupon",
        { code: couponCode.trim() }
      );
      const discount = res.discount ?? 0;
      const code = res.coupon?.code ?? couponCode;
      const sellerName = res.coupon?.sellerName ?? null;
      setCouponDiscount(discount);
      setCouponApplied(code);
      setCouponSellerName(sellerName);
      try {
        sessionStorage.setItem("applied_coupon", JSON.stringify({ code, discount, sellerName }));
      } catch {}
      const sellerInfo = sellerName ? ` (shop: ${sellerName})` : "";
      toast.success(`Đã áp dụng mã giảm giá${sellerInfo}! Tiết kiệm $${discount.toFixed(2)}`);
    } catch (err: any) {
      toast.error(err.message || "Mã giảm giá không hợp lệ");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = Math.max(0, subtotal - couponDiscount) + shipping + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-white mb-8">Giỏ hàng</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-24 w-24 text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl text-white mb-2">Giỏ hàng trống</h2>
          <p className="text-white/60 mb-6">Hãy thêm sản phẩm để bắt đầu!</p>
          <Button
            onClick={() => onNavigate("shop")}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Tiếp tục mua sắm
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
                        {item.product.category && (
                          <Badge className="mb-2">{item.product.category}</Badge>
                        )}
                        <h3 className="text-xl text-white mb-1">{item.product.name}</h3>
                        {item.product.brand && (
                          <p className="text-sm text-white/60">{item.product.brand}</p>
                        )}
                        {(item.selectedColor || item.selectedSize) && (
                          <div className="flex gap-2 mt-1">
                            {item.selectedColor && (
                              <span className="text-xs text-white/50">Màu: {item.selectedColor}</span>
                            )}
                            {item.selectedSize && (
                              <span className="text-xs text-white/50">Kích cỡ: {item.selectedSize}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onRemoveItem(item.id)}
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
                            ${item.product.price} / sản phẩm
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
              Tiếp tục mua sắm
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <h2 className="text-2xl text-white">Tóm tắt đơn hàng</h2>

              {/* Coupon Code */}
              <div>
                <label className="text-sm text-white/70 mb-2 block">
                  Mã giảm giá
                </label>
                {couponApplied ? (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-400 flex-1 font-mono font-bold">{couponApplied}</span>
                      <span className="text-sm text-green-400">-${couponDiscount.toFixed(2)}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white/50 hover:text-white h-6 px-2"
                        onClick={() => { setCouponApplied(""); setCouponDiscount(0); setCouponCode(""); setCouponSellerName(null); try { sessionStorage.removeItem("applied_coupon"); } catch {} }}
                      >
                        ×
                      </Button>
                    </div>
                    {couponSellerName && (
                      <p className="text-xs text-green-400/70 mt-1">Áp dụng cho sản phẩm của shop: {couponSellerName}</p>
                    )}
                    {!couponSellerName && (
                      <p className="text-xs text-green-400/70 mt-1">Mã giảm giá toàn sàn</p>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập mã"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-white/5 border-white/10"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                    >
                      {applyingCoupon ? "..." : "Áp dụng"}
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="bg-white/10" />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-white/70">
                  <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Giảm giá coupon</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/70">
                  <span>Vận chuyển</span>
                  <span>
                    {shipping === 0 ? (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        MIỄN PHÍ
                      </Badge>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Thuế (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                {shipping > 0 && subtotal < 50 && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <p className="text-sm text-purple-400">
                      Thêm ${(50 - subtotal).toFixed(2)} nữa để được miễn phí vận chuyển!
                    </p>
                  </div>
                )}
              </div>

              <Separator className="bg-white/10" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-xl text-white">Tổng cộng</span>
                <span className="text-3xl text-white">${total.toFixed(2)}</span>
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => onNavigate("checkout")}
              >
                Tiến hành thanh toán
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Security Badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="text-2xl mb-1">🔒</div>
                  <p className="text-xs text-white/60">Thanh toán an toàn</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">📦</div>
                  <p className="text-xs text-white/60">Giao hàng nhanh</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">↩️</div>
                  <p className="text-xs text-white/60">Đổi trả dễ dàng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
