import { Clock, ShoppingCart, Trash2, X, ArrowRight, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { viewHistoryService, ViewHistoryItem } from "../../services/viewHistory.service";
import { formatCurrency } from "../../lib/currency";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease } },
};

interface RecentlyViewedPageProps {
  onNavigate: (page: string, data?: any) => void;
  onAddToCart: (product: any, quantity: number) => void;
}

export default function RecentlyViewedPage({ onNavigate, onAddToCart }: RecentlyViewedPageProps) {
  const [items, setItems] = useState<ViewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  const fetchHistory = async (page: number) => {
    setLoading(true);
    try {
      const res = await viewHistoryService.getHistory(page, itemsPerPage);
      
      let historyItems = [];
      let totalP = 1;

      // Case 1: Backend trả về structure chuẩn { success: true, data: { items: [], totalPages: 5 } }
      if ((res as any).data && (res as any).data.items) {
        historyItems = (res as any).data.items;
        totalP = (res as any).data.totalPages || (res as any).data.total_pages || 1;
      } 
      // Case 2: Backend trả về structure { items: [], totalPages: 5 }
      else if (res.items) {
        historyItems = res.items;
        totalP = res.totalPages || 1;
      }
      // Case 3: Backend trả về trực tiếp mảng [...] (Dựa trên ảnh Network của user)
      else if (Array.isArray(res)) {
        historyItems = res;
        // Nếu trả về mảng trực tiếp, backend thường k trả về totalPages trong body.
        // Tạm thời để totalP = 1 hoặc nếu anh muốn em sẽ giả định có trang tiếp theo nếu mảng đầy.
        totalP = 1; 
      }
      // Case 4: Backend trả về { success: true, data: [...] }
      else if ((res as any).data && Array.isArray((res as any).data)) {
        historyItems = (res as any).data;
        totalP = 1;
      }
      
      setItems(historyItems);
      setTotalPages(totalP);
    } catch (error) {
      toast.error("Không thể tải lịch sử xem");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

  const handleRemoveItem = async (productId: string) => {
    try {
      await viewHistoryService.removeFromHistory(productId);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      toast.success("Đã xóa khỏi lịch sử");
    } catch (error) {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  const handleClearHistory = async () => {
    try {
      await viewHistoryService.clearHistory();
      setItems([]);
      toast.success("Đã xóa toàn bộ lịch sử xem");
    } catch (error) {
      toast.error("Không thể xóa lịch sử");
    }
  };

  const addToCart = (item: ViewHistoryItem) => {
    onAddToCart(item.product, 1);
    toast.success(`${item.product.name} đã thêm vào giỏ hàng!`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sản phẩm đã xem</h1>
                <p className="text-gray-500 mt-1">Xem lại những sản phẩm bạn đã từng quan tâm</p>
              </div>
            </div>
            {items.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearHistory}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all duration-200 rounded-xl px-6 h-11 border-gray-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa tất cả lịch sử
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-[400px] animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    variants={staggerItem}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  >
                    <Card className="bg-white border-gray-200/80 hover:border-blue-200 transition-all duration-300 group overflow-hidden rounded-2xl shadow-sm hover:shadow-xl">
                      <CardContent className="p-0">
                        {/* Image Section */}
                        <div className="relative aspect-square overflow-hidden bg-gray-50">
                          <img
                            src={item.product.image || ""}
                            alt={item.product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onClick={() => onNavigate("product", item.product)}
                            style={{ cursor: "pointer" }}
                          />
                          
                          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                            {item.viewCount > 1 && (
                              <Badge className="bg-black/60 backdrop-blur-md text-white border-0 shadow-sm flex items-center gap-1 py-1">
                                <Eye className="h-3 w-3" />
                                {item.viewCount} lượt xem
                              </Badge>
                            )}
                            {item.product.discount && item.product.discount > 0 && (
                              <Badge className="bg-red-500 text-white border-0 shadow-sm font-bold">
                                -{item.product.discount}%
                              </Badge>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => handleRemoveItem(item.productId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Info Section */}
                        <div className="p-5">
                          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-2">
                            {item.product.category || "Sản phẩm"}
                          </p>
                          <h3
                            className="font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors h-12"
                            onClick={() => onNavigate("product", item.product)}
                          >
                            {item.product.name}
                          </h3>

                          <div className="flex items-baseline gap-2 mb-5">
                            <span className="text-xl font-bold text-gray-900">{formatCurrency(item.product.price)}</span>
                            {item.product.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatCurrency(item.product.originalPrice)}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-bold shadow-lg shadow-blue-500/10 transition-all hover:-translate-y-px"
                              onClick={() => addToCart(item)}
                            >
                              <ShoppingCart className="h-4.5 w-4.5 mr-2" />
                              Thêm vào giỏ
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="h-10 w-10 rounded-xl border-gray-200"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={currentPage === p ? "default" : "outline"}
                    onClick={() => setCurrentPage(p)}
                    className={`h-10 w-10 rounded-xl font-bold ${
                      currentPage === p 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {p}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="h-10 w-10 rounded-xl border-gray-200"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-[40px] bg-gray-100 mb-8">
              <Clock className="h-14 w-14 text-gray-300" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Lịch sử xem trống</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto text-lg">
              Bạn chưa xem sản phẩm nào. Hãy khám phá cửa hàng để tìm những món đồ ưng ý nhé!
            </p>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-10 h-14 font-bold shadow-xl shadow-blue-500/20 transition-all hover:shadow-2xl hover:-translate-y-1"
              onClick={() => onNavigate("shop")}
            >
              Bắt đầu mua sắm ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
