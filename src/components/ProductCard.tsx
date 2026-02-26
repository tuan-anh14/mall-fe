import { Star, Heart, ShoppingCart, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviews: number;
    image: string;
    discount?: number;
    stock: number;
  };
  onView: (id: number) => void;
  onAddToCart: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  isInWishlist?: boolean;
}

export function ProductCard({ product, onView, onAddToCart, onAddToWishlist, isInWishlist }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all"
    >
      {/* Discount Badge */}
      {product.discount && (
        <Badge className="absolute top-3 left-3 z-10 bg-gradient-to-r from-purple-600 to-blue-600">
          -{product.discount}%
        </Badge>
      )}

      {/* Wishlist Button */}
      {onAddToWishlist && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onAddToWishlist(product)}
          className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-white/5">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            onClick={() => onView(product.id)}
            className="bg-white text-black hover:bg-white/90"
          >
            <Eye className="h-4 w-4 mr-2" />
            Quick View
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-purple-400 mb-1">{product.category}</p>
          <h3 className="text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 text-sm text-white">{product.rating}</span>
          </div>
          <span className="text-xs text-white/50">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl text-white">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-white/50 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock < 10 && (
          <p className="text-xs text-orange-400">Only {product.stock} left in stock!</p>
        )}

        {/* Add to Cart Button */}
        <Button
          onClick={() => onAddToCart(product)}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}
