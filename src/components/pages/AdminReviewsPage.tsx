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
import { get, del, post } from "../../lib/api";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";
import {
  AdminPageLayout,
  AdminSpinner,
  adminPanelClass,
  AdminPagination,
} from "../admin/AdminPageLayout";

interface ReviewReply {
  id: string;
  comment: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; avatar?: string | null };
}

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string; avatar?: string | null };
  product: { id: string; name: string; images: { url: string }[] };
  replies?: ReviewReply[];
}

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const limit = 10;

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

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      const data = await post<{ reply: ReviewReply }>(`/api/v1/reviews/${reviewId}/replies`, {
        comment: replyText.trim(),
      });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, replies: [...(r.replies || []), data.reply] } : r
        )
      );
      setReplyText("");
      setReplyingTo(null);
      toast.success("Đã phản hồi đánh giá");
    } catch (e: any) {
      toast.error(e.message || "Không thể gửi phản hồi");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminPageLayout
      title="Quản lý đánh giá"
      description={`${total.toLocaleString("vi-VN")} đánh giá sản phẩm`}
    >
      <Card className={adminPanelClass}>
        {loading ? (
          <AdminSpinner />
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex gap-4 px-4 py-4 transition-colors hover:bg-gray-50/80 sm:px-6"
              >
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  {review.product.images[0] ? (
                    <img src={review.product.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-gray-900 font-medium text-sm truncate">{review.product.name}</p>
                      <p className="text-gray-500 text-xs">
                        {review.user.firstName} {review.user.lastName} · {review.user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-gray-400 text-xs">
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
                  {review.comment && (
                    <p className="text-gray-500 text-sm mt-1 mb-3">{review.comment}</p>
                  )}

                  {/* Replies Thread */}
                  {review.replies && review.replies.length > 0 && (
                    <div className="mt-3 space-y-3 border-l-2 border-gray-100 pl-4 py-1">
                      {review.replies.map((reply) => (
                        <div key={reply.id} className="text-sm">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-gray-900 text-xs text-blue-700">
                              {reply.user.firstName} {reply.user.lastName} (Admin)
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(reply.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <p className="text-gray-600 leading-relaxed">{reply.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 text-xs gap-1.5 ${replyingTo === review.id ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-600"}`}
                      onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {replyingTo === review.id ? "Đang viết..." : "Phản hồi"}
                    </Button>
                  </div>

                  {replyingTo === review.id && (
                    <div className="mt-3 flex items-start gap-2">
                      <div className="flex-1">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Nhập nội dung phản hồi của quản trị viên..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none resize-none"
                          rows={2}
                          autoFocus
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Button
                          size="icon"
                          className="h-9 w-9 bg-blue-600 hover:bg-blue-700 shadow-sm"
                          disabled={!replyText.trim() || isSubmittingReply}
                          onClick={() => handleReplySubmit(review.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Star className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm font-medium text-gray-900">Chưa có đánh giá</p>
                <p className="mt-1 text-xs text-gray-500">Dữ liệu sẽ hiển thị khi có review từ khách</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        setCurrentPage={setPage}
        totalItems={total}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Xóa đánh giá?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Xóa đánh giá của <strong className="text-gray-900">{deleteTarget?.user.firstName} {deleteTarget?.user.lastName}</strong> về sản phẩm <strong className="text-gray-900">{deleteTarget?.product.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageLayout>
  );
}
