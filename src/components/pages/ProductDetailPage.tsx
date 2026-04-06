import React, { useState, useEffect, useRef } from "react";
import { Star, Heart, Share2, Truck, Shield, RotateCcw, MessageCircle, Minus, Plus, Upload, X, Smile } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner";
import { get, post } from "../../lib/api";
import { API_URL } from "../../lib/api";
import { viewHistoryService } from "../../services/viewHistory.service";
import { formatCurrency } from "../../lib/currency";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { EmojiPickerButton } from "../ui/emoji-picker";
import { SellerVouchers } from "../SellerVouchers";

interface ReviewReply {
  id: string;
  comment: string;
  images: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

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
  images: string[];
  emoji?: string;
  helpful: number;
  user: ReviewUser;
  createdAt: string;
  replies: ReviewReply[];
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
  user?: any;
}

export function ProductDetailPage({
  product,
  onNavigate,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  isInWishlist: initialIsInWishlist,
  isAuthenticated = false,
  user,
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
  const [reviewsPage, setReviewsPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [totalReviews, setTotalReviews] = useState(product.reviews ?? 0);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdownItem[]>([]);
  const [ratingAverage, setRatingAverage] = useState<number>(product.rating ?? 0);

  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const [similarProducts, setSimilarProducts] = useState<RelatedProduct[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

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
  const reviewImageInputRef = useRef<HTMLInputElement>(null);

  // Threaded reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyImages, setReplyImages] = useState<string[]>([]);
  const [isUploadingReplyImage, setIsUploadingReplyImage] = useState(false);
  const replyImageInputRef = useRef<HTMLInputElement>(null);

  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);

  const onReviewEmojiClick = (emoji: string) => {
    setReviewEmoji(emoji);
  };

  const onCommentEmojiClick = (emoji: string) => {
    setReviewComment((prev) => prev + emoji);
  };

  const onReplyEmojiClick = (emoji: string) => {
    setReplyText((prev) => prev + emoji);
  };

  useEffect(() => {
    if (!product.id) return;

    // Track view (fire-and-forget, only for authenticated users)
    if (isAuthenticated) {
      viewHistoryService.trackView(product.id).catch(() => { });
    }

    fetchReviews(1);
    fetchRelated();
    fetchReviewEligibility();
    fetchSimilar();
    fetchCoupons();
  }, [product.id, isAuthenticated]);

  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      const data = await get(`/api/v1/products/${product.id}`);
      setCoupons(data.coupons ?? []);
    } catch {
      // ignore
    } finally {
      setCouponsLoading(false);
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
      // silently fall back
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
      // not logged in
    }
  };

  const fetchSimilar = async () => {
    setSimilarLoading(true);
    try {
      const data = await viewHistoryService.getSimilarProducts(product.id, 6);
      setSimilarProducts(data.products ?? []);
    } catch {
      // silently ignore
    } finally {
      setSimilarLoading(false);
    }
  };

  const fetchReviews = async (page = 1, append = false) => {
    if (!append) setReviewsLoading(true);
    try {
      const data = await get(`/api/v1/reviews/products/${product.id}?page=${page}&limit=10`);
      const newReviews = data.reviews ?? [];
      if (append) {
        setReviews((prev) => [...prev, ...newReviews]);
      } else {
        setReviews(newReviews);
      }
      setHasMoreReviews(newReviews.length === 10);

      const summary = data.summary ?? {};
      setTotalReviews(summary.reviewCount ?? data.total ?? 0);
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
      // silently fall back
    } finally {
      if (!append) setReviewsLoading(false);
    }
  };

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
      setTotalReviews((prev) => prev + 1);
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

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      const data = await post<{ reply: ReviewReply }>(`/api/v1/reviews/${reviewId}/replies`, {
        comment: replyText.trim(),
        images: replyImages,
      });

      // Update local state
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, replies: [...(r.replies || []), data.reply] }
            : r
        )
      );
      setReplyText("");
      setReplyImages([]);
      setReplyingTo(null);
      toast.success("Đã gửi phản hồi");
    } catch (err: any) {
      toast.error(err.message || "Không thể gửi phản hồi");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReplyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (replyImages.length >= 3) {
      toast.error("Tối đa 3 ảnh cho một phản hồi");
      return;
    }

    setIsUploadingReplyImage(true);
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
      setReplyImages((prev) => [...prev, url]);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải ảnh lên");
    } finally {
      setIsUploadingReplyImage(false);
      if (replyImageInputRef.current) replyImageInputRef.current.value = "";
    }
  };

  const handleLoadMoreReviews = () => {
    const nextPage = reviewsPage + 1;
    setReviewsPage(nextPage);
    fetchReviews(nextPage, true);
  };

  const handleHelpfulClick = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để bình chọn");
      return;
    }
    try {
      await post(`/api/v1/reviews/${reviewId}/helpful`, {});
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r
        )
      );
      toast.success("Cảm ơn bạn đã phản hồi!");
    } catch (err: any) {
      toast.error(err.message || "Bạn đã bình chọn cho đánh giá này rồi");
    }
  };

  const getAvatarInitials = (name?: string): string => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm">
              <ImageWithFallback
                src={product.images?.[selectedImage]?.url ?? product.images?.[selectedImage] ?? product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700"
                previewable={true}
              />
              {product.discount && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 shadow-sm font-bold">
                  -{product.discount}%
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {(product.images || [product.image]).map((img: any, i: number) => {
                const imgUrl = img?.url ?? img;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square bg-white rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedImage === i
                      ? "border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20"
                      : "border-gray-200 hover:border-gray-300"
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
              <Badge variant="secondary" className="mb-3 bg-blue-50 text-blue-700 border-blue-200/80 rounded-lg font-medium">{product.category}</Badge>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-2">{product.name}</h1>
              <p className="text-gray-500 text-sm">bởi <span className="text-gray-700 font-medium">{product.brand}</span></p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200"
                      }`}
                  />
                ))}
              </div>
              <span className="text-gray-900 font-semibold text-sm">{product.rating}</span>
              <span className="text-gray-400 text-sm">({product.reviews} đánh giá)</span>
              <Separator orientation="vertical" className="h-4 bg-gray-200" />
              {product.stock > 0 ? (
                <span className="text-emerald-600 text-sm font-medium">Còn hàng</span>
              ) : (
                <span className="text-red-500 text-sm font-medium">Hết hàng</span>
              )}
            </div>

            {/* Price */}
            <div className="bg-gray-50/80 rounded-xl p-4 -mx-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl lg:text-4xl text-blue-700 font-bold tabular-nums">{formatCurrency(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through tabular-nums">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
                {product.discount && (
                  <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-200 font-bold">
                    -{product.discount}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2.5 block">
                  Màu sắc: <span className="text-blue-600 font-semibold">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: any) => {
                    const colorName: string = color?.name ?? color;
                    return (
                      <button
                        key={colorName}
                        onClick={() => setSelectedColor(colorName)}
                        className={`px-4 py-2.5 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${selectedColor === colorName
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {colorName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2.5 block">
                  Kích cỡ: <span className="text-blue-600 font-semibold">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] px-4 py-2.5 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${selectedSize === size
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            {product.stock > 0 && product.stock < 10 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-amber-700 text-sm font-medium">
                  Chỉ còn {product.stock} sản phẩm — đặt hàng ngay!
                </p>
              </div>
            )}
            {product.stock === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-red-500" />
                <p className="text-red-700 text-sm font-medium">
                  Sản phẩm hiện đang hết hàng.
                </p>
              </div>
            )}

            {/* Quantity */}
            <div className={product.stock === 0 ? "opacity-50 pointer-events-none" : ""}>
              <label className="text-sm font-medium text-gray-900 mb-2.5 block">Số lượng</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || product.stock === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-gray-900 font-semibold tabular-nums text-sm border-x border-gray-200">
                    {product.stock === 0 ? 0 : quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-none"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || product.stock === 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-gray-400 text-sm">
                  {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl h-12 text-base font-semibold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? "Thêm vào giỏ" : "Hết hàng"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleLike}
                className={`h-12 w-12 rounded-xl transition-all ${isLiked ? "border-red-300 bg-red-50 text-red-500 hover:bg-red-100" : "hover:bg-gray-50"}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500" : ""}`} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleShare}
                className="h-12 w-12 rounded-xl hover:bg-gray-50 transition-all"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-xl h-12 text-base font-semibold border-2 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              {product.stock > 0 ? "Mua ngay" : "Sản phẩm hiện tại đang hết hàng !"}
            </Button>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { icon: Truck, label: "Miễn phí vận chuyển", desc: "Đơn hàng trên 500K", color: "text-blue-600 bg-blue-50" },
                { icon: Shield, label: "Thanh toán an toàn", desc: "Bảo mật 100%", color: "text-emerald-600 bg-emerald-50" },
                { icon: RotateCcw, label: "Đổi trả dễ dàng", desc: "30 ngày đổi trả", color: "text-orange-600 bg-orange-50" },
                { icon: MessageCircle, label: "Hỗ trợ 24/7", desc: "Luôn sẵn sàng", color: "text-violet-600 bg-violet-50" },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 text-sm font-medium leading-tight">{label}</p>
                    <p className="text-gray-400 text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Seller Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div
                  className="flex items-center gap-3 cursor-pointer group min-w-0"
                  onClick={() => {
                    if (product.seller?.userId) {
                      onNavigate("seller-profile", { sellerUserId: product.seller.userId });
                    }
                  }}
                >
                  <Avatar className="h-11 w-11 flex-shrink-0">
                    {product.seller?.avatar && <AvatarImage src={product.seller.avatar} className="object-cover" />}
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
                      {(product.seller?.storeName?.[0] || product.brand?.[0] || "S").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-semibold text-sm group-hover:text-blue-600 transition-colors truncate">{product.seller?.storeName || `${product.brand} Store`}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      {product.seller?.isVerified && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <Shield className="h-3 w-3" /> Đã xác minh
                        </span>
                      )}
                      {product.seller?.positiveRating && (
                        <span>{product.seller.positiveRating}% tích cực</span>
                      )}
                      {!product.seller?.isVerified && !product.seller?.positiveRating && <span>Người bán</span>}
                    </div>
                  </div>
                </div>
                {product.seller?.userId && (
                  <Button variant="outline" className="rounded-xl flex-shrink-0 h-9 text-sm" onClick={() => onNavigate("chat", {
                    sellerId: product.seller.userId,
                    name: product.seller.storeName || product.brand || "Người bán",
                    productId: product.id,
                    productName: product.name,
                  })}>
                    <MessageCircle className="h-4 w-4 mr-1.5" />
                    Nhắn tin
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seller Vouchers */}
        <SellerVouchers coupons={coupons} />

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <Tabs defaultValue="description" variant="underline" className="w-full">
            <TabsList>
              <TabsTrigger value="description">Mô tả</TabsTrigger>
              <TabsTrigger value="specifications">Thông số kỹ thuật</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá ({totalReviews})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="p-6 lg:p-8">
              <div className="prose max-w-none">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="p-6 lg:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Thông số kỹ thuật chi tiết</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {(Array.isArray(product.specifications) ? product.specifications : Object.entries(product.specifications ?? {}).map(([key, value]) => ({ key, value }))).map((spec: any, idx: number) => (
                  <div
                    key={spec.key}
                    className={`rounded-xl p-4 flex justify-between items-center ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white border border-gray-100'}`}
                  >
                    <span className="text-gray-500 text-sm">{spec.key}</span>
                    <span className="text-gray-900 font-medium text-sm">{spec.value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="p-6 lg:p-8">
              {/* Write Review Button / Form */}
              {isAuthenticated && !userReview && !canReview && (
                <div className="mb-8 bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm text-center">
                    Mua và nhận sản phẩm này để viết đánh giá.
                  </p>
                </div>
              )}
              {isAuthenticated && canReview && !userReview && (
                <div className="mb-8 bg-blue-50/80 border border-blue-200/80 rounded-xl p-6">
                  {!reviewFormOpen ? (
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-gray-700 text-sm">Bạn đã mua sản phẩm này. Hãy chia sẻ trải nghiệm!</p>
                      <Button
                        onClick={() => setReviewFormOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl flex-shrink-0"
                      >
                        Viết đánh giá
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-gray-900 text-lg font-bold">Viết đánh giá của bạn</h3>

                      {/* Star Rating */}
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-2 block">Đánh giá *</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="hover:scale-110 transition-transform"
                            >
                              <Star className={`h-7 w-7 transition-colors ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-200 hover:text-gray-300"}`} />
                            </button>
                          ))}
                          <span className="ml-2 text-gray-500 self-center text-sm">{reviewRating}/5 sao</span>
                        </div>
                      </div>

                      {/* Emoji Reaction */}
                      <div>
                        <label className="text-gray-600 text-sm mb-2 block">Biểu tượng cảm xúc (tùy chọn)</label>
                        <div className="flex items-center gap-2">
                          {reviewEmoji && <span className="text-3xl animate-in zoom-in-50 duration-300">{reviewEmoji}</span>}

                          <EmojiPickerButton onEmojiSelect={onReviewEmojiClick} align="start" />

                          {reviewEmoji && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-xl"
                              onClick={() => setReviewEmoji("")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Review Comment */}
                      <div className="relative">
                        <label className="text-gray-700 text-sm font-medium mb-2 block">Nhận xét *</label>
                        <div className="relative">
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                            rows={4}
                            className="w-full bg-white border border-gray-200 rounded-xl p-3.5 pr-12 text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                          />
                          <div className="absolute right-3 bottom-3">
                            <EmojiPickerButton onEmojiSelect={onCommentEmojiClick} />
                          </div>
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label className="text-gray-600 text-sm mb-2 block">Hình ảnh đánh giá (tùy chọn)</label>
                        <input ref={reviewImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleReviewImageUpload} />
                        <div className="flex flex-wrap gap-3">
                          {reviewImages.map((url, i) => (
                            <div key={i} className="relative w-20 h-20">
                              <ImageWithFallback
                                src={url}
                                alt={`Review img ${i + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                                previewable={true}
                              />
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
                              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                            >
                              <Upload className="h-5 w-5 mb-1" />
                              <span className="text-xs">{isUploadingReviewImage ? "..." : "Thêm"}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Submit / Cancel */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview || !reviewComment.trim()}
                          className="bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold"
                        >
                          {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                        </Button>
                        <Button variant="ghost" onClick={() => setReviewFormOpen(false)} className="text-gray-500 rounded-xl">
                          Hủy
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {userReview && (
                <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <p className="text-emerald-700 text-sm font-medium">Bạn đã đánh giá sản phẩm này rồi.</p>
                </div>
              )}

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Rating Summary */}
                <div className="bg-gray-50/80 rounded-xl p-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-gray-900 mb-1 tabular-nums">{ratingAverage}</div>
                    <div className="flex justify-center mb-2 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(ratingAverage)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-500 text-sm">Dựa trên {totalReviews} đánh giá</p>
                  </div>
                  <div className="space-y-2.5">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2.5">
                        <span className="text-xs text-gray-500 w-7 text-right tabular-nums">{star} ★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${getBreakdownPercentage(star)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-9 tabular-nums">
                          {getBreakdownPercentage(star)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-4">
                  {reviewsLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="h-8 w-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-gray-400 text-sm mt-3">Đang tải đánh giá...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Star className="h-10 w-10 text-gray-200 mb-3" />
                      <p className="text-gray-500 font-medium">Chưa có đánh giá</p>
                      <p className="text-gray-400 text-sm mt-1">Hãy là người đầu tiên đánh giá sản phẩm này.</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 flex-shrink-0">
                              <AvatarImage src={review.user?.avatar} className="object-cover" />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                                {getAvatarInitials(review.user?.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-gray-900 font-medium text-sm">{review.user?.name}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3.5 w-3.5 ${i < review.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-200"
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isAuthenticated && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 gap-1.5 text-xs font-semibold ${replyingTo === review.id ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-600"}`}
                              onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              {replyingTo === review.id ? "Đang viết..." : "Trả lời"}
                            </Button>
                          )}
                        </div>
                        {review.emoji && (
                          <span className="text-2xl mb-2 block">{review.emoji}</span>
                        )}
                        <p className="text-gray-600 text-sm leading-relaxed mb-3 pl-12">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mb-3 flex-wrap pl-12">
                            {review.images.map((url, i) => (
                              <ImageWithFallback
                                key={i}
                                src={url}
                                alt={`Ảnh đánh giá ${i + 1}`}
                                className="w-16 h-16 object-cover rounded-lg"
                                previewable={true}
                              />
                            ))}
                          </div>
                        )}

                        <div className="pl-12">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-blue-600 text-xs h-8 rounded-lg -ml-2 transition-colors"
                            onClick={() => handleHelpfulClick(review.id)}
                          >
                            👍 Hữu ích ({review.helpful})
                          </Button>
                        </div>

                        {/* Replies Thread */}
                        {review.replies && review.replies.length > 0 && (
                          <div className="ml-12 mt-4 space-y-4 border-l-2 border-gray-100 pl-4 mb-4">
                            {(expandedReplies[review.id] ? review.replies : review.replies.slice(0, 1)).map((reply) => {
                              const isSeller = reply.user?.id === product.seller?.userId;
                              return (
                                <div key={reply.id} className="relative group/reply">
                                  <div className="flex gap-3 mb-1">
                                    <Avatar className="h-7 w-7 flex-shrink-0">
                                      <AvatarImage src={reply.user?.avatar} className="object-cover" />
                                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-[10px] font-bold">
                                        {getAvatarInitials(reply.user?.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-xs font-bold ${isSeller ? "text-blue-700" : "text-gray-900"}`}>
                                          {reply.user?.name}
                                          {isSeller && (
                                            <Badge className="ml-1.5 bg-blue-100 text-blue-700 border-0 hover:bg-blue-100 h-4 text-[10px] px-1.5">
                                              Cửa hàng
                                            </Badge>
                                          )}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                          {new Date(reply.createdAt).toLocaleDateString("vi-VN")}
                                        </span>
                                      </div>
                                      <p className="text-gray-600 text-xs leading-relaxed mb-2">{reply.comment}</p>

                                      {reply.images && reply.images.length > 0 && (
                                        <div className="flex gap-2 mb-2 flex-wrap">
                                          {reply.images.map((url, i) => (
                                            <ImageWithFallback
                                              key={i}
                                              src={url}
                                              alt="Reply"
                                              className="w-12 h-12 object-cover rounded-lg"
                                              previewable={true}
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {review.replies.length > 1 && !expandedReplies[review.id] && (
                              <button
                                onClick={() => setExpandedReplies(prev => ({ ...prev, [review.id]: true }))}
                                className="text-xs text-blue-600 hover:text-blue-700 font-semibold mt-2"
                              >
                                Xem thêm {review.replies.length - 1} phản hồi...
                              </button>
                            )}

                            {review.replies.length > 1 && expandedReplies[review.id] && (
                              <button
                                onClick={() => setExpandedReplies(prev => ({ ...prev, [review.id]: false }))}
                                className="text-xs text-gray-400 hover:text-gray-500 font-semibold mt-2"
                              >
                                Thu gọn
                              </button>
                            )}
                          </div>
                        )}

                        {/* Reply Input */}
                        {replyingTo === review.id && (
                          <div className="ml-12 mt-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="relative">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Chào ${review.user?.name}, trả lời đánh giá này...`}
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 pr-10 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none resize-none"
                                rows={2}
                                autoFocus
                              />
                              <div className="absolute right-2 bottom-2">
                                <EmojiPickerButton onEmojiSelect={onReplyEmojiClick} iconSize={18} />
                              </div>
                            </div>

                            {/* Reply Images Upload */}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {replyImages.map((url, i) => (
                                <div key={i} className="relative w-14 h-14">
                                  <ImageWithFallback src={url} alt="" className="w-full h-full object-cover rounded-lg" previewable={true} />
                                  <button
                                    className="absolute -top-1 -right-1 bg-red-500 rounded-full h-4 w-4 flex items-center justify-center shadow-sm"
                                    onClick={() => setReplyImages((prev) => prev.filter((_, idx) => idx !== i))}
                                  >
                                    <X className="h-2.5 w-2.5 text-white" />
                                  </button>
                                </div>
                              ))}
                              {replyImages.length < 3 && (
                                <button
                                  onClick={() => replyImageInputRef.current?.click()}
                                  disabled={isUploadingReplyImage}
                                  className="w-14 h-14 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                >
                                  <Upload className="h-4 w-4" />
                                  <span className="text-[10px] mt-0.5">{isUploadingReplyImage ? "..." : "Ảnh"}</span>
                                </button>
                              )}
                              <input ref={replyImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleReplyImageUpload} />
                            </div>

                            <div className="flex gap-2 justify-end mt-3 pt-3 border-t border-gray-100">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                className="text-gray-500 h-8"
                              >
                                Hủy
                              </Button>
                              <Button
                                size="sm"
                                disabled={!replyText.trim() || isSubmittingReply}
                                onClick={() => handleReplySubmit(review.id)}
                                className="bg-blue-600 hover:bg-blue-700 h-8 font-semibold"
                              >
                                {isSubmittingReply ? "..." : "Gửi"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {hasMoreReviews && (
                    <div className="pt-4 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={handleLoadMoreReviews}
                        disabled={reviewsLoading}
                        className="rounded-xl px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
                      >
                        {reviewsLoading ? "Đang tải..." : "Xem thêm nhận xét"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {!relatedLoading && relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Sản phẩm liên quan</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((related) => (
                <div
                  key={related.id}
                  className="group bg-white border border-gray-200/80 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  onClick={() => onNavigate("product", related)}
                >
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <ImageWithFallback
                      src={(related.images?.[0] as any)?.url ?? related.images?.[0] ?? related.image ?? ""}
                      alt={related.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>
                  <div className="p-3.5">
                    <p className="text-gray-400 text-xs mb-0.5">{related.brand}</p>
                    <p className="text-gray-900 text-sm font-semibold line-clamp-2 mb-2 leading-snug">{related.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-700 font-bold text-sm tabular-nums">{formatCurrency(related.price)}</span>
                      {related.originalPrice && (
                        <span className="text-gray-400 text-xs line-through tabular-nums">{formatCurrency(related.originalPrice)}</span>
                      )}
                    </div>
                    {related.rating !== undefined && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-gray-500 text-xs tabular-nums">{related.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Similar Products */}
        {!similarLoading && similarProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-1.5">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Sản phẩm tương tự</h2>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium">AI</Badge>
            </div>
            <p className="text-gray-400 text-sm mb-6">Được gợi ý dựa trên sản phẩm này</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarProducts.map((similar) => (
                <div
                  key={similar.id}
                  className="group bg-white border border-gray-200/80 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  onClick={() => onNavigate("product", similar)}
                >
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <ImageWithFallback
                      src={(similar.images?.[0] as any)?.url ?? similar.images?.[0] ?? similar.image ?? ""}
                      alt={similar.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>
                  <div className="p-3.5">
                    <p className="text-gray-400 text-xs mb-0.5">{similar.brand}</p>
                    <p className="text-gray-900 text-sm font-semibold line-clamp-2 mb-2 leading-snug">{similar.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-700 font-bold text-sm tabular-nums">{formatCurrency(similar.price)}</span>
                      {similar.originalPrice && (
                        <span className="text-gray-400 text-xs line-through tabular-nums">{formatCurrency(similar.originalPrice)}</span>
                      )}
                    </div>
                    {similar.rating !== undefined && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-gray-500 text-xs tabular-nums">{similar.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
