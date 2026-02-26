import { useState } from "react";
import { Star, Heart, Share2, Truck, Shield, RotateCcw, MessageCircle, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { reviews } from "../../lib/mock-data";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";

interface ProductDetailPageProps {
  product: any;
  onNavigate: (page: string) => void;
  onAddToCart: (product: any, quantity: number, selectedColor?: string, selectedSize?: string) => void;
  onAddToWishlist: (product: any) => void;
  onRemoveFromWishlist: (itemId: number) => void;
  isInWishlist: boolean;
}

export function ProductDetailPage({ 
  product, 
  onNavigate, 
  onAddToCart, 
  onAddToWishlist, 
  onRemoveFromWishlist,
  isInWishlist: initialIsInWishlist 
}: ProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
  const [isLiked, setIsLiked] = useState(initialIsInWishlist);


console.log(
  product
);


  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
    toast.success(`Added ${quantity} ${product.name} to cart`, {
      description: `Color: ${selectedColor || 'Default'}, Size: ${selectedSize || 'Default'}`,
    });
  };

  const handleBuyNow = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
    toast.success("Proceeding to checkout...");
    setTimeout(() => {
      onNavigate("checkout");
    }, 500);
  };

  const handleLike = () => {
    if (!isLiked) {
      onAddToWishlist(product);
      setIsLiked(true);
      toast.success("Added to wishlist");
    } else {
      // We need to find the wishlist item to remove it, but we don't have the item ID
      // For now, we'll just toggle the state
      setIsLiked(false);
      toast.success("Removed from wishlist");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} for $${product.price}`,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.success("Link copied to clipboard!");
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const productReviews = reviews.filter((r) => r.productId === product.id);

  const ratingDistribution = {
    5: 65,
    4: 20,
    3: 10,
    2: 3,
    1: 2,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10">
            <ImageWithFallback
              src={product.images?.[selectedImage] || product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount && (
              <Badge className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600">
                -{product.discount}%
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {(product.images || [product.image]).map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`aspect-square bg-white/5 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === i
                    ? "border-purple-500"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge className="mb-3">{product.category}</Badge>
            <h1 className="text-4xl text-white mb-2">{product.name}</h1>
            <p className="text-white/60">by {product.brand}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-white/20"
                  }`}
                />
              ))}
            </div>
            <span className="text-white">{product.rating}</span>
            <span className="text-white/50">({product.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl text-white">${product.price}</span>
            {product.originalPrice && (
              <span className="text-xl text-white/50 line-through">
                ${product.originalPrice}
              </span>
            )}
            {product.discount && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                Save {product.discount}%
              </Badge>
            )}
          </div>

          <Separator className="bg-white/10" />

          {/* Description */}
          <p className="text-white/70">{product.description}</p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="text-white mb-2 block">
                Color: <span className="text-purple-400">{selectedColor}</span>
              </label>
              <div className="flex gap-2">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedColor === color
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <span className="text-white text-sm">{color}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="text-white mb-2 block">
                Size: <span className="text-purple-400">{selectedSize}</span>
              </label>
              <div className="flex gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedSize === size
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <span className="text-white text-sm">{size}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          {product.stock < 10 && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
              <p className="text-orange-400 text-sm">
                ⚡ Only {product.stock} left in stock - order soon!
              </p>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="text-white mb-2 block">Quantity</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 text-white">{quantity}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-white/50 text-sm">
                ({product.stock} available)
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleLike}
              className={isLiked ? "border-red-500 text-red-500" : ""}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500" : ""}`} />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <Button 
            size="lg" 
            variant="outline" 
            className="w-full"
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white">Free Shipping</p>
                <p className="text-white/50 text-xs">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white">Secure Payment</p>
                <p className="text-white/50 text-xs">100% protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <RotateCcw className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white">Easy Returns</p>
                <p className="text-white/50 text-xs">30-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white">24/7 Support</p>
                <p className="text-white/50 text-xs">Always here to help</p>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500">
                    {product.brand[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white">{product.brand} Official Store</p>
                  <p className="text-sm text-white/50">98% positive ratings</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => onNavigate("chat")}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="w-full justify-start bg-white/5 border-b border-white/10 rounded-none">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({productReviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-8">
          <div className="prose prose-invert max-w-none">
            <h3 className="text-2xl text-white mb-4">Product Description</h3>
            <p className="text-white/70">{product.description}</p>
          </div>
        </TabsContent>

        <TabsContent value="specifications" className="mt-8">
          <h3 className="text-2xl text-white mb-6">Technical Specifications</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div
                key={key}
                className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between"
              >
                <span className="text-white/60">{key}</span>
                <span className="text-white">{value as string}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="text-5xl text-white mb-2">{product.rating}</div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-white/20"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-white/60">Based on {product.reviews} reviews</p>
              </div>
              <div className="space-y-3">
                {Object.entries(ratingDistribution).reverse().map(([rating, percentage]) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm text-white/60 w-8">{rating}★</span>
                    <Progress value={percentage as number} className="flex-1" />
                    <span className="text-sm text-white/60 w-12">{percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              {productReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-purple-500">
                          {review.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white">{review.user}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-white/20"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-white/50">{review.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/70 mb-4">{review.comment}</p>
                  <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">
                    👍 Helpful ({review.helpful})
                    </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
