import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Tag, AlertCircle } from "lucide-react";
import { formatCurrency } from "../../lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { get, post, patch, del } from "../../lib/api";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
}

interface CouponForm {
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

const emptyForm: CouponForm = {
  code: "",
  type: "PERCENTAGE",
  value: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  validFrom: new Date().toISOString().split("T")[0],
  validUntil: "",
  isActive: true,
};

function getCouponStatus(c: Coupon) {
  const now = new Date();
  if (!c.isActive) return { label: "Tắt", variant: "secondary" as const };
  if (c.validUntil && new Date(c.validUntil) < now)
    return { label: "Hết hạn", variant: "destructive" as const };
  if (c.usageLimit !== null && c.usageCount >= c.usageLimit)
    return { label: "Hết lượt", variant: "destructive" as const };
  return { label: "Hoạt động", variant: "default" as const };
}

export function SellerCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get<{ coupons: Coupon[] }>("/api/v1/seller/coupons");
      setCoupons(data.coupons ?? []);
    } catch {
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openCreate = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrderAmount: c.minOrderAmount != null ? String(c.minOrderAmount) : "",
      maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : "",
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
      validFrom: c.validFrom.split("T")[0],
      validUntil: c.validUntil ? c.validUntil.split("T")[0] : "",
      isActive: c.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) return toast.error("Vui lòng nhập mã giảm giá");
    if (!form.value) return toast.error("Vui lòng nhập giá trị giảm");

    setSaving(true);
    try {
      const payload: any = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        isActive: form.isActive,
        validFrom: new Date(form.validFrom).toISOString(),
      };
      if (form.minOrderAmount) payload.minOrderAmount = Number(form.minOrderAmount);
      if (form.maxDiscount) payload.maxDiscount = Number(form.maxDiscount);
      if (form.usageLimit) payload.usageLimit = Number(form.usageLimit);
      if (form.validUntil) payload.validUntil = new Date(form.validUntil).toISOString();

      if (editingCoupon) {
        await patch(`/api/v1/seller/coupons/${editingCoupon.id}`, payload);
        toast.success("Đã cập nhật mã giảm giá");
      } else {
        await post("/api/v1/seller/coupons", payload);
        toast.success("Đã tạo mã giảm giá");
      }
      setDialogOpen(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Lỗi khi lưu mã giảm giá");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await del(`/api/v1/seller/coupons/${deleteId}`);
      toast.success("Đã xóa mã giảm giá");
      setCoupons((prev) => prev.filter((c) => c.id !== deleteId));
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Không thể xóa");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Mã giảm giá của shop</h1>
          <p className="text-white/60 text-sm mt-1">
            Quản lý mã giảm giá áp dụng cho sản phẩm của shop bạn
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo mã giảm giá
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 text-sm text-blue-300">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>
          Mã giảm giá của shop chỉ áp dụng cho sản phẩm trong cửa hàng của bạn. Khi khách
          hàng nhập mã, chỉ những sản phẩm của shop bạn mới được giảm giá.
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <Tag className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg">Chưa có mã giảm giá nào</p>
          <p className="text-sm mt-1">Tạo mã giảm giá đầu tiên để thu hút khách hàng</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">Mã code</th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">Loại / Giá trị</th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">Đã dùng</th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">Đơn tối thiểu</th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">Hiệu lực</th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">Trạng thái</th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {coupons.map((c) => {
                  const status = getCouponStatus(c);
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-white text-sm flex items-center gap-2">
                          <Tag className="h-4 w-4 text-purple-400 flex-shrink-0" />
                          {c.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white text-sm font-medium">
                          {c.type === "PERCENTAGE" ? `${c.value}%` : `${formatCurrency(Number(c.value))}`}
                        </span>
                        <p className="text-white/40 text-xs mt-0.5">
                          {c.type === "PERCENTAGE" ? "Phần trăm" : "Số tiền cố định"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {c.usageCount}{c.usageLimit != null ? `/${c.usageLimit}` : ""}
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {c.minOrderAmount != null ? formatCurrency(Number(c.minOrderAmount)) : "—"}
                      </td>
                      <td className="px-6 py-4 text-white/50 text-xs">
                        <div>{new Date(c.validFrom).toLocaleDateString("vi-VN")}</div>
                        {c.validUntil
                          ? <div>→ {new Date(c.validUntil).toLocaleDateString("vi-VN")}</div>
                          : <div className="text-white/30">Không giới hạn</div>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(c)}
                            className="h-8 w-8 text-white/60 hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(c.id)}
                            className="h-8 w-8 text-red-400/70 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Mã giảm giá *</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                  }
                  placeholder="VD: SHOP20"
                  className="bg-white/5 border-white/10 uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Loại giảm giá *</Label>
                <Select
                  value={form.type}
                  onValueChange={(v: string) => setForm((f) => ({ ...f, type: v as any }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Số tiền cố định ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Giá trị giảm *</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  placeholder={form.type === "PERCENTAGE" ? "VD: 20" : "VD: 50"}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Đơn tối thiểu</Label>
                <Input
                  type="number"
                  value={form.minOrderAmount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, minOrderAmount: e.target.value }))
                  }
                  placeholder="Không giới hạn"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Giảm tối đa ($)</Label>
                <Input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxDiscount: e.target.value }))
                  }
                  placeholder="Không giới hạn"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Giới hạn lượt dùng</Label>
                <Input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, usageLimit: e.target.value }))
                  }
                  placeholder="Không giới hạn"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Ngày bắt đầu *</Label>
                <Input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, validUntil: e.target.value }))
                  }
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-white/20 cursor-pointer"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Kích hoạt ngay
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : editingCoupon ? "Cập nhật" : "Tạo mã"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o: boolean) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-zinc-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa mã giảm giá?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
