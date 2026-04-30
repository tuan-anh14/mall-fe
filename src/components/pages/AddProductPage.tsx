import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Star, Upload, Trash2, Edit, Save, Plus, X, Package, LayoutDashboard, ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";
import { Info, AlertTriangle, Sparkles as SparklesIcon, Check } from "lucide-react";
import { get, post, put, del } from "../../lib/api";
import { API_URL } from "../../lib/api";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image?: string | null;
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
  const [colors, setColors] = useState<string[]>(() =>
    (initialProduct?.colors ?? []).map((c) => c.name)
  );
  const [sizes, setSizes] = useState<string[]>(() =>
    (initialProduct?.sizes ?? []).map((s) => s.value)
  );
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiInstructions, setAiInstructions] = useState("");
  const [aiPreview, setAiPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories
  useEffect(() => {
    get<{ categories: Category[] } | Category[]>('/api/v1/categories')
      .then((res) => {
        const raw = res as any;
        const cats: Category[] = Array.isArray(raw) ? raw : (raw.categories ?? []);
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

  const handleAIGenerate = async () => {
    if (!formData.name) {
      toast.error("Vui lòng nhập tên sản phẩm trước khi tạo mô tả bằng AI");
      return;
    }

    setGeneratingDescription(true);
    setAiPreview(""); // Reset preview
    try {
      const categoryName = categories.find((c) => c.id === formData.categoryId)?.name;
      const res = await post<{ description: string }>("/api/v1/ai-chat/generate-description", {
        name: formData.name,
        brand: formData.brand,
        categoryName,
        specifications: specifications.filter((s) => s.key.trim() && s.value.trim()),
        colors: colors.filter(Boolean),
        sizes: sizes.filter(Boolean),
        additionalInstructions: aiInstructions,
      });

      if (res.description) {
        setAiPreview(res.description);
        toast.success("AI đã soạn xong bản thảo! ✨");
      }
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo mô tả bằng AI. Vui lòng thử lại sau.");
    } finally {
      setGeneratingDescription(false);
    }
  };

  const applyAIDescription = () => {
    if (aiPreview) {
      setFormData((prev) => ({ ...prev, description: aiPreview }));
      setIsAIDialogOpen(false);
      setAiPreview("");
      setAiInstructions("");
      toast.success("Đã áp dụng mô tả AI vào sản phẩm!");
    }
  };

  const getMissingDataCount = () => {
    let count = 0;
    if (!formData.brand) count++;
    if (specifications.filter((s) => s.key.trim() && s.value.trim()).length === 0) count++;
    return count;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId || !formData.price || !formData.stock) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    if (formData.originalPrice && Number(formData.price) > Number(formData.originalPrice)) {
      toast.error("Giá bán sau khi giảm không thể lớn hơn giá gốc");
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
      colors: colors.filter(Boolean).length > 0 ? colors.filter(Boolean) : undefined,
      sizes: sizes.filter(Boolean).length > 0 ? sizes.filter(Boolean) : undefined,
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
        <h1 className="text-4xl text-gray-900 mb-2">
          {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h1>
        <p className="text-gray-500">
          {isEditMode ? "Cập nhật thông tin sản phẩm" : "Tạo sản phẩm mới cho cửa hàng của bạn"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl text-gray-900 mb-6">Thông tin sản phẩm</h2>

          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <Label htmlFor="name" className="text-gray-900 mb-2 block">
                Tên sản phẩm <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên sản phẩm"
                className="bg-gray-50 border-gray-200 text-gray-900"
                required
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="description" className="text-gray-900 block font-medium">
                  Mô tả
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1.5 font-semibold bg-blue-50/50 border border-blue-100"
                  onClick={() => setIsAIDialogOpen(true)}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Tạo bằng AI
                </Button>
              </div>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả sản phẩm"
                className="bg-gray-50 border-gray-200 text-gray-900 min-h-[120px]"
                rows={5}
              />
            </div>

            {/* Category and Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="categoryId" className="text-gray-900 mb-2 block">
                  Danh mục <span className="text-red-400">*</span>
                </Label>
                <Select
                  key={categoriesLoaded ? `cat-${formData.categoryId}` : "loading"}
                  value={formData.categoryId}
                  onValueChange={(value: string) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand" className="text-gray-900 mb-2 block">
                  Thương hiệu
                </Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Nhập tên thương hiệu"
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
            </div>

            {/* Price and Original Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="price" className="text-gray-900 mb-2 block">
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
                  className="bg-gray-50 border-gray-200 text-gray-900"
                  required
                />
              </div>

              <div>
                <Label htmlFor="originalPrice" className="text-gray-900 mb-2 block">
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
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="stock" className="text-gray-900 mb-2 block">
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
                  className="bg-gray-50 border-gray-200 text-gray-900"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl text-gray-900">Hình ảnh sản phẩm</h2>
            {images.length > 0 && (
              <span className="text-gray-400 text-sm">{images.length} ảnh · Ảnh đầu tiên là ảnh đại diện</span>
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
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${uploading
                ? "border-blue-500/50 bg-blue-50"
                : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
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
                  <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-3" />
                  <p className="text-blue-600 text-sm">Đang tải lên Cloudinary...</p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-900 mb-1">Kéo thả hoặc nhấn để tải ảnh lên</p>
                  <p className="text-sm text-gray-400">PNG, JPG, WEBP · tối đa 10MB · tối đa 10 ảnh</p>
                </>
              )}
            </div>

            {/* Image grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((url, index) => (
                  <div
                    key={url + index}
                    className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden group border border-gray-200"
                  >
                    <ImageWithFallback
                      src={url}
                      alt={`Ảnh sản phẩm ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      previewable={true}
                    />

                    {/* Primary badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-yellow-500 text-black text-xs font-semibold px-2 py-0.5 rounded-full">
                        <Star className="h-3 w-3 fill-black" />
                        Chính
                      </div>
                    )}

                    {/* Overlay actions (visible on hover) */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
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
                            className="bg-gray-200 hover:bg-gray-300 text-gray-900 text-xs px-2 py-1 rounded-lg transition-colors"
                          >
                            ←
                          </button>
                        )}
                        {index < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImage(index, index + 1)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-900 text-xs px-2 py-1 rounded-lg transition-colors"
                          >
                            →
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        disabled={deletingIndex === index}
                        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {deletingIndex === index ? (
                          <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
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
                    className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-blue-400 transition-colors disabled:opacity-40"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-xs">Thêm ảnh</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Colors & Sizes */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl text-gray-900 mb-6">Màu sắc & Kích cỡ</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colors */}
            <div>
              <Label className="text-gray-900 mb-3 block font-medium">Màu sắc</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="VD: Đỏ, Xanh, Đen..."
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = newColor.trim();
                      if (val && !colors.includes(val)) {
                        setColors((prev) => [...prev, val]);
                        setNewColor("");
                      }
                    }
                  }}
                  className="bg-gray-50 border-gray-200 text-gray-900 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const val = newColor.trim();
                    if (val && !colors.includes(val)) {
                      setColors((prev) => [...prev, val]);
                      setNewColor("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full border border-gray-200"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => setColors((prev) => prev.filter((c) => c !== color))}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {colors.length === 0 && (
                  <p className="text-gray-400 text-sm">Chưa có màu sắc. Nhập và nhấn Enter hoặc nút +</p>
                )}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <Label className="text-gray-900 mb-3 block font-medium">Kích cỡ</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="VD: S, M, L, XL, 39, 40..."
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = newSize.trim();
                      if (val && !sizes.includes(val)) {
                        setSizes((prev) => [...prev, val]);
                        setNewSize("");
                      }
                    }
                  }}
                  className="bg-gray-50 border-gray-200 text-gray-900 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const val = newSize.trim();
                    if (val && !sizes.includes(val)) {
                      setSizes((prev) => [...prev, val]);
                      setNewSize("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full border border-blue-200"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => setSizes((prev) => prev.filter((s) => s !== size))}
                      className="text-blue-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {sizes.length === 0 && (
                  <p className="text-gray-400 text-sm">Chưa có kích cỡ. Nhập và nhấn Enter hoặc nút +</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-900">Thông số</h2>
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
            <p className="text-gray-400 text-sm text-center py-4">
              Chưa có Thông số. Nhấn "Thêm thông số" để thêm các thông số như kích thước, chất liệu, tương thích, v.v.
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
                    className="bg-gray-50 border-gray-200 text-gray-900 flex-1"
                  />
                  <Input
                    placeholder="VD: 200g, Đỏ, Nhôm"
                    value={spec.value}
                    onChange={(e) =>
                      setSpecifications((prev) =>
                        prev.map((s, i) => (i === index ? { ...s, value: e.target.value } : s))
                      )
                    }
                    className="bg-gray-50 border-gray-200 text-gray-900 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSpecifications((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
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
            className="bg-blue-600 hover:bg-blue-700 text-white sm:w-auto w-full"
          >
            {submitting
              ? isEditMode ? "Đang lưu..." : "Đang thêm..."
              : isEditMode ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </Button>
        </div>
      </form>

      {/* AI Assistant Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="max-w-2xl bg-white border-gray-200 p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-6 pb-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl text-gray-900">
                <Sparkles className="h-6 w-6 text-blue-600" />
                Trợ lý AI ShopHub
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Tôi sẽ giúp bạn soạn thảo một bản mô tả sản phẩm chuyên nghiệp dựa trên dữ liệu bạn cung cấp.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 py-2 space-y-4">
            {/* Context Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Tên sản phẩm</p>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{formData.name || "Chưa nhập"}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${specifications.length > 0 ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                  {specifications.length > 0 ? <Check className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Thông số</p>
                  <p className="text-sm font-medium text-gray-900">{specifications.length} thông số</p>
                </div>
              </div>
            </div>

            {/* Validation Warning */}
            {getMissingDataCount() > 0 && (
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-xs">
                  Dữ liệu hiện tại hơi ít ({getMissingDataCount()} mục trống). Bạn nên nhập thêm "Thương hiệu" hoặc "Thông số" để AI viết hay và chính xác hơn, tránh suy luận sai lầm.
                </AlertDescription>
              </Alert>
            )}

            {/* Additional Instructions */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Yêu cầu thêm cho AI (Tùy chọn)</Label>
              <Textarea
                placeholder="Ví dụ: Viết kiểu sang chảnh, tập trung vào tính năng gaming, hoặc viết cho đối tượng sinh viên..."
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-900 min-h-[80px]"
              />
            </div>

            {/* Preview Section */}
            {aiPreview && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Label className="text-sm font-semibold text-gray-700">Bản thảo từ AI:</Label>
                <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-4 prose prose-sm prose-blue">
                  <div className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed whitespace-pre-line">
                    {aiPreview}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 pt-2 bg-gray-50/50">
            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAIDialogOpen(false)}
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Hủy bỏ
              </Button>
              {aiPreview ? (
                <Button
                  onClick={applyAIDescription}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <Check className="h-4 w-4" />
                  Áp dụng mô tả này
                </Button>
              ) : (
                <Button
                  onClick={handleAIGenerate}
                  disabled={generatingDescription || !formData.name}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {generatingDescription ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {generatingDescription ? "Giai đoạn suy luận..." : "Bắt đầu soạn thảo"}
                </Button>
              )}
              {aiPreview && (
                <Button
                  variant="outline"
                  onClick={handleAIGenerate}
                  disabled={generatingDescription}
                  className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  {generatingDescription ? "Đang viết lại..." : "Thử lại bản khác"}
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

