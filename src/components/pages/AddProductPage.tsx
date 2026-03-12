import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { get, post, put } from "../../lib/api";
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    price: "",
    originalPrice: "",
    stock: "",
    sku: "",
    brand: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([]);
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

  // Pre-fill form when editing
  useEffect(() => {
    if (!initialProduct) return;
    setFormData({
      name: initialProduct.name ?? "",
      description: initialProduct.description ?? "",
      categoryId: initialProduct.category?.id ?? "",
      price: initialProduct.price != null ? String(initialProduct.price) : "",
      originalPrice: initialProduct.originalPrice != null ? String(initialProduct.originalPrice) : "",
      stock: initialProduct.stock != null ? String(initialProduct.stock) : "",
      sku: initialProduct.sku ?? "",
      brand: initialProduct.brand ?? "",
    });
    setImages((initialProduct.images ?? []).map((img) => img.url));
    setSpecifications(
      (initialProduct.specifications ?? []).map((s) => ({ key: s.key, value: s.value }))
    );
  }, [initialProduct]);

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

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
        <h1 className="text-4xl text-white mb-2">
          {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h1>
        <p className="text-white/60">
          {isEditMode ? "Cập nhật thông tin sản phẩm" : "Tạo sản phẩm mới cho cửa hàng của bạn"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl text-white mb-6">Thông tin sản phẩm</h2>

          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <Label htmlFor="name" className="text-white mb-2 block">
                Tên sản phẩm <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên sản phẩm"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-white mb-2 block">
                Mô tả
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả sản phẩm"
                className="bg-white/5 border-white/10 text-white min-h-[120px]"
                rows={5}
              />
            </div>

            {/* Category and Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="categoryId" className="text-white mb-2 block">
                  Danh mục <span className="text-red-400">*</span>
                </Label>
                <Select
                  key={categoriesLoaded ? `cat-${formData.categoryId}` : "loading"}
                  value={formData.categoryId}
                  onValueChange={(value: string) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand" className="text-white mb-2 block">
                  Thương hiệu
                </Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Nhập tên thương hiệu"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Price and Original Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="price" className="text-white mb-2 block">
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
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="originalPrice" className="text-white mb-2 block">
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
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Stock and SKU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="stock" className="text-white mb-2 block">
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
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sku" className="text-white mb-2 block">
                  SKU
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="SKU-001"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl text-white mb-6">Hình ảnh sản phẩm</h2>

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer"
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <p className="text-white mb-2">
                {uploading ? "Đang tải lên..." : "Nhấn để tải lên hình ảnh sản phẩm"}
              </p>
              <p className="text-sm text-white/60">PNG, JPG tối đa 10MB</p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative aspect-square bg-white/5 rounded-lg overflow-hidden group">
                    <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 h-6 w-6 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-white">Thông số kỹ thuật</h2>
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
            <p className="text-white/40 text-sm text-center py-4">
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
                    className="bg-white/5 border-white/10 text-white flex-1"
                  />
                  <Input
                    placeholder="VD: 200g, Đỏ, Nhôm"
                    value={spec.value}
                    onChange={(e) =>
                      setSpecifications((prev) =>
                        prev.map((s, i) => (i === index ? { ...s, value: e.target.value } : s))
                      )
                    }
                    className="bg-white/5 border-white/10 text-white flex-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSpecifications((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="h-9 w-9 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors flex-shrink-0"
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
