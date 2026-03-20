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
    if (status === "PENDING") return <Badge className="bg-yellow-500/20 text-yellow-400 border-0 gap-1"><Clock className="h-3 w-3" />Chờ duyệt</Badge>;
    if (status === "APPROVED") return <Badge className="bg-green-500/20 text-green-400 border-0 gap-1"><CheckCircle className="h-3 w-3" />Đã duyệt</Badge>;
    return <Badge className="bg-red-500/20 text-red-400 border-0 gap-1"><XCircle className="h-3 w-3" />Từ chối</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Duyệt đăng ký Seller</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{requests.length} yêu cầu</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44 bg-foreground/5 border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-border">
            <SelectItem value="PENDING" className="text-foreground">Chờ duyệt</SelectItem>
            <SelectItem value="APPROVED" className="text-foreground">Đã duyệt</SelectItem>
            <SelectItem value="REJECTED" className="text-foreground">Từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-6 h-6 border-2 border-border border-t-white rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="bg-foreground/5 border-border flex items-center justify-center h-32">
          <p className="text-muted-foreground text-sm">Không có yêu cầu nào</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="bg-foreground/5 border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-foreground font-medium">{req.user.firstName} {req.user.lastName}</span>
                    {statusBadge(req.status)}
                  </div>
                  <p className="text-muted-foreground text-sm">{req.user.email}</p>
                  <div className="flex gap-3 mt-1 text-muted-foreground text-xs">
                    <span>Thành viên từ {new Date(req.user.memberSince).toLocaleDateString("vi-VN")}</span>
                    <span>{req.user._count.orders} đơn hàng</span>
                    <span>Gửi lúc {new Date(req.createdAt).toLocaleString("vi-VN")}</span>
                  </div>
                  {req.message && (
                    <div className="mt-2 p-3 rounded-lg bg-foreground/5 border border-border">
                      <p className="text-muted-foreground text-xs font-medium mb-1">Lý do đăng ký:</p>
                      <p className="text-muted-foreground text-sm">{req.message}</p>
                    </div>
                  )}
                  {req.adminNote && (
                    <div className="mt-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <p className="text-purple-400 text-xs font-medium mb-1">Ghi chú Admin:</p>
                      <p className="text-muted-foreground text-sm">{req.adminNote}</p>
                    </div>
                  )}
                </div>
                {req.status === "PENDING" && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-foreground gap-1.5"
                      onClick={() => { setReviewTarget(req); setAdminNote(""); }}
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
        <DialogContent className="bg-secondary border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Xem xét yêu cầu Seller</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {reviewTarget?.user.firstName} {reviewTarget?.user.lastName} — {reviewTarget?.user.email}
            </DialogDescription>
          </DialogHeader>
          {reviewTarget?.message && (
            <div className="p-3 rounded-lg bg-foreground/5 border border-border">
              <p className="text-muted-foreground text-xs mb-1">Lý do:</p>
              <p className="text-muted-foreground text-sm">{reviewTarget.message}</p>
            </div>
          )}
          <div>
            <label className="text-muted-foreground text-sm mb-1.5 block">Ghi chú (tuỳ chọn)</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Lý do phê duyệt hoặc từ chối..."
              rows={3}
              className="w-full rounded-lg bg-foreground/5 border border-border text-white placeholder:text-muted-foreground px-3 py-2 text-sm resize-none focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1 border border-border"
              onClick={() => setReviewTarget(null)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-foreground gap-1.5"
              onClick={() => handleReview("REJECTED")}
              disabled={submitting}
            >
              <XCircle className="h-4 w-4" />
              Từ chối
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-foreground gap-1.5"
              onClick={() => handleReview("APPROVED")}
              disabled={submitting}
            >
              <CheckCircle className="h-4 w-4" />
              Phê duyệt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
