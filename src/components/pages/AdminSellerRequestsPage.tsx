import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { get, put } from "../../lib/api";
import { toast } from "sonner";
import { AdminPageLayout, AdminSpinner, adminPanelClass, adminBtnPrimaryClass } from "../admin/AdminPageLayout";

interface SellerRequest {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  message?: string | null;
  adminNote?: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string | null;
    memberSince: string;
    _count: { orders: number };
  };
}

export function AdminSellerRequestsPage() {
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [reviewTarget, setReviewTarget] = useState<SellerRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await get<SellerRequest[]>(`/api/v1/admin/seller-requests?status=${filter}`);
      setRequests(data);
    } catch {
      toast.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleReview = async (status: "APPROVED" | "REJECTED") => {
    if (!reviewTarget) return;
    setSubmitting(true);
    try {
      const res = await put<{ message: string }>(
        `/api/v1/admin/seller-requests/${reviewTarget.id}/review`,
        { status, adminNote: adminNote || undefined },
      );
      toast.success(res.message);
      setReviewTarget(null);
      setAdminNote("");
      fetchRequests();
    } catch (e: any) {
      toast.error(e.message || "Lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === "PENDING")
      return (
        <Badge className="gap-1 border-0 bg-amber-50 font-medium text-amber-900">
          <Clock className="h-3 w-3" />
          Chờ duyệt
        </Badge>
      );
    if (status === "APPROVED")
      return (
        <Badge className="gap-1 border-0 bg-emerald-50 font-medium text-emerald-800">
          <CheckCircle className="h-3 w-3" />
          Đã duyệt
        </Badge>
      );
    return (
      <Badge className="gap-1 border-0 bg-red-50 font-medium text-red-800">
        <XCircle className="h-3 w-3" />
        Từ chối
      </Badge>
    );
  };

  return (
    <AdminPageLayout
      title="Duyệt đăng ký Seller"
      description={`${requests.length} yêu cầu — bộ lọc: ${filter === "PENDING" ? "chờ duyệt" : filter === "APPROVED" ? "đã duyệt" : "từ chối"}`}
      actions={
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44 rounded-xl border-gray-200 bg-white text-gray-900 shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-gray-200 bg-white">
            <SelectItem value="PENDING" className="text-gray-900">
              Chờ duyệt
            </SelectItem>
            <SelectItem value="APPROVED" className="text-gray-900">
              Đã duyệt
            </SelectItem>
            <SelectItem value="REJECTED" className="text-gray-900">
              Từ chối
            </SelectItem>
          </SelectContent>
        </Select>
      }
    >
      {loading ? (
        <AdminSpinner />
      ) : requests.length === 0 ? (
        <Card className={`${adminPanelClass} flex min-h-[10rem] items-center justify-center`}>
          <p className="text-sm text-gray-500">Không có yêu cầu nào trong bộ lọc này</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className={`${adminPanelClass} p-5`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-900 font-medium">{req.user.firstName} {req.user.lastName}</span>
                    {statusBadge(req.status)}
                  </div>
                  <p className="text-gray-500 text-sm">{req.user.email}</p>
                  <div className="flex gap-3 mt-1 text-gray-400 text-xs">
                    <span>Thành viên từ {new Date(req.user.memberSince).toLocaleDateString("vi-VN")}</span>
                    <span>{req.user._count.orders} đơn hàng</span>
                    <span>Gửi lúc {new Date(req.createdAt).toLocaleString("vi-VN")}</span>
                  </div>
                  {req.message && (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/80 p-3">
                      <p className="mb-1 text-xs font-medium text-gray-500">Lý do đăng ký</p>
                      <p className="text-sm text-gray-700">{req.message}</p>
                    </div>
                  )}
                  {req.adminNote && (
                    <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                      <p className="mb-1 text-xs font-medium text-primary">Ghi chú admin</p>
                      <p className="text-sm text-gray-700">{req.adminNote}</p>
                    </div>
                  )}
                </div>
                {req.status === "PENDING" && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      className={`${adminBtnPrimaryClass} gap-1.5`}
                      onClick={() => {
                        setReviewTarget(req);
                        setAdminNote("");
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Xem xét
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewTarget} onOpenChange={() => setReviewTarget(null)}>
        <DialogContent className="bg-white border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Xem xét yêu cầu Seller</DialogTitle>
            <DialogDescription className="text-gray-500">
              {reviewTarget?.user.firstName} {reviewTarget?.user.lastName} — {reviewTarget?.user.email}
            </DialogDescription>
          </DialogHeader>
          {reviewTarget?.message && (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-gray-500 text-xs mb-1">Lý do:</p>
              <p className="text-gray-600 text-sm">{reviewTarget.message}</p>
            </div>
          )}
          <div>
            <label className="text-gray-500 text-sm mb-1.5 block">Ghi chú (tuỳ chọn)</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Lý do phê duyệt hoặc từ chối..."
              rows={3}
              className="w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1 border border-gray-200"
              onClick={() => setReviewTarget(null)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-1.5"
              onClick={() => handleReview("REJECTED")}
              disabled={submitting}
            >
              <XCircle className="h-4 w-4" />
              Từ chối
            </Button>
            <Button
              className={`flex-1 gap-1.5 ${adminBtnPrimaryClass}`}
              onClick={() => handleReview("APPROVED")}
              disabled={submitting}
            >
              <CheckCircle className="h-4 w-4" />
              Phê duyệt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
}
