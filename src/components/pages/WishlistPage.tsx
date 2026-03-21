import { Heart, ShoppingCart, Trash2, X, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { WishlistItem } from "../../types";
import { formatCurrency } from "../../lib/currency";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease } },
};

interface WishlistPageProps {
  onNavigate: (page: string, data?: any) => void;
  wishlistItems: WishlistItem[];
  onRemoveItem: (productId: string) => void;
  onAddToCart: (product: any, quantity: number) => void;
}

export function WishlistPage({ onNavigate, wishlistItems, onRemoveItem, onAddToCart }: WishlistPageProps) {
  const removeFromWishlist = (productId: string) => {
    onRemoveItem(productId);
    toast.success("Đã xóa khỏi danh sách yêu thích");
  };

  const addToCart = (item: WishlistItem) => {
    onAddToCart(item.product, 1);
    toast.success(`${item.product.name} đã thêm vào giỏ hàng!`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Danh sách yêu thích</h1>
                <p className="text-gray-500 mt-0.5">
                  {wishlistItems.length === 0
                    ? "Chưa có sản phẩm nào"
                    : `${wishlistItems.length} sản phẩm đã lưu`}
                </p>
              </div>
            </div>
            {wishlistItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  wishlistItems.forEach((item) => onRemoveItem(item.productId));
                  toast.success("Đã xóa danh sách yêu thích");
                }}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Xóa tất cả
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {wishlistItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  variants={staggerItem}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
                >
                  <Card className="bg-white border-gray-200/80 hover:border-gray-300 transition-all duration-300 group overflow-hidden rounded-2xl shadow-sm hover:shadow-lg">
                    <CardContent className="p-0">
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          onClick={() => onNavigate("product", item.product)}
                          style={{ cursor: "pointer" }}
                        />

                        {/* Overlay gradient */}
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          {item.product.discount > 0 && (
                            <Badge className="bg-red-500 text-white border-0 shadow-sm text-xs font-bold">
                              -{item.product.discount}%
                            </Badge>
                          )}
                          {item.product.badge && (
                            <Badge className="bg-blue-600 text-white border-0 shadow-sm text-xs">
                              {item.product.badge}
                            </Badge>
                          )}
                        </div>

                        {/* Remove button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white text-gray-500 hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
                          onClick={() => removeFromWishlist(item.productId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500 border-0 mb-2">
                          {item.product.category}
                        </Badge>

                        <h3
                          className="font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors duration-200 leading-snug"
                          onClick={() => onNavigate("product", item.product)}
                        >
                          {item.product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.floor(item.product.rating ?? item.product.ratingAverage ?? 0)
                                    ? "text-amber-400 fill-current"
                                    : "text-gray-200 fill-current"
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">
                            ({item.product.reviews ?? item.product.reviewCount ?? 0})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(Number(item.product.price))}</span>
                          {item.product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through tabular-nums">
                              {formatCurrency(Number(item.product.originalPrice))}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-sm font-medium shadow-sm shadow-blue-600/10 transition-all duration-200 hover:-translate-y-px"
                            onClick={() => addToCart(item)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1.5" />
                            Thêm vào giỏ
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-400 transition-all duration-200"
                            onClick={() => removeFromWishlist(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gray-100 mb-6">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Danh sách yêu thích trống</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Lưu lại những sản phẩm bạn yêu thích để dễ dàng tìm lại sau!
            </p>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              onClick={() => onNavigate("shop")}
            >
              Khám phá cửa hàng
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
