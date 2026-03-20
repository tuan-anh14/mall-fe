import { Heart, ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { motion } from "motion/react";
import { toast } from "sonner";
import { WishlistItem } from "../../types";
import { formatCurrency } from "../../lib/currency";

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
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Heart className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h1 className="text-foreground">Danh sách yêu thích</h1>
                <p className="text-sm text-muted-foreground">
                  {wishlistItems.length} sản phẩm đã lưu
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
              >
                Xóa tất cả
              </Button>
            )}
          </div>
        </motion.div>

        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-foreground/5 border-border hover:border-border transition-all group overflow-hidden">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-foreground/5">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {item.product.discount > 0 && (
                        <Badge className="absolute top-3 left-3 bg-red-500">
                          -{item.product.discount}%
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 bg-background/50 backdrop-blur-sm hover:bg-background/70 text-foreground"
                        onClick={() => removeFromWishlist(item.productId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {item.product.badge && (
                        <Badge className="absolute top-3 right-14 bg-purple-500">
                          {item.product.badge}
                        </Badge>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="mb-2">
                        <Badge variant="outline" className="border-border text-muted-foreground text-xs mb-2">
                          {item.product.category}
                        </Badge>
                      </div>
                      <h3
                        className="text-white mb-2 line-clamp-2 cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() => onNavigate("product", item.product)}
                      >
                        {item.product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(item.product.rating ?? item.product.ratingAverage ?? 0)
                                  ? "text-yellow-500 fill-current"
                                  : "text-muted-foreground fill-current"
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({item.product.reviews ?? item.product.reviewCount ?? 0})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-foreground">{formatCurrency(Number(item.product.price))}</span>
                        {item.product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(Number(item.product.originalPrice))}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          onClick={() => addToCart(item)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Thêm vào giỏ
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="border border-border hover:bg-foreground/5"
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
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="h-32 w-32 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-6">
              <Heart className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-muted-foreground mb-2">Danh sách yêu thích trống</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Hãy thêm sản phẩm yêu thích vào danh sách!
            </p>
            <Button
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => onNavigate("shop")}
            >
              Tiếp tục mua sắm
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
