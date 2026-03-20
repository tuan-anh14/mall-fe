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
import { formatCurrency } from "../../lib/currency";

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
      toast.success(`Đã áp dụng mã giảm giá${sellerInfo}! Tiết kiệm ${formatCurrency(discount)}`);
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
      <h1 className="text-4xl text-foreground mb-8">Giỏ hàng</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl text-foreground mb-2">Giỏ hàng trống</h2>
          <p className="text-muted-foreground mb-6">Hãy thêm sản phẩm để bắt đầu!</p>
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
                className="bg-foreground/5 border border-border rounded-2xl p-6"
              >
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-foreground/5 rounded-xl overflow-hidden flex-shrink-0">
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
                        <h3 className="text-xl text-foreground mb-1">{item.product.name}</h3>
                        {item.product.brand && (
                          <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                        )}
                        {(item.selectedColor || item.selectedSize) && (
                          <div className="flex gap-2 mt-1">
                            {item.selectedColor && (
                              <span className="text-xs text-muted-foreground">Màu: {item.selectedColor}</span>
                            )}
                            {item.selectedSize && (
                              <span className="text-xs text-muted-foreground">Kích cỡ: {item.selectedSize}</span>
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
                      <div className="flex items-center bg-foreground/5 border border-border rounded-lg">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-4 text-foreground">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl text-foreground">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.product.price)} / sản phẩm
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
            <div className="sticky top-24 bg-foreground/5 border border-border rounded-2xl p-6 space-y-6">
              <h2 className="text-2xl text-foreground">Tóm tắt đơn hàng</h2>

              {/* Coupon Code */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Mã giảm giá
                </label>
                {couponApplied ? (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-400 flex-1 font-mono font-bold">{couponApplied}</span>
                      <span className="text-sm text-green-400">-{formatCurrency(couponDiscount)}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground h-6 px-2"
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
                      className="bg-foreground/5 border-border"
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

              <Separator className="bg-foreground/10" />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Giảm giá coupon</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Vận chuyển</span>
                  <span>
                    {shipping === 0 ? (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        MIỄN PHÍ
                      </Badge>
                    ) : (
                      formatCurrency(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Thuế (10%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>

                {shipping > 0 && subtotal < 50 && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <p className="text-sm text-purple-400">
                      Thêm {formatCurrency(50 - subtotal)} nữa để được miễn phí vận chuyển!
                    </p>
                  </div>
                )}
              </div>

              <Separator className="bg-foreground/10" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-xl text-foreground">Tổng cộng</span>
                <span className="text-3xl text-foreground">{formatCurrency(total)}</span>
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
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl mb-1">🔒</div>
                  <p className="text-xs text-muted-foreground">Thanh toán an toàn</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">📦</div>
                  <p className="text-xs text-muted-foreground">Giao hàng nhanh</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">↩️</div>
                  <p className="text-xs text-muted-foreground">Đổi trả dễ dàng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
