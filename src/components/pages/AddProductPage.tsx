import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, X, Plus, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { get, post, put, del } from "../../lib/api";
import { API_URL } from "../../lib/api";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface SellerProduct {
  id: string;
  name: string;
  description?: string;
  category: { id: string; name: string } | null;
  price: number;
  originalPrice?: number | null;
  stock: number;
  sku?: string | null;
  brand?: string | null;
  images: { id: string; url: string; isPrimary: boolean; sortOrder: number }[];
  colors?: { id: string; name: string; hexCode?: string }[];
  sizes?: { id: string; value: string }[];
  specifications?: { id: string; key: string; value: string }[];
  status: string;
}

interface AddProductPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialProduct?: SellerProduct;
}

export function AddProductPage({ onNavigate, initialProduct }: AddProductPageProps) {
  const isEditMode = !!initialProduct;

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [formData, setFormData] = useState(() => ({
    name: initialProduct?.name ?? "",
    description: initialProduct?.description ?? "",
    categoryId: initialProduct?.category?.id ?? "",
    price: initialProduct?.price != null ? String(initialProduct.price) : "",
    originalPrice: initialProduct?.originalPrice != null ? String(initialProduct.originalPrice) : "",
    stock: initialProduct?.stock != null ? String(initialProduct.stock) : "",
    sku: initialProduct?.sku ?? "",
    brand: initialProduct?.brand ?? "",
  }));
  const [images, setImages] = useState<string[]>(() =>
    (initialProduct?.images ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => img.url)
  );
  // Track which images are being deleted individually
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>(() =>
    (initialProduct?.specifications ?? []).map((s) => ({ key: s.key, value: s.value }))
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories
  useEffect(() => {
    get<Category[]>('/api/v1/categories')
      .then((cats) => {
        setCategories(cats);
        setCategoriesLoaded(true);
      })
      .catch(() => {
        toast.error('Không thể tải danh mục');
        setCategoriesLoaded(true);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((file) => fd.append('files', file));

      const res = await fetch(`${API_URL}/api/v1/upload/images`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Tải lên thất bại');

      const urls: string[] = json.data?.urls ?? [];
      setImages((prev) => [...prev, ...urls]);
      toast.success('Đã tải ảnh lên thành công');
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (index: number) => {
    const url = images[index];
    setDeletingIndex(index);
    try {
      // Remove from Cloudinary / local storage on backend
      await del('/api/v1/upload/images', { url });
    } catch {
      // Non-fatal: image may already be gone or is an external URL
    } finally {
      setDeletingIndex(null);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      return next;
    });
    toast.success("Đã đặt làm ảnh đại diện");
  };

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId || !formData.price || !formData.stock) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      categoryId: formData.categoryId,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      stock: Number(formData.stock),
      sku: formData.sku || undefined,
      brand: formData.brand || undefined,
      images: images.length > 0 ? images : undefined,
      specifications: specifications.filter((s) => s.key.trim() && s.value.trim()).length > 0
        ? specifications.filter((s) => s.key.trim() && s.value.trim())
        : undefined,
    };

    setSubmitting(true);
    try {
      if (isEditMode) {
        await put(`/api/v1/seller/products/${initialProduct!.id}`, payload);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await post('/api/v1/seller/products', payload);
        toast.success("Thêm sản phẩm thành công!");
      }
      onNavigate("seller-products");
    } catch (err: any) {
      toast.error(err.message || (isEditMode ? 'Không thể cập nhật sản phẩm' : 'Không thể thêm sản phẩm'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => onNavigate("seller-products")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại sản phẩm
        </Button>
        <h1 className="text-4xl text-foreground mb-2">
          {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode ? "Cập nhật thông tin sản phẩm" : "Tạo sản phẩm mới cho cửa hàng của bạn"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-foreground/5 border border-border rounded-2xl p-6 mb-6">
          <h2 className="text-2xl text-foreground mb-6">Thông tin sản phẩm</h2>

          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <Label htmlFor="name" className="text-foreground mb-2 block">
                Tên sản phẩm <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên sản phẩm"
                className="bg-foreground/5 border-border text-foreground"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-foreground mb-2 block">
                Mô tả
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả sản phẩm"
                className="bg-foreground/5 border-border text-foreground min-h-[120px]"
                rows={5}
              />
            </div>

            {/* Category and Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="categoryId" className="text-foreground mb-2 block">
                  Danh mục <span className="text-red-400">*</span>
                </Label>
                <Select
                  key={categoriesLoaded ? `cat-${formData.categoryId}` : "loading"}
                  value={formData.categoryId}
                  onValueChange={(value: string) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger className="bg-foreground/5 border-border text-foreground">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand" className="text-foreground mb-2 block">
                  Thương hiệu
                </Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Nhập tên thương hiệu"
                  className="bg-foreground/5 border-border text-foreground"
                />
              </div>
            </div>

            {/* Price and Original Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="price" className="text-foreground mb-2 block">
                  Giá (₫) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="bg-foreground/5 border-border text-foreground"
                  required
                />
              </div>

              <div>
                <Label htmlFor="originalPrice" className="text-foreground mb-2 block">
                  Giá gốc (₫)
                </Label>
                <Input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  placeholder="0 (tùy chọn, dùng cho giảm giá)"
                  className="bg-foreground/5 border-border text-foreground"
                />
              </div>
            </div>

            {/* Stock and SKU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="stock" className="text-foreground mb-2 block">
                  Số lượng tồn kho <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="bg-foreground/5 border-border text-foreground"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sku" className="text-foreground mb-2 block">
                  SKU
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="SKU-001"
                  className="bg-foreground/5 border-border text-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-foreground/5 border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl text-foreground">Hình ảnh sản phẩm</h2>
            {images.length > 0 && (
              <span className="text-muted-foreground text-sm">{images.length} ảnh · Ảnh đầu tiên là ảnh đại diện</span>
            )}
          </div>

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                uploading
                  ? "border-purple-500/50 bg-purple-500/5"
                  : "border-border hover:border-purple-500/50 hover:bg-white/3"
              }`}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (uploading) return;
                const dt = e.dataTransfer;
                if (!dt.files?.length) return;
                const fakeEvent = { target: { files: dt.files } } as any;
                handleFileChange(fakeEvent);
              }}
            >
              {uploading ? (
                <>
                  <div className="w-10 h-10 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin mx-auto mb-3" />
                  <p className="text-purple-300 text-sm">Đang tải lên Cloudinary...</p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground mb-1">Kéo thả hoặc nhấn để tải ảnh lên</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, WEBP · tối đa 10MB · tối đa 10 ảnh</p>
                </>
              )}
            </div>

            {/* Image grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((url, index) => (
                  <div
                    key={url + index}
                    className="relative aspect-square bg-foreground/5 rounded-xl overflow-hidden group border border-border"
                  >
                    <img
                      src={url}
                      alt={`Ảnh sản phẩm ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Primary badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-yellow-500 text-black text-xs font-semibold px-2 py-0.5 rounded-full">
                        <Star className="h-3 w-3 fill-black" />
                        Chính
                      </div>
                    )}

                    {/* Overlay actions (visible on hover) */}
                    <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(index)}
                          className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Star className="h-3 w-3 fill-black" />
                          Đặt làm chính
                        </button>
                      )}
                      <div className="flex gap-2">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImage(index, index - 1)}
                            className="bg-foreground/20 hover:bg-white/30 text-foreground text-xs px-2 py-1 rounded-lg transition-colors"
                          >
                            ←
                          </button>
                        )}
                        {index < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImage(index, index + 1)}
                            className="bg-foreground/20 hover:bg-white/30 text-foreground text-xs px-2 py-1 rounded-lg transition-colors"
                          >
                            →
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        disabled={deletingIndex === index}
                        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-foreground text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {deletingIndex === index ? (
                          <div className="w-3 h-3 rounded-full border-2 border-border/30 border-t-white animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add more button */}
                {images.length < 10 && (
                  <button
                    type="button"
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-muted-foreground hover:border-purple-500/40 transition-colors disabled:opacity-40"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-xs">Thêm ảnh</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-foreground/5 border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-foreground">Thông số kỹ thuật</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSpecifications((prev) => [...prev, { key: "", value: "" }])}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm thông số
            </Button>
          </div>

          {specifications.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Chưa có thông số kỹ thuật. Nhấn "Thêm thông số" để thêm các thông số như kích thước, chất liệu, tương thích, v.v.
            </p>
          ) : (
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <Input
                    placeholder="VD: Trọng lượng, Màu sắc, Chất liệu"
                    value={spec.key}
                    onChange={(e) =>
                      setSpecifications((prev) =>
                        prev.map((s, i) => (i === index ? { ...s, key: e.target.value } : s))
                      )
                    }
                    className="bg-foreground/5 border-border text-foreground flex-1"
                  />
                  <Input
                    placeholder="VD: 200g, Đỏ, Nhôm"
                    value={spec.value}
                    onChange={(e) =>
                      setSpecifications((prev) =>
                        prev.map((s, i) => (i === index ? { ...s, value: e.target.value } : s))
                      )
                    }
                    className="bg-foreground/5 border-border text-foreground flex-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSpecifications((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onNavigate("seller-products")}
            className="sm:w-auto w-full"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={submitting || uploading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 sm:w-auto w-full"
          >
            {submitting
              ? isEditMode ? "Đang lưu..." : "Đang thêm..."
              : isEditMode ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </Button>
        </div>
      </form>
    </div>
  );
}
