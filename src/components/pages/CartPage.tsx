import { useState } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Shield, Truck, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { CartItem } from "../../types";
import { post } from "../../lib/api";
import { toast } from "sonner";
import { formatCurrency, FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_COST, VAT_RATE } from "../../lib/currency";
import { motion, AnimatePresence } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

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
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST;
  const tax = Math.round(subtotal * VAT_RATE);
  const total = Math.round(Math.max(0, subtotal - couponDiscount) + shipping + tax);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Giỏ hàng</h1>
            <p className="text-gray-500">
              {cartItems.length === 0
                ? "Giỏ hàng của bạn đang trống"
                : `${cartItems.length} sản phẩm trong giỏ hàng`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gray-100 mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Hãy khám phá cửa hàng và thêm sản phẩm yêu thích vào giỏ hàng!</p>
            <Button
              size="lg"
              onClick={() => onNavigate("shop")}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 rounded-xl"
            >
              Khám phá cửa hàng
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: i * 0.05, ease }}
                    className="bg-white border border-gray-200/80 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex gap-5">
                      <div
                        className="w-28 h-28 md:w-32 md:h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer group"
                        onClick={() => onNavigate("product")}
                      >
                        <ImageWithFallback
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-3 mb-1">
                          <div className="min-w-0">
                            {item.product.category && (
                              <Badge variant="secondary" className="mb-1.5 text-xs bg-blue-50 text-blue-700 border-0">{item.product.category}</Badge>
                            )}
                            <h3 className="text-lg font-semibold text-gray-900 mb-0.5 truncate">{item.product.name}</h3>
                            {item.product.brand && (
                              <p className="text-sm text-gray-500">{item.product.brand}</p>
                            )}
                            {(item.selectedColor || item.selectedSize) && (
                              <div className="flex gap-3 mt-1.5">
                                {item.selectedColor && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Màu: {item.selectedColor}</span>
                                )}
                                {item.selectedSize && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Kích cỡ: {item.selectedSize}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onRemoveItem(item.id)}
                            className="flex-shrink-0 h-8 w-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                              className="h-9 w-9 rounded-none hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-10 text-center text-sm font-semibold text-gray-900 tabular-nums">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="h-9 w-9 rounded-none hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900 tabular-nums">
                              {formatCurrency(item.product.price * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {formatCurrency(item.product.price)} / sản phẩm
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Button
                variant="outline"
                onClick={() => onNavigate("shop")}
                className="w-full rounded-xl h-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Tiếp tục mua sắm
              </Button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease }}
                className="sticky top-24"
              >
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-5">
                  <h2 className="text-xl font-bold text-gray-900">Tóm tắt đơn hàng</h2>

                  {/* Coupon Code */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      Mã giảm giá
                    </label>
                    {couponApplied ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-emerald-700 flex-1 font-mono font-bold tracking-wider">{couponApplied}</span>
                          <span className="text-sm font-semibold text-emerald-600">-{formatCurrency(couponDiscount)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-gray-700 h-6 w-6 p-0 rounded-lg"
                            onClick={() => { setCouponApplied(""); setCouponDiscount(0); setCouponCode(""); setCouponSellerName(null); try { sessionStorage.removeItem("applied_coupon"); } catch {} }}
                          >
                            ×
                          </Button>
                        </div>
                        {couponSellerName && (
                          <p className="text-xs text-emerald-600/70 mt-1">Áp dụng cho sản phẩm của shop: {couponSellerName}</p>
                        )}
                        {!couponSellerName && (
                          <p className="text-xs text-emerald-600/70 mt-1">Mã giảm giá toàn sàn</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập mã giảm giá"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="bg-gray-50/50 border-gray-200 rounded-xl h-10 focus:bg-white transition-colors"
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        />
                        <Button
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon || !couponCode.trim()}
                          className="rounded-xl h-10 px-4 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                          {applyingCoupon ? "..." : "Áp dụng"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-gray-100" />

                  {/* Free Shipping Progress */}
                  {shipping > 0 && subtotal < 50 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-blue-700">Miễn phí vận chuyển</p>
                        <p className="text-xs text-blue-600">Còn {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)}</p>
                      </div>
                      <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${freeShippingProgress}%` }}
                          transition={{ duration: 0.8, ease }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                      <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Giảm giá coupon</span>
                        <span className="font-medium tabular-nums">-{formatCurrency(couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Vận chuyển</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-0 text-xs">
                            MIỄN PHÍ
                          </Badge>
                        ) : (
                          <span className="tabular-nums">{formatCurrency(shipping)}</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Thuế (10%)</span>
                      <span className="font-medium tabular-nums">{formatCurrency(tax)}</span>
                    </div>
                  </div>

                  <Separator className="bg-gray-100" />

                  {/* Total */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-semibold text-gray-900">Tổng cộng</span>
                    <span className="text-2xl font-bold text-gray-900 tabular-nums">{formatCurrency(total)}</span>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-white rounded-xl h-12 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 font-semibold"
                    onClick={() => onNavigate("checkout")}
                  >
                    Tiến hành thanh toán
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                    {[
                      { icon: Shield, label: "An toàn" },
                      { icon: Truck, label: "Giao nhanh" },
                      { icon: RotateCcw, label: "Đổi trả" },
                    ].map((badge, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                          <badge.icon className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">{badge.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
