import { useState, useEffect } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { get, post, put } from "../../lib/api";

interface AddProductPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialData?: any;
}

export function AddProductPage({ onNavigate, initialData }: AddProductPageProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category?.id || "",
    price: initialData?.price?.toString() || "",
    stock: initialData?.stock?.toString() || "",
    sku: initialData?.sku || "",
    brand: initialData?.brand || "",
  });

  const [images, setImages] = useState<string[]>(initialData?.images?.map((img: any) => img.url) || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await get("/api/v1/categories");
        setCategories(data.items || data || []);
      } catch (error) {
        toast.error("Failed to load categories for selection");
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.category, // sending the real CategoryID mapped from selection
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        sku: formData.sku || undefined,
        brand: formData.brand || undefined,
        images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"], // Fallback image
      };

      if (initialData?.id) {
        await put(`/api/v1/seller/products/${initialData.id}`, payload);
        toast.success("Product updated successfully!");
      } else {
        await post("/api/v1/seller/products", payload);
        toast.success("Product added successfully!");
      }
      onNavigate("seller-products");
    } catch (error: any) {
      toast.error(error.message || `Failed to ${initialData ? "update" : "add"} product`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = () => {
    // Mock image upload
    toast.success("Image upload functionality ready for integration");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
        <h1 className="text-4xl text-white mb-2">{initialData ? "Edit Product" : "Add New Product"}</h1>
        <p className="text-white/60">
          {initialData ? "Update your product information" : "Create a new product listing for your store"}
        </p>
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
                <Label htmlFor="category" className="text-white mb-2 block">
                  Category <span className="text-red-400">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value: string) => setFormData((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
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

            {/* Price, Stock, and SKU */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            {/* Image Upload Area */}
            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer"
              onClick={handleImageUpload}
            >
              <Upload className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <p className="text-white mb-2">Click to upload product images</p>
              <p className="text-sm text-white/60">PNG, JPG up to 10MB</p>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square bg-white/5 rounded-lg overflow-hidden group">
                    <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
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
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-blue-600 sm:w-auto w-full"
          >
            {isSubmitting ? "Adding..." : "Add Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
