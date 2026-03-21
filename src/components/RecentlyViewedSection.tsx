import { useState, useEffect } from "react";
import { Clock, Trash2, X } from "lucide-react";
import { Button } from "./ui/button";
import { ProductCard } from "./ProductCard";
import { viewHistoryService, ViewHistoryItem } from "../services/viewHistory.service";
import { toast } from "sonner";

interface RecentlyViewedSectionProps {
  onNavigate: (page: string, data?: any) => void;
  onAddToCart?: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  isInWishlist?: (productId: string) => boolean;
}

export function RecentlyViewedSection({
  onNavigate,
  onAddToCart,
  onAddToWishlist,
  isInWishlist,
}: RecentlyViewedSectionProps) {
  const [items, setItems] = useState<ViewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    viewHistoryService
      .getHistory(1, 8)
      .then((res) => setItems(res?.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await viewHistoryService.removeFromHistory(productId);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } catch {
      toast.error("Không thể xóa sản phẩm khỏi lịch sử");
    }
  };

  const handleClearAll = async () => {
    try {
      await viewHistoryService.clearHistory();
      setItems([]);
      toast.success("Đã xóa toàn bộ lịch sử xem");
    } catch {
      toast.error("Không thể xóa lịch sử xem");
    }
  };

  if (loading || items.length === 0) return null;

  return (
    <section className="py-12 container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="text-2xl text-gray-900">Sản phẩm đã xem gần đây</h2>
            <p className="text-sm text-gray-500">{items.length} sản phẩm</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Xóa tất cả
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <button
              onClick={(e) => handleRemove(item.productId, e)}
              className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-gray-700/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            >
              <X className="h-3 w-3 text-white" />
            </button>
            <ProductCard
              product={item.product}
              onView={(id) => onNavigate("product", item.product)}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              isInWishlist={isInWishlist?.(item.productId)}
            />
            {item.viewCount > 1 && (
              <div className="mt-1 text-center text-xs text-gray-400">
                Đã xem {item.viewCount} lần
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
