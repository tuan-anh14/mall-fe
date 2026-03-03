import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { get, post } from "../../lib/api";
import { API_URL } from "../../lib/api";
import { toast } from "sonner@2.0.3";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface AddProductPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function AddProductPage({ onNavigate }: AddProductPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    get<Category[]>('/api/v1/categories')
      .then(setCategories)
      .catch(() => toast.error('Failed to load categories'));
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
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('files', file));

      const res = await fetch(`${API_URL}/api/v1/upload/images`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Upload failed');

      const urls: string[] = json.data?.urls ?? [];
      setImages((prev) => [...prev, ...urls]);
      toast.success('Images uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload images');
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
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await post('/api/v1/seller/products', {
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock),
        sku: formData.sku || undefined,
        brand: formData.brand || undefined,
        images: images.length > 0 ? images : undefined,
      });
      toast.success("Product added successfully!");
      onNavigate("seller-products");
    } catch (err: any) {
      toast.error(err.message || 'Failed to add product');
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
          Back to Products
        </Button>
        <h1 className="text-4xl text-white mb-2">Add New Product</h1>
        <p className="text-white/60">Create a new product listing for your store</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl text-white mb-6">Product Information</h2>

          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <Label htmlFor="name" className="text-white mb-2 block">
                Product Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-white mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                className="bg-white/5 border-white/10 text-white min-h-[120px]"
                rows={5}
              />
            </div>

            {/* Category and Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="categoryId" className="text-white mb-2 block">
                  Category <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select category" />
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
                  Brand
                </Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Enter brand name"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Price, Original Price, Stock, SKU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="price" className="text-white mb-2 block">
                  Price ($) <span className="text-red-400">*</span>
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
                  Original Price ($)
                </Label>
                <Input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  placeholder="0.00 (optional, for discount)"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="stock" className="text-white mb-2 block">
                  Stock Quantity <span className="text-red-400">*</span>
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
          <h2 className="text-2xl text-white mb-6">Product Images</h2>

          <div className="space-y-4">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer"
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <p className="text-white mb-2">
                {uploading ? "Uploading..." : "Click to upload product images"}
              </p>
              <p className="text-sm text-white/60">PNG, JPG up to 10MB</p>
            </div>

            {/* Image Preview Grid */}
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onNavigate("seller-products")}
            className="sm:w-auto w-full"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || uploading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 sm:w-auto w-full"
          >
            {submitting ? "Adding..." : "Add Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
