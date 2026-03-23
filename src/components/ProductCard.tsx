import { memo } from "react";
import { Star, Heart, ShoppingCart, Eye } from "lucide-react";
import { formatCurrency } from "../lib/currency";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onView: (id: string | number) => void;
  onAddToCart: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  isInWishlist?: boolean;
}

export const ProductCard = memo(function ProductCard({
  product,
  onView,
  onAddToCart,
  onAddToWishlist,
  isInWishlist,
}: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all"
    >
      {/* Discount Badge */}
      {product.discount && (
        <Badge className="absolute top-3 left-3 z-10 bg-red-500 text-white">
          -{product.discount}%
        </Badge>
      )}

      {/* Wishlist Button */}
      {onAddToWishlist && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onAddToWishlist(product)}
          className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            onClick={() => onView(product.id)}
            className="bg-white text-black hover:bg-white/90"
          >
            <Eye className="h-4 w-4 mr-2" />
            Xem nhanh
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-blue-600 font-medium truncate mr-2">{product.category}</p>
          {product.stock < 10 && (
            <Badge variant="outline" className="h-4.5 px-1.5 text-[10px] bg-amber-50 text-amber-700 border-amber-200 shrink-0">
              Sắp hết
            </Badge>
          )}
        </div>
        <h3 className="text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 text-sm text-gray-700">{product.rating}</span>
          </div>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl text-gray-900 font-semibold">{formatCurrency(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>


        {/* Add to Cart Button */}
        <Button
          onClick={() => onAddToCart(product)}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Thêm vào giỏ
        </Button>
      </div>
    </motion.div>
  );
});
