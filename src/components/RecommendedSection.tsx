import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { ProductCard } from "./ProductCard";
import { viewHistoryService } from "../services/viewHistory.service";

interface RecommendedSectionProps {
  onNavigate: (page: string, data?: any) => void;
  onAddToCart?: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  isInWishlist?: (productId: string) => boolean;
}

export function RecommendedSection({
  onNavigate,
  onAddToCart,
  onAddToWishlist,
  isInWishlist,
}: RecommendedSectionProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [isPersonalized, setIsPersonalized] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    viewHistoryService
      .getRecommendations(8)
      .then((res) => {
        setProducts(res.products);
        setIsPersonalized(res.isPersonalized ?? false);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-12 container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl text-gray-900">Đề xuất cho bạn</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 border border-gray-200 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {isPersonalized ? (
            <Sparkles className="h-5 w-5 text-blue-600" />
          ) : (
            <TrendingUp className="h-5 w-5 text-orange-500" />
          )}
          <div>
            <h2 className="text-2xl text-gray-900">
              {isPersonalized ? "Đề xuất cho bạn" : "Xu hướng tuần này"}
            </h2>
            <p className="text-sm text-gray-500">
              {isPersonalized
                ? "Dựa trên lịch sử mua hàng và sở thích của bạn"
                : "Sản phẩm được yêu thích nhất hiện tại"}
            </p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => onNavigate("shop")}>
          Xem thêm
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onView={(id) => onNavigate("product", product)}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
            isInWishlist={isInWishlist?.(product.id)}
          />
        ))}
      </div>
    </section>
  );
}
