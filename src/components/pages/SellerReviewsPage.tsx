import { useEffect, useState } from "react";
import { Star, Trash2, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { get, del } from "../../lib/api";
import { toast } from "sonner";

interface SellerProduct {
  id: string;
  name: string;
  images: { url: string }[];
  ratingAverage: number;
  reviewCount: number;
}

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; avatar?: string | null };
  product: { id: string; name: string; images: { url: string }[] };
}

interface SellerReviewsPageProps {
  onNavigate: (page: string) => void;
}

export function SellerReviewsPage({ onNavigate }: SellerReviewsPageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const limit = 20;

  // Fetch seller products for filter dropdown
  useEffect(() => {
    get<{ products: SellerProduct[] }>("/api/v1/seller/products")
      .then((data) => setProducts(data.products))
      .catch(() => {});
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (selectedProduct !== "all") params.set("productId", selectedProduct);
      const data = await get<{ reviews: Review[]; total: number }>(`/api/v1/seller/reviews?${params}`);
      setReviews(data.reviews);
      setTotal(data.total);
    } catch {
      toast.error("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [selectedProduct]);

  useEffect(() => {
    fetchReviews();
  }, [page, selectedProduct]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await del<{ message: string }>(`/api/v1/seller/reviews/${deleteTarget.id}`);
      toast.success(res.message);
      setDeleteTarget(null);
      fetchReviews();
    } catch (e: any) {
      toast.error(e.message || "Lỗi");
    }
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`} />
      ))}
    </div>
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý đánh giá</h1>
          <p className="text-white/50 text-sm mt-0.5">{total} đánh giá</p>
        </div>
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-56 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Tất cả sản phẩm" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 max-h-64">
            <SelectItem value="all" className="text-white">Tất cả sản phẩm</SelectItem>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-white">
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[160px]">{p.name}</span>
                  <span className="text-white/40 text-xs flex-shrink-0">({p.reviewCount})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating overview for selected product */}
      {selectedProduct !== "all" && (() => {
        const prod = products.find((p) => p.id === selectedProduct);
        if (!prod) return null;
        return (
          <Card className="bg-white/5 border-white/10 p-4 flex items-center gap-4">
            {prod.images[0] && (
              <img src={prod.images[0].url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
            )}
            <div>
              <p className="text-white font-medium">{prod.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={Math.round(prod.ratingAverage)} />
                <span className="text-yellow-400 font-semibold text-sm">{prod.ratingAverage.toFixed(1)}</span>
                <span className="text-white/40 text-xs">({prod.reviewCount} đánh giá)</span>
              </div>
            </div>
          </Card>
        );
      })()}

      <Card className="bg-white/5 border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <Package className="h-8 w-8 text-white/20" />
            <p className="text-white/30 text-sm">Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {reviews.map((review) => (
              <div key={review.id} className="px-4 py-4 hover:bg-white/[0.02] flex gap-4">
                {/* Product image (show only when viewing all) */}
                {selectedProduct === "all" && review.product.images[0] && (
                  <img src={review.product.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {selectedProduct === "all" && (
                        <p className="text-white/50 text-xs truncate mb-0.5">{review.product.name}</p>
                      )}
                      <p className="text-white font-medium text-sm">
                        {review.user.firstName} {review.user.lastName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-white/30 text-xs">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400/70 hover:text-red-400 hover:bg-red-400/10"
                        onClick={() => setDeleteTarget(review)}
                        title="Xóa đánh giá"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                  {review.comment && (
                    <p className="text-white/60 text-sm mt-1 line-clamp-3">{review.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-sm">Trang {page} / {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-zinc-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Xóa đánh giá?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Xóa đánh giá của <strong className="text-white">{deleteTarget?.user.firstName} {deleteTarget?.user.lastName}</strong>. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
