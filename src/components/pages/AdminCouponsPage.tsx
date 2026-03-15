import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
import { get, post, put, del } from "../../lib/api";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number | string;
  minOrderAmount?: number | string | null;
  maxDiscount?: number | string | null;
  usageLimit?: number | null;
  usageCount: number;
  validFrom: string;
  validUntil?: string | null;
  isActive: boolean;
  _count: { usages: number };
}

interface FormState {
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  code: "",
  type: "PERCENTAGE",
  value: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  validFrom: new Date().toISOString().slice(0, 16),
  validUntil: "",
  isActive: true,
};

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const limit = 20;

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await get<{ coupons: Coupon[]; total: number }>(`/api/v1/admin/coupons?page=${page}&limit=${limit}`);
      setCoupons(data.coupons);
      setTotal(data.total);
    } catch {
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, [page]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditTarget(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : "",
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : "",
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.value) return toast.error("Vui lòng điền đầy đủ thông tin");
    setSaving(true);
    try {
      const payload: any = {
        code: form.code,
        type: form.type,
        value: parseFloat(form.value),
        validFrom: new Date(form.validFrom).toISOString(),
        isActive: form.isActive,
      };
      if (form.minOrderAmount) payload.minOrderAmount = parseFloat(form.minOrderAmount);
      if (form.maxDiscount) payload.maxDiscount = parseFloat(form.maxDiscount);
      if (form.usageLimit) payload.usageLimit = parseInt(form.usageLimit);
      if (form.validUntil) payload.validUntil = new Date(form.validUntil).toISOString();

      if (editTarget) {
        await put(`/api/v1/admin/coupons/${editTarget.id}`, payload);
        toast.success("Đã cập nhật mã giảm giá");
      } else {
        await post("/api/v1/admin/coupons", payload);
        toast.success("Đã tạo mã giảm giá");
      }
      setShowForm(false);
      fetchCoupons();
    } catch (e: any) {
      toast.error(e.message || "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await del<{ message: string }>(`/api/v1/admin/coupons/${deleteTarget.id}`);
      toast.success(res.message);
      setDeleteTarget(null);
      fetchCoupons();
    } catch (e: any) {
      toast.error(e.message || "Lỗi");
    }
  };

  const totalPages = Math.ceil(total / limit);

  const isExpired = (coupon: Coupon) =>
    coupon.validUntil && new Date(coupon.validUntil) < new Date();

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý mã giảm giá</h1>
          <p className="text-white/50 text-sm mt-0.5">{total} mã giảm giá</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Thêm mã
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="bg-white/5 border-purple-500/30 p-5">
          <h3 className="text-white font-semibold mb-4">{editTarget ? "Sửa mã giảm giá" : "Tạo mã giảm giá mới"}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Mã code *</label>
              <Input value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" className="bg-white/5 border-white/10 text-white font-mono" />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Loại *</label>
              <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v as any }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="PERCENTAGE" className="text-white">Phần trăm (%)</SelectItem>
                  <SelectItem value="FIXED_AMOUNT" className="text-white">Số tiền cố định ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Giá trị * {form.type === "PERCENTAGE" ? "(%)" : "($)"}</label>
              <Input type="number" value={form.value} onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))} placeholder={form.type === "PERCENTAGE" ? "20" : "50"} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Đơn hàng tối thiểu ($)</label>
              <Input type="number" value={form.minOrderAmount} onChange={(e) => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} placeholder="100" className="bg-white/5 border-white/10 text-white" />
            </div>
            {form.type === "PERCENTAGE" && (
              <div>
                <label className="text-white/60 text-xs mb-1 block">Giảm tối đa ($)</label>
                <Input type="number" value={form.maxDiscount} onChange={(e) => setForm(f => ({ ...f, maxDiscount: e.target.value }))} placeholder="50" className="bg-white/5 border-white/10 text-white" />
              </div>
            )}
            <div>
              <label className="text-white/60 text-xs mb-1 block">Giới hạn lượt dùng</label>
              <Input type="number" value={form.usageLimit} onChange={(e) => setForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="Không giới hạn" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Hiệu lực từ *</label>
              <Input type="datetime-local" value={form.validFrom} onChange={(e) => setForm(f => ({ ...f, validFrom: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Hết hạn</label>
              <Input type="datetime-local" value={form.validUntil} onChange={(e) => setForm(f => ({ ...f, validUntil: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-purple-500" />
                <span className="text-white/70 text-sm">Đang hoạt động</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
              <Check className="h-4 w-4 mr-1" />
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} className="border border-white/10">
              <X className="h-4 w-4 mr-1" />
              Hủy
            </Button>
          </div>
        </Card>
      )}

      <Card className="bg-white/5 border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-white/50 text-sm font-medium">Mã code</th>
                  <th className="px-4 py-3 text-white/50 text-sm font-medium">Loại</th>
                  <th className="px-4 py-3 text-white/50 text-sm font-medium">Giá trị</th>
                  <th className="px-4 py-3 text-white/50 text-sm font-medium">Đã dùng</th>
                  <th className="px-4 py-3 text-white/50 text-sm font-medium">Hiệu lực</th>
                  <th className="px-4 py-3 text-white/50 text-sm font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-white/50 text-sm font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span className="text-white font-mono font-semibold text-sm flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-purple-400" />
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">
                      {coupon.type === "PERCENTAGE" ? "%" : "$"}
                    </td>
                    <td className="px-4 py-3 text-white text-sm font-medium">
                      {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `$${coupon.value}`}
                    </td>
                    <td className="px-4 py-3 text-white/50 text-sm">
                      {coupon._count.usages}{coupon.usageLimit ? `/${coupon.usageLimit}` : ""}
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs">
                      <div>{new Date(coupon.validFrom).toLocaleDateString("vi-VN")}</div>
                      {coupon.validUntil && <div>→ {new Date(coupon.validUntil).toLocaleDateString("vi-VN")}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {isExpired(coupon) ? (
                        <Badge className="bg-zinc-500/20 text-zinc-400 border-0">Hết hạn</Badge>
                      ) : coupon.isActive ? (
                        <Badge className="bg-green-500/20 text-green-400 border-0">Đang dùng</Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400 border-0">Tắt</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-400/70 hover:text-blue-400" onClick={() => openEdit(coupon)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400/70 hover:text-red-400" onClick={() => setDeleteTarget(coupon)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-sm">Trang {page} / {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-zinc-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Xóa mã giảm giá?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Xóa mã <strong className="text-white font-mono">{deleteTarget?.code}</strong>. Không thể xóa nếu đã được dùng trong đơn hàng.
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
