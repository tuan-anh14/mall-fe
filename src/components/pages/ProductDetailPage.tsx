import React, { useState, useEffect, useRef } from "react";
import { Star, Heart, Share2, Truck, Shield, RotateCcw, MessageCircle, Minus, Plus, Upload, X, Smile } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner";
import { get, post } from "../../lib/api";
import { API_URL } from "../../lib/api";
import { formatCurrency } from "../../lib/currency";

interface ReviewUser {
  id: string;
  name: string;
  avatar?: string;
}

interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  helpful: number;
  user: ReviewUser;
  createdAt: string;
}

interface RatingBreakdownItem {
  rating: number;
  count: number;
  percentage: number;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image?: string;
  images?: string[];
  rating?: number;
  reviews?: number;
  category?: string;
  brand?: string;
}

interface ProductDetailPageProps {
  product: any;
  onNavigate: (page: string, data?: any) => void;
  onAddToCart: (product: any, quantity: number, selectedColor?: string, selectedSize?: string) => Promise<void> | void;
  onAddToWishlist: (product: any) => void;
  onRemoveFromWishlist: (productId: string) => void;
  isInWishlist: boolean;
  isAuthenticated?: boolean;
}

export function ProductDetailPage({
  product,
  onNavigate,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  isInWishlist: initialIsInWishlist,
  isAuthenticated = false,
}: ProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0]?.name ?? product.colors?.[0] ?? null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.[0] || null);
  const [isLiked, setIsLiked] = useState(initialIsInWishlist);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdownItem[]>([]);
  const [ratingAverage, setRatingAverage] = useState<number>(product.rating ?? 0);

  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Review form state
  const [canReview, setCanReview] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewEmoji, setReviewEmoji] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isUploadingReviewImage, setIsUploadingReviewImage] = useState(false);
  const [showReviewEmojiPicker, setShowReviewEmojiPicker] = useState(false);
  const reviewImageInputRef = useRef<HTMLInputElement>(null);

  const REVIEW_EMOJIS = ["😊", "😁", "😍", "🤩", "👍", "🔥", "💯", "⭐", "🎉", "😢", "😞", "👎"];

  useEffect(() => {
    if (!product.id) return;

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const data = await get(`/api/v1/reviews/products/${product.id}?page=1&limit=10`);
        setReviews(data.reviews ?? []);
        // breakdown is nested under summary from backend
        const summary = data.summary ?? {};
        const rawBreakdown = summary.breakdown ?? {};
        const breakdownArr: RatingBreakdownItem[] = [5, 4, 3, 2, 1].map((star) => {
          const count = rawBreakdown[star] ?? 0;
          const total = Object.values(rawBreakdown as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
          return { rating: star, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 };
        });
        setRatingBreakdown(breakdownArr);
        if (summary.ratingAverage !== undefined) {
          setRatingAverage(Number(summary.ratingAverage));
        }
      } catch {
        // silently fall back to empty state
      } finally {
        setReviewsLoading(false);
      }
    };

    const fetchRelated = async () => {
      setRelatedLoading(true);
      try {
        const data = await get(`/api/v1/products/${product.id}/related`);
        const items: RelatedProduct[] = Array.isArray(data)
          ? data
          : (data.products ?? []);
        setRelatedProducts(items);
      } catch {
        // silently fall back to empty state
      } finally {
        setRelatedLoading(false);
      }
    };

    const fetchReviewEligibility = async () => {
      try {
        const data = await get(`/api/v1/reviews/products/${product.id}/check`);
        setCanReview(data.canReview ?? false);
        setUserReview(data.review ?? null);
      } catch {
        // not logged in or not purchased
      }
    };

    fetchReviews();
    fetchRelated();
    fetchReviewEligibility();
  }, [product.id]);

  const handleAddToCart = async () => {
    try {
      await onAddToCart(product, quantity, selectedColor ?? undefined, selectedSize ?? undefined);
      toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`, {
        description: `Màu: ${selectedColor || 'Mặc định'}, Kích cỡ: ${selectedSize || 'Mặc định'}`,
      });
    } catch {
      // error already shown by addToCart
    }
  };

  const handleBuyNow = async () => {
    try {
      await onAddToCart(product, quantity, selectedColor ?? undefined, selectedSize ?? undefined);
      onNavigate("checkout");
    } catch {
      // error already shown by addToCart; do not navigate
    }
  };

  const handleLike = () => {
    if (!isLiked) {
      onAddToWishlist(product);
      setIsLiked(true);
      toast.success("Đã thêm vào danh sách yêu thích");
    } else {
      onRemoveFromWishlist(product.id);
      setIsLiked(false);
      toast.success("Đã xóa khỏi danh sách yêu thích");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Xem ngay ${product.name} chỉ với ${formatCurrency(product.price)}`,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.success("Đã sao chép liên kết!");
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết!");
    }
  };

  const getBreakdownPercentage = (star: number): number =>
    ratingBreakdown.find((b) => b.rating === star)?.percentage ?? 0;

  const handleReviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReviewImage(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch(`${API_URL}/api/v1/upload/images`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      const url = json?.data?.urls?.[0] ?? null;
      if (!url) throw new Error("Tải lên thất bại");
      setReviewImages((prev) => [...prev, url]);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải ảnh lên");
    } finally {
      setIsUploadingReviewImage(false);
      if (reviewImageInputRef.current) reviewImageInputRef.current.value = "";
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      toast.error("Vui lòng viết nhận xét đánh giá");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const body: any = {
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
        images: reviewImages,
      };
      if (reviewEmoji) body.emoji = reviewEmoji;

      const data = await post("/api/v1/reviews", body);
      setReviews((prev) => [data.review, ...prev]);
      setUserReview(data.review);
      setCanReview(false);
      setReviewFormOpen(false);
      setReviewComment("");
      setReviewRating(5);
      setReviewImages([]);
      setReviewEmoji("");
      toast.success("Đã gửi đánh giá thành công!");
    } catch (err: any) {
      toast.error(err.message || "Không thể gửi đánh giá");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getAvatarInitials = (name?: string): string => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10">
            <ImageWithFallback
              src={product.images?.[selectedImage]?.url ?? product.images?.[selectedImage] ?? product.image}
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
            {(product.images || [product.image]).map((img: any, i: number) => {
              const imgUrl = img?.url ?? img;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square bg-white/5 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i
                      ? "border-purple-500"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img src={imgUrl} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge className="mb-3">{product.category}</Badge>
            <h1 className="text-4xl text-white mb-2">{product.name}</h1>
            <p className="text-white/60">bởi {product.brand}</p>
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
            <span className="text-white/50">({product.reviews} đánh giá)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl text-white">{formatCurrency(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xl text-white/50 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
            {product.discount && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                Tiết kiệm {product.discount}%
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
                Màu sắc: <span className="text-purple-400">{selectedColor}</span>
              </label>
              <div className="flex gap-2">
                {product.colors.map((color: any) => {
                  const colorName: string = color?.name ?? color;
                  return (
                    <button
                      key={colorName}
                      onClick={() => setSelectedColor(colorName)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === colorName
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-white/10 bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <span className="text-white text-sm">{colorName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="text-white mb-2 block">
                Kích cỡ: <span className="text-purple-400">{selectedSize}</span>
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
                ⚡ Chỉ còn {product.stock} sản phẩm - đặt hàng ngay!
              </p>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="text-white mb-2 block">Số lượng</label>
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
                (còn {product.stock} sản phẩm)
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
              Thêm vào giỏ
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
            Mua ngay
          </Button>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white">Miễn phí vận chuyển</p>
                <p className="text-white/50 text-xs">Đơn hàng trên 50</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white">Thanh toán an toàn</p>
                <p className="text-white/50 text-xs">Bảo mật 100%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <RotateCcw className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white">Đổi trả dễ dàng</p>
                <p className="text-white/50 text-xs">Chính sách đổi trả 30 ngày</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white">Hỗ trợ 24/7</p>
                <p className="text-white/50 text-xs">Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  if (product.seller?.userId) {
                    onNavigate("seller-profile", { sellerUserId: product.seller.userId });
                  }
                }}
              >
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500">
                    {(product.seller?.storeName?.[0] || product.brand?.[0] || "S").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white">{product.seller?.storeName || `${product.brand} Store`}</p>
                  <p className="text-sm text-white/50">
                    {product.seller?.isVerified ? "✓ Người bán đã xác minh" : "Người bán"}
                    {product.seller?.positiveRating ? ` · ${product.seller.positiveRating}% tích cực` : ""}
                  </p>
                </div>
              </div>
              {product.seller?.userId && (
                <Button variant="outline" onClick={() => onNavigate("chat", {
                  sellerId: product.seller.userId,
                  name: product.seller.storeName || product.brand || "Người bán",
                  productId: product.id,
                  productName: product.name,
                })}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Nhắn tin
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="w-full justify-start bg-white/5 border-b border-white/10 rounded-none">
          <TabsTrigger value="description">Mô tả</TabsTrigger>
          <TabsTrigger value="specifications">Thông số kỹ thuật</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-8">
          <div className="prose prose-invert max-w-none">
            <h3 className="text-2xl text-white mb-4">Mô tả sản phẩm</h3>
            <p className="text-white/70">{product.description}</p>
          </div>
        </TabsContent>

        <TabsContent value="specifications" className="mt-8">
          <h3 className="text-2xl text-white mb-6">Thông số kỹ thuật chi tiết</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {(Array.isArray(product.specifications) ? product.specifications : Object.entries(product.specifications ?? {}).map(([key, value]) => ({ key, value }))).map((spec: any) => (
              <div
                key={spec.key}
                className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between"
              >
                <span className="text-white/60">{spec.key}</span>
                <span className="text-white">{spec.value}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-8">
          {/* Write Review Button / Form */}
          {isAuthenticated && !userReview && !canReview && (
            <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-white/50 text-sm text-center">
                🛍️ Mua và nhận sản phẩm này để viết đánh giá.
              </p>
            </div>
          )}
          {isAuthenticated && canReview && !userReview && (
            <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6">
              {!reviewFormOpen ? (
                <div className="flex items-center justify-between">
                  <p className="text-white/70">Bạn đã mua sản phẩm này. Hãy chia sẻ trải nghiệm!</p>
                  <Button
                    onClick={() => setReviewFormOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Viết đánh giá
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-white text-lg">Viết đánh giá của bạn</h3>

                  {/* Star Rating */}
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Đánh giá *</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setReviewRating(star)}>
                          <Star className={`h-8 w-8 transition-colors ${star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`} />
                        </button>
                      ))}
                      <span className="ml-2 text-white/60 self-center">{reviewRating}/5 sao</span>
                    </div>
                  </div>

                  {/* Emoji Reaction */}
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Biểu tượng cảm xúc (tùy chọn)</label>
                    <div className="flex items-center gap-2">
                      {reviewEmoji && <span className="text-3xl">{reviewEmoji}</span>}
                      <Button variant="ghost" size="sm" className="text-white/60 border border-white/10" onClick={() => setShowReviewEmojiPicker((v) => !v)}>
                        <Smile className="h-4 w-4 mr-1" /> Chọn biểu tượng
                      </Button>
                      {reviewEmoji && (
                        <Button variant="ghost" size="sm" className="text-white/40" onClick={() => setReviewEmoji("")}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {showReviewEmojiPicker && (
                      <div className="mt-2 p-3 bg-zinc-900 border border-white/10 rounded-xl flex flex-wrap gap-2 w-fit">
                        {REVIEW_EMOJIS.map((e) => (
                          <button key={e} className="text-2xl hover:scale-125 transition-transform" onClick={() => { setReviewEmoji(e); setShowReviewEmojiPicker(false); }}>
                            {e}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Review Comment */}
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Nhận xét *</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Hình ảnh đánh giá (tùy chọn)</label>
                    <input ref={reviewImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleReviewImageUpload} />
                    <div className="flex flex-wrap gap-3">
                      {reviewImages.map((url, i) => (
                        <div key={i} className="relative w-20 h-20">
                          <img src={url} alt={`Review img ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
                          <button
                            className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 flex items-center justify-center"
                            onClick={() => setReviewImages((prev) => prev.filter((_, idx) => idx !== i))}
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ))}
                      {reviewImages.length < 5 && (
                        <button
                          onClick={() => reviewImageInputRef.current?.click()}
                          disabled={isUploadingReviewImage}
                          className="w-20 h-20 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-white/40 hover:border-purple-500 hover:text-purple-400 transition-colors"
                        >
                          <Upload className="h-5 w-5 mb-1" />
                          <span className="text-xs">{isUploadingReviewImage ? "..." : "Thêm"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submit / Cancel */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview || !reviewComment.trim()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                    </Button>
                    <Button variant="ghost" onClick={() => setReviewFormOpen(false)} className="text-white/60">
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {userReview && (
            <div className="mb-8 bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4">
              <p className="text-purple-300 text-sm">✓ Bạn đã đánh giá sản phẩm này rồi.</p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="text-5xl text-white mb-2">{ratingAverage}</div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(ratingAverage)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-white/20"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-white/60">Dựa trên {product.reviews} đánh giá</p>
              </div>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-white/60 w-8">{star}★</span>
                    <Progress value={getBreakdownPercentage(star)} className="flex-1" />
                    <span className="text-sm text-white/60 w-12">
                      {getBreakdownPercentage(star)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-white/50">Đang tải đánh giá...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-white/50">Chưa có đánh giá.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-purple-500">
                            {getAvatarInitials(review.user?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white">{review.user?.name}</p>
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
                            <span className="text-sm text-white/50">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {(review as any).emoji && (
                      <span className="text-2xl mb-2 block">{(review as any).emoji}</span>
                    )}
                    <p className="text-white/70 mb-4">{review.comment}</p>
                    {(review as any).images?.length > 0 && (
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {(review as any).images.map((url: string, i: number) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Ảnh đánh giá ${i + 1}`}
                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(url, "_blank")}
                          />
                        ))}
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">
                      👍 Hữu ích ({review.helpful})
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {!relatedLoading && relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl text-white mb-8">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((related) => (
              <div
                key={related.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all cursor-pointer"
                onClick={() => onNavigate("product", related)}
              >
                <div className="aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={related.images?.[0] || related.image || ""}
                    alt={related.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <p className="text-white/60 text-xs mb-1">{related.brand}</p>
                  <p className="text-white text-sm font-medium line-clamp-2 mb-2">{related.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{formatCurrency(related.price)}</span>
                    {related.originalPrice && (
                      <span className="text-white/40 text-sm line-through">{formatCurrency(related.originalPrice)}</span>
                    )}
                  </div>
                  {related.rating !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-white/60 text-xs">{related.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
