import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  adminBtnPrimaryClass,
} from "../admin/AdminPageLayout";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  sortOrder: number;
  _count: { products: number };
}

interface FormState {
  name: string;
  slug: string;
  icon: string;
  sortOrder: string;
}

const emptyForm: FormState = { name: "", slug: "", icon: "", sortOrder: "0" };

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await get<Category[]>("/api/v1/admin/categories");
      setCategories(data);
    } catch {
      toast.error("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon ?? "", sortOrder: String(cat.sortOrder) });
    setShowForm(true);
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/, "");

  const handleSave = async () => {
    if (!form.name || !form.slug) return toast.error("Tên và slug không được để trống");
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        icon: form.icon || undefined,
        sortOrder: parseInt(form.sortOrder) || 0,
      };
      if (editTarget) {
        await put(`/api/v1/admin/categories/${editTarget.id}`, payload);
        toast.success("Đã cập nhật danh mục");
      } else {
        await post("/api/v1/admin/categories", payload);
        toast.success("Đã tạo danh mục");
      }
      setShowForm(false);
      fetchCategories();
    } catch (e: any) {
      toast.error(e.message || "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await del<{ message: string }>(`/api/v1/admin/categories/${deleteTarget.id}`);
      toast.success(res.message);
      setDeleteTarget(null);
      fetchCategories();
    } catch (e: any) {
      toast.error(e.message || "Lỗi");
    }
  };

  return (
    <AdminPageLayout
      title="Quản lý danh mục"
      description={`${categories.length} danh mục sản phẩm`}
      actions={
        <Button onClick={openCreate} className={adminBtnPrimaryClass}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      }
    >
      {showForm && (
        <Card className={adminFormPanelClass}>
          <h3 className="mb-4 font-semibold text-gray-900">
            {editTarget ? "Sửa danh mục" : "Thêm danh mục mới"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Tên danh mục *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))}
                placeholder="Electronics"
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Slug *</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="electronics"
                className="bg-gray-50 border-gray-200 text-gray-900 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Icon (Lucide name)</label>
              <Input
                value={form.icon}
                onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))}
                placeholder="Laptop"
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Thứ tự</label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
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
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <p className="text-sm">Chưa có danh mục nào</p>
            <Button variant="link" className="mt-2 text-primary" onClick={openCreate}>
              Thêm danh mục đầu tiên
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className={adminTheadRowClass}>
                <th className={adminThClass}>Tên</th>
                <th className={adminThClass}>Slug</th>
                <th className={adminThClass}>Icon</th>
                <th className={adminThClass}>Sản phẩm</th>
                <th className={adminThClass}>Thứ tự</th>
                <th className={`${adminThClass} text-right`}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className={adminTrClass}>
                  <td className="px-4 py-3 text-gray-900 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm font-mono">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{cat.icon || "—"}</td>
                  <td className="px-4 py-3 sm:px-6">
                    <Badge className="border-0 bg-blue-50 font-medium text-blue-800">
                      {cat._count.products}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{cat.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-400/70 hover:text-blue-400 hover:bg-blue-400/10"
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400/70 hover:text-red-400 hover:bg-red-400/10"
                        onClick={() => setDeleteTarget(cat)}
                      >
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

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Xóa danh mục?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Xóa danh mục <strong className="text-gray-900">{deleteTarget?.name}</strong>. Chỉ xóa được nếu không có sản phẩm nào.
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
