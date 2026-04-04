import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { formatCurrency } from "../../lib/currency";
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
import {
  AdminPageLayout,
  AdminSpinner,
  adminPanelClass,
  adminFormPanelClass,
  adminTheadRowClass,
  adminThClass,
  adminTrClass,
  AdminPagination,
  adminBtnPrimaryClass,
} from "../admin/AdminPageLayout";

interface Coupon {
  id: string;
  code: string;
  name?: string | null;
  description?: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number | string;
  minOrderAmount?: number | string | null;
  maxDiscount?: number | string | null;
  usageLimit?: number | null;
  usageCount: number;
  validFrom: string;
  validUntil?: string | null;
  isActive: boolean;
  isVisible: boolean;
  _count: { usages: number };
}

interface FormState {
  code: string;
  name: string;
  description: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isVisible: boolean;
}

const emptyForm: FormState = {
  code: "",
  name: "",
  description: "",
  type: "PERCENTAGE",
  value: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  validFrom: new Date().toISOString().slice(0, 16),
  validUntil: "",
  isActive: true,
  isVisible: true,
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
  const limit = 10;

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
      name: coupon.name ?? "",
      description: coupon.description ?? "",
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : "",
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : "",
      isActive: coupon.isActive,
      isVisible: coupon.isVisible ?? true,
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
        isVisible: form.isVisible,
      };
      if (form.name) payload.name = form.name;
      if (form.description) payload.description = form.description;
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

  const willSoftDelete = (coupon: Coupon | null) =>
    !!coupon && coupon._count.usages > 0;

  return (
    <AdminPageLayout
      title="Quản lý mã giảm giá"
      description={`${total.toLocaleString("vi-VN")} mã trong hệ thống`}
      actions={
        <Button onClick={openCreate} className={adminBtnPrimaryClass}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mã
        </Button>
      }
    >
      {showForm && (
        <Card className={adminFormPanelClass}>
          <h3 className="mb-4 font-semibold text-gray-900">
            {editTarget ? "Sửa mã giảm giá" : "Tạo mã giảm giá mới"}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Mã code *</label>
              <Input value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" className="bg-gray-50 border-gray-200 text-gray-900 font-mono" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Tên hiển thị</label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Black Friday 2024" className="bg-gray-50 border-gray-200 text-gray-900" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Mô tả ngắn (hiển thị trên banner)</label>
              <Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Giảm đến 50% cho tất cả sản phẩm" className="bg-gray-50 border-gray-200 text-gray-900" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Loại *</label>
              <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v as any }))}>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="PERCENTAGE" className="text-gray-900">Phần trăm (%)</SelectItem>
                  <SelectItem value="FIXED_AMOUNT" className="text-gray-900">Số tiền cố định (₫)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Giá trị * {form.type === "PERCENTAGE" ? "(%)" : "(₫)"}</label>
              <Input type="number" value={form.value} onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))} placeholder={form.type === "PERCENTAGE" ? "20" : "50.000"} className="bg-gray-50 border-gray-200 text-gray-900" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Đơn hàng tối thiểu (₫)</label>
              <Input type="number" value={form.minOrderAmount} onChange={(e) => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} placeholder="100.000" className="bg-gray-50 border-gray-200 text-gray-900" />
            </div>
            {form.type === "PERCENTAGE" && (
              <div>
                <label className="text-gray-500 text-xs mb-1 block">Giảm tối đa (₫)</label>
                <Input type="number" value={form.maxDiscount} onChange={(e) => setForm(f => ({ ...f, maxDiscount: e.target.value }))} placeholder="50.000" className="bg-gray-50 border-gray-200 text-gray-900" />
              </div>
            )}
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Giới hạn lượt dùng</label>
              <Input type="number" value={form.usageLimit} onChange={(e) => setForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="Không giới hạn" className="bg-gray-50 border-gray-200 text-gray-900" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Hiệu lực từ *</label>
              <Input type="datetime-local" value={form.validFrom} onChange={(e) => setForm(f => ({ ...f, validFrom: e.target.value }))} className="bg-gray-50 border-gray-200 text-gray-900" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Hết hạn</label>
              <Input type="datetime-local" value={form.validUntil} onChange={(e) => setForm(f => ({ ...f, validUntil: e.target.value }))} className="bg-gray-50 border-gray-200 text-gray-900" />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-blue-500" />
                <span className="text-gray-600 text-sm">Đang hoạt động</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm(f => ({ ...f, isVisible: e.target.checked }))} className="accent-blue-500" />
                <span className="text-gray-600 text-sm">Công khai</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={handleSave} disabled={saving} className={adminBtnPrimaryClass}>
              <Check className="h-4 w-4 mr-1" />
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} className="border border-gray-200">
              <X className="h-4 w-4 mr-1" />
              Hủy
            </Button>
          </div>
        </Card>
      )}

      <Card className={adminPanelClass}>
        {loading ? (
          <AdminSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className={adminTheadRowClass}>
                  <th className={adminThClass}>Mã code</th>
                  <th className={adminThClass}>Tên / Mô tả</th>
                  <th className={adminThClass}>Loại</th>
                  <th className={adminThClass}>Giá trị</th>
                  <th className={adminThClass}>Đã dùng</th>
                  <th className={adminThClass}>Hiệu lực</th>
                  <th className={adminThClass}>Trạng thái</th>
                  <th className={`${adminThClass} text-right`}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <Tag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Chưa có mã giảm giá nào</p>
                    </td>
                  </tr>
                ) : coupons.map((coupon) => (
                  <tr key={coupon.id} className={adminTrClass}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-900 font-mono font-semibold text-sm flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-blue-400" />
                          {coupon.code}
                        </span>
                        {!coupon.isVisible && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1 border-amber-200 text-amber-600 bg-amber-50 self-start">
                            Riêng tư
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.name ? (
                        <div>
                          <p className="text-gray-900 text-sm">{coupon.name}</p>
                          {coupon.description && <p className="text-gray-400 text-xs mt-0.5 max-w-[200px] truncate">{coupon.description}</p>}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {coupon.type === "PERCENTAGE" ? "Phần trăm" : "Số tiền cố định"}
                    </td>
                    <td className="px-6 py-4 text-gray-900 text-sm font-medium">
                      {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `${formatCurrency(Number(coupon.value))}`}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {coupon._count.usages}{coupon.usageLimit ? `/${coupon.usageLimit}` : ""}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      <div>{new Date(coupon.validFrom).toLocaleDateString("vi-VN")}</div>
                      {coupon.validUntil && <div>→ {new Date(coupon.validUntil).toLocaleDateString("vi-VN")}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {isExpired(coupon) ? (
                        <Badge className="bg-zinc-500/20 text-zinc-400 border-0">Hết hạn</Badge>
                      ) : coupon.isActive ? (
                        <Badge className="border-0 bg-emerald-50 font-medium text-emerald-800">Đang dùng</Badge>
                      ) : (
                        <Badge className="border-0 bg-slate-100 text-slate-600 hover:bg-slate-100">Tắt</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400/70 hover:text-blue-400" onClick={() => openEdit(coupon)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400/70 hover:text-red-400" onClick={() => setDeleteTarget(coupon)} title={coupon._count.usages > 0 ? "Tắt mã giảm giá" : "Xóa mã giảm giá"}>
                          <Trash2 className="h-4 w-4" />
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

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        setCurrentPage={setPage}
        totalItems={total}
      />

      {false && (
        <div className="hidden">
          <p className="text-sm text-gray-500">Trang {page} / {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Xóa mã giảm giá?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Xóa mã <strong className="text-gray-900 font-mono">{deleteTarget?.code}</strong>. Không thể xóa nếu đã được dùng trong đơn hàng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageLayout>
  );
}
