import React, { useState, useEffect, useCallback } from "react";
import { Search, Save, Boxes, ArrowDownRight, Minus, Plus } from "lucide-react";
import { formatCurrency } from "../../lib/currency";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { get, patch } from "../../lib/api";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  category: { id: string; name: string } | null;
  price: number;
  stock: number;
  sku?: string | null;
  status: string;
  images: { id: string; url: string; isPrimary: boolean; sortOrder: number }[];
}

interface ProductStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

interface SellerInventoryPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function SellerInventoryPage({ onNavigate }: SellerInventoryPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats>({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const fetchProducts = useCallback(async (search?: string) => {
    try {
      const path = search ? `/api/v1/seller/products?search=${encodeURIComponent(search)}` : '/api/v1/seller/products';
      const res = await get<{ data: Product[]; stats: ProductStats }>(path);
      setProducts(res.data);
      setStats(res.stats);

      // Initialize editing stock state
      const initialStock: Record<string, number> = {};
      res.data.forEach(p => {
        initialStock[p.id] = p.stock;
      });
      setEditingStock(initialStock);
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
      fetchProducts(searchQuery || undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProducts]);

  const handleStockChange = (productId: string, value: number) => {
    setEditingStock(prev => ({
      ...prev,
      [productId]: Math.max(0, value)
    }));
  };

  const adjustStock = (productId: string, delta: number) => {
    setEditingStock(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + delta)
    }));
  };

  const handleSaveStock = async (productId: string) => {
    const newStock = editingStock[productId];
    const currentProduct = products.find(p => p.id === productId);

    if (currentProduct?.stock === newStock) {
      return; // No change
    }

    setUpdatingIds(prev => new Set(prev).add(productId));
    try {
      await patch(`/api/v1/seller/products/${productId}/stock`, { stock: newStock });
      toast.success(`Đã cập nhật tồn kho cho "${currentProduct?.name}"`);

      // Update local state
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));

      // Refetch stats to keep them in sync
      const res = await get<{ data: Product[]; stats: ProductStats }>('/api/v1/seller/products');
      setStats(res.stats);
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật tồn kho');
      // Reset back to original if failed
      if (currentProduct) {
        setEditingStock(prev => ({ ...prev, [productId]: currentProduct.stock }));
      }
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl text-gray-900 font-bold mb-2 flex items-center gap-3">
            <Boxes className="h-10 w-10 text-blue-600" />
            Quản lý kho hàng
          </h1>
          <p className="text-gray-500">Cập nhật nhanh số lượng sản phẩm trong kho mà không làm gián đoạn việc bán hàng</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-1">Tổng sản phẩm</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-1">Đang kinh doanh</p>
          <p className="text-3xl font-bold text-green-600">{stats.inStock}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-1">Sắp hết hàng (&le;10)</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.lowStock}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-1">Hết hàng</p>
          <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30">
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên..."
              className="pl-10 bg-white border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-400 italic flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Nhấn Enter hoặc nút Lưu để cập nhật
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="w-[350px]">Sản phẩm</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Giá bán</TableHead>
                  <TableHead className="w-[200px]">Số lượng kho</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product) => {
                    const isChanged = editingStock[product.id] !== product.stock;
                    const isUpdating = updatingIds.has(product.id);
                    const stockValue = editingStock[product.id] ?? product.stock;

                    return (
                      <TableRow key={product.id} className="hover:bg-gray-50/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                              <ImageWithFallback
                                src={product.images[0]?.url || ""}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.category?.name || "Chưa phân loại"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-[11px] bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                            {product.sku || "N/A"}
                          </code>
                        </TableCell>
                        <TableCell className="text-gray-900 font-medium">
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                              onClick={() => adjustStock(product.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              className={`h-9 w-20 text-center font-bold transition-all ${isChanged ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-gray-200'}`}
                              value={stockValue}
                              onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveStock(product.id)}
                            />
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-lg hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                              onClick={() => adjustStock(product.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge
                              className={`w-fit border-none px-2 py-0.5 rounded-full ${product.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : product.status === "OUT_OF_STOCK"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                                }`}
                            >
                              {product.status === "ACTIVE" ? "Đang bán" : product.status === "OUT_OF_STOCK" ? "Hết hàng" : "Ngừng bán"}
                            </Badge>
                            {stockValue <= 10 && stockValue > 0 && (
                              <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider flex items-center gap-0.5 ml-1">
                                <ArrowDownRight className="h-3 w-3" /> Sắp hết hàng
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            disabled={!isChanged || isUpdating}
                            onClick={() => handleSaveStock(product.id)}
                            className={`min-w-[80px] transition-all ${isChanged
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                              : "bg-gray-100 text-gray-400 border-none px-4"
                              }`}
                          >
                            {isUpdating ? (
                              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Lưu
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-24">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Boxes className="h-12 w-12 opacity-20" />
                        <p>Không tìm thấy sản phẩm nào trong kho</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

