import { useEffect, useState } from "react";
import { Star, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
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
import { get, del } from "../../lib/api";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string; avatar?: string | null };
  product: { id: string; name: string; images: { url: string }[] };
}

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const limit = 20;

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await get<{ reviews: Review[]; total: number }>(`/api/v1/admin/reviews?page=${page}&limit=${limit}`);
      setReviews(data.reviews);
      setTotal(data.total);
    } catch {
      toast.error("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [page]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await del<{ message: string }>(`/api/v1/admin/reviews/${deleteTarget.id}`);
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
      <div>
        <h1 className="text-2xl font-bold text-white">Quản lý đánh giá</h1>
        <p className="text-white/50 text-sm mt-0.5">{total} đánh giá</p>
      </div>

      <Card className="bg-white/5 border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {reviews.map((review) => (
              <div key={review.id} className="px-4 py-4 hover:bg-white/[0.02] flex gap-4">
                {/* Product Image */}
                <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                  {review.product.images[0] ? (
                    <img src={review.product.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No img</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white font-medium text-sm truncate">{review.product.name}</p>
                      <p className="text-white/50 text-xs">
                        {review.user.firstName} {review.user.lastName} · {review.user.email}
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
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1">
                    <StarRating rating={review.rating} />
                    {review.comment && (
                      <p className="text-white/60 text-sm mt-1 line-clamp-2">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="flex items-center justify-center h-32">
                <p className="text-white/30 text-sm">Chưa có đánh giá nào</p>
              </div>
            )}
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
              Xóa đánh giá của <strong className="text-white">{deleteTarget?.user.firstName} {deleteTarget?.user.lastName}</strong> về sản phẩm <strong className="text-white">{deleteTarget?.product.name}</strong>.
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
