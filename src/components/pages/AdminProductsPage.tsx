import { useEffect, useState, useCallback } from "react";
import { 
  Search, 
  Trash2, 
  Eye, 
  Filter, 
  Store, 
  Tag, 
  Package, 
  AlertCircle,
  MoreVertical,
  ExternalLink
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { get, del } from "../../lib/api";
import { toast } from "sonner";
import {
  AdminPageLayout,
  AdminSpinner,
  adminPanelClass,
  adminTheadRowClass,
  adminThClass,
  adminTrClass,
  AdminPagination,
} from "../admin/AdminPageLayout";
import { cn } from "../ui/utils";

interface Product {
  id: string;
  name: string;
  sku?: string | null;
  price: number;
  stock: number;
  status: string;
  category: { id: string; name: string };
  seller: { id: string; storeName: string; storeSlug: string; userId: string };
  images: { id: string; url: string; isPrimary: boolean }[];
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface Seller {
  id: string;
  sellerProfile?: { storeName: string } | null;
}

export function AdminProductsPage({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Filters
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sellerId, setSellerId] = useState("all");
  const [status, setStatus] = useState("all");

  // Filter Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFilters = async () => {
    try {
      const [cats, sellerData] = await Promise.all([
        get<Category[]>("/api/v1/admin/categories"),
        get<{ users: Seller[] }>("/api/v1/admin/accounts?userType=SELLER&limit=100"),
      ]);
      setCategories(cats);
      setSellers(sellerData.users);
    } catch (err) {
      console.error("Failed to fetch filters", err);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search) params.append("search", search);
      if (categoryId !== "all") params.append("categoryId", categoryId);
      if (sellerId !== "all") params.append("sellerId", sellerId);
      if (status !== "all") params.append("status", status);

      const data = await get<{ products: Product[]; total: number }>(`/api/v1/admin/products?${params.toString()}`);
      setProducts(data.products);
      setTotal(data.total);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, sellerId, status]);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await del<{ message: string }>(`/api/v1/admin/products/${deleteTarget.id}`);
      toast.success(res.message);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa sản phẩm");
    } finally {
      setDeleting(false);
    }
  };

  const currentTotalPages = Math.ceil(total / limit);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-medium">Đang bán</Badge>;
      case "INACTIVE":
        return <Badge className="bg-gray-50 text-gray-600 border-gray-100 font-medium">Ẩn</Badge>;
      case "OUT_OF_STOCK":
        return <Badge className="bg-orange-50 text-orange-700 border-orange-100 font-medium">Hết hàng</Badge>;
      case "BANNED":
        return <Badge className="bg-red-50 text-red-700 border-red-100 font-medium">Khóa</Badge>;
      default:
        return <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-medium">{status}</Badge>;
    }
  };

  return (
    <AdminPageLayout
      title="Quản lý sản phẩm"
      description={`Tổng số ${total} sản phẩm trên toàn bộ hệ thống`}
    >
      {/* Search & Filter Bar */}
      <Card className="mb-6 p-4 border-blue-100 bg-white shadow-sm overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Tìm tên sản phẩm hoặc SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-400 shrink-0" />
            <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setPage(1); }}>
              <SelectTrigger className="bg-slate-50/50 border-slate-200">
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-slate-400 shrink-0" />
            <Select value={sellerId} onValueChange={(v) => { setSellerId(v); setPage(1); }}>
              <SelectTrigger className="bg-slate-50/50 border-slate-200 text-left">
                <SelectValue placeholder="Tất cả cửa hàng" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-[300px]">
                <SelectItem value="all">Tất cả cửa hàng</SelectItem>
                {sellers.map((seller) => (
                  <SelectItem key={seller.id} value={seller.id}>
                    {seller.sellerProfile?.storeName || "Unknown Shop"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="bg-slate-50/50 border-slate-200">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Đang bán</SelectItem>
                <SelectItem value="INACTIVE">Đang ẩn</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Hết hàng</SelectItem>
                <SelectItem value="BANNED">Đã bị khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Product List */}
      <Card className={cn(adminPanelClass, "overflow-hidden")}>
        {loading ? (
          <div className="py-20 flex justify-center">
            <AdminSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <Package className="h-12 w-12 text-slate-200 mb-4" />
            <p className="text-sm">Không tìm thấy sản phẩm nào phù hợp</p>
            {(search || categoryId !== "all" || sellerId !== "all" || status !== "all") && (
              <Button 
                variant="link" 
                className="mt-2 text-primary"
                onClick={() => {
                  setSearch("");
                  setCategoryId("all");
                  setSellerId("all");
                  setStatus("all");
                }}
              >
                Xóa các bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className={adminTheadRowClass}>
                  <th className={cn(adminThClass, "w-[400px]")}>Sản phẩm / Shop</th>
                  <th className={adminThClass}>Danh mục</th>
                  <th className={adminThClass}>Giá (Base)</th>
                  <th className={adminThClass}>Tồn kho</th>
                  <th className={adminThClass}>Trạng thái</th>
                  <th className={cn(adminThClass, "text-right")}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className={cn(adminTrClass, "group")}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                          {product.images?.[0]?.url ? (
                            <img 
                              src={product.images[0].url} 
                              alt={product.name} 
                              className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-300">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-[280px]">
                          <p 
                            className="text-sm font-semibold text-slate-900 truncate hover:text-primary cursor-pointer"
                            title={product.name}
                            onClick={() => {
                              const navProduct = {
                                ...product,
                                image: product.images?.[0]?.url,
                                category: product.category.name,
                                seller: {
                                  ...product.seller,
                                  userId: product.seller.userId,
                                  storeName: product.seller.storeName
                                }
                              };
                              onNavigate("product", navProduct);
                            }}
                          >
                            {product.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Store className="h-3 w-3 text-slate-400" />
                            <span 
                              className="text-xs text-slate-500 hover:text-blue-600 cursor-pointer"
                              onClick={() => onNavigate("seller-profile", { sellerUserId: product.seller.id })}
                            >
                              {product.seller.storeName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Tag className="h-3 w-3 text-slate-400" />
                        <span className="text-sm text-slate-600">{product.category.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {Number(product.price).toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "text-sm font-medium",
                        product.stock <= 5 ? "text-red-600" : "text-slate-600"
                      )}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            const navProduct = {
                              ...product,
                              image: product.images?.[0]?.url,
                              category: product.category.name,
                              seller: {
                                ...product.seller,
                                userId: product.seller.userId,
                                storeName: product.seller.storeName
                              }
                            };
                            onNavigate("product", navProduct);
                          }}
                          title="Xem trang sản phẩm"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(product)}
                          title="Xóa sản phẩm"
                        >
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

      {/* Pagination */}
      <AdminPagination
        currentPage={page}
        totalPages={currentTotalPages}
        setCurrentPage={setPage}
        totalItems={total}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-slate-900">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Xác nhận xóa sản phẩm?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Bạn đang chuẩn bị xóa vĩnh viễn sản phẩm <strong className="text-slate-900">{deleteTarget?.name}</strong>. 
              Hành động này không thể hoàn tác và sẽ ảnh hưởng đến lịch sử đơn hàng của Shop.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="border-slate-200">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageLayout>
  );
}
