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
    <div className="container mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} danh mục</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="bg-white border-blue-500/30 p-5">
          <h3 className="text-gray-900 font-semibold mb-4">{editTarget ? "Sửa danh mục" : "Thêm danh mục mới"}</h3>
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
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
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

      {/* Category Table */}
      <Card className="bg-white border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-4 py-3 text-gray-500 text-sm font-medium">Tên</th>
                <th className="px-4 py-3 text-gray-500 text-sm font-medium">Slug</th>
                <th className="px-4 py-3 text-gray-500 text-sm font-medium">Icon</th>
                <th className="px-4 py-3 text-gray-500 text-sm font-medium">Sản phẩm</th>
                <th className="px-4 py-3 text-gray-500 text-sm font-medium">Thứ tự</th>
                <th className="px-4 py-3 text-gray-500 text-sm font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm font-mono">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{cat.icon || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge className="bg-blue-500/20 text-blue-400 border-0">{cat._count.products}</Badge>
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
    </div>
  );
}
