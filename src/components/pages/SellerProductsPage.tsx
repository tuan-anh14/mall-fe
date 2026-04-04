import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Eye, Package } from "lucide-react";
import { formatCurrency } from "../../lib/currency";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { get, del } from "../../lib/api";
import { toast } from "sonner";
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

interface Product {
  id: string;
  name: string;
  description?: string;
  category: { id: string; name: string } | null;
  price: number;
  originalPrice?: number | null;
  stock: number;
  sku?: string | null;
  brand?: string | null;
  status: string;
  ratingAverage: number;
  reviewCount: number;
  images: { id: string; url: string; isPrimary: boolean; sortOrder: number }[];
  colors?: { id: string; name: string; hexCode?: string }[];
  sizes?: { id: string; value: string }[];
  specifications?: { id: string; key: string; value: string }[];
}

interface ProductStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

interface SellerProductsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function SellerProductsPage({ onNavigate }: SellerProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats>({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async (search?: string) => {
    try {
      const path = search ? `/api/v1/seller/products?search=${encodeURIComponent(search)}` : '/api/v1/seller/products';
      const res = await get<{ data: Product[]; stats: ProductStats }>(path);
      setProducts(res.data);
      setStats(res.stats);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchProducts(searchQuery);
      } else {
        fetchProducts();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProducts]);

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setDeleting(true);
    try {
      await del(`/api/v1/seller/products/${selectedProduct.id}`);
      toast.success(`Đã xóa sản phẩm "${selectedProduct.name}" thành công`);
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts(searchQuery || undefined);
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa sản phẩm');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl text-gray-900 mb-2">Quản lý sản phẩm</h1>
          <p className="text-gray-500">Quản lý kho hàng và danh sách sản phẩm</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => onNavigate("add-product")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-gray-500">Tổng sản phẩm</p>
          </div>
          <p className="text-3xl text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-5 w-5 text-green-400" />
            <p className="text-sm text-gray-500">Còn hàng</p>
          </div>
          <p className="text-3xl text-gray-900">{stats.inStock}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-5 w-5 text-yellow-400" />
            <p className="text-sm text-gray-500">Sắp hết</p>
          </div>
          <p className="text-3xl text-gray-900">{stats.lowStock}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-5 w-5 text-red-400" />
            <p className="text-sm text-gray-500">Hết hàng</p>
          </div>
          <p className="text-3xl text-gray-900">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl text-gray-900">Tất cả sản phẩm</h2>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-10 bg-gray-50 border-gray-200 w-full md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center text-gray-500 py-12">Đang tải sản phẩm...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-600">Sản phẩm</TableHead>
                  <TableHead className="text-gray-600">Danh mục</TableHead>
                  <TableHead className="text-gray-600">Giá</TableHead>
                  <TableHead className="text-gray-600">Tồn kho</TableHead>
                  <TableHead className="text-gray-600">Trạng thái</TableHead>
                  <TableHead className="text-gray-600 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id} className="border-gray-200 hover:bg-gray-50">
                      <TableCell className="text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={product.images[0]?.url || ""}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="line-clamp-1">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{product.category?.name ?? "-"}</TableCell>
                      <TableCell className="text-gray-900">{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            product.stock > 20
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : product.stock > 10
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : product.stock > 0
                              ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }
                        >
                          {product.stock} sản phẩm
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            product.status === "ACTIVE"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : product.status === "DRAFT"
                              ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }
                        >
                          {product.status === "ACTIVE"
                            ? "Đang bán"
                            : product.status === "INACTIVE"
                            ? "Ngừng bán"
                            : product.status === "OUT_OF_STOCK"
                            ? "Hết hàng"
                            : "Nháp"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Transform seller format → buyer format for ProductDetailPage
                              const viewProduct = {
                                ...product,
                                image: product.images[0]?.url || "",
                                images: product.images.map((img: any) => img.url),
                                colors: (product.colors ?? []).map((c: any) => c.name),
                                sizes: (product.sizes ?? []).map((s: any) => s.value),
                                rating: product.ratingAverage,
                                reviews: product.reviewCount,
                                category: product.category?.name ?? "",
                              };
                              onNavigate("product", viewProduct);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onNavigate("edit-product", product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      {searchQuery ? `Không tìm thấy sản phẩm phù hợp "${searchQuery}"` : "Chưa có sản phẩm"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Bạn có chắc chắn muốn xóa "{selectedProduct?.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
