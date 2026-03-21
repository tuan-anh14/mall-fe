import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Zap, Shield, Truck, Headphones, Tag, X } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ProductCard } from "../ProductCard";
import { RecommendedSection } from "../RecommendedSection";
import { RecentlyViewedSection } from "../RecentlyViewedSection";
import { motion, AnimatePresence } from "motion/react";
import { get } from "../../lib/api";
import { formatCurrency } from "../../lib/currency";

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
  onAddToCart?: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  isInWishlist?: (productId: number) => boolean;
  isAuthenticated?: boolean;
}

interface Promotion {
  id: string;
  code: string;
  name?: string | null;
  description?: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number | string;
  minOrderAmount?: number | string | null;
  maxDiscount?: number | string | null;
  validUntil?: string | null;
}

export function HomePage({ onNavigate, onAddToCart, onAddToWishlist, isInWishlist, isAuthenticated = false }: HomePageProps) {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromoPopup, setShowPromoPopup] = useState(false);

  // Auto-rotate featured product every 5 seconds
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const featuredProductsForHero = featuredProducts.length > 0 ? featuredProducts : [];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [featuredRes, trendingRes, categoriesRes, promotionsRes] = await Promise.all([
          get<{ products: any[]; total: number; page: number; limit: number; totalPages: number }>(
            "/api/v1/products?featured=true&limit=6"
          ),
          get<{ products: any[]; total: number; page: number; limit: number; totalPages: number }>(
            "/api/v1/products?trending=true&limit=6"
          ),
          get<{ categories: any[] }>("/api/v1/categories"),
          get<{ promotions: Promotion[] }>("/api/v1/products/promotions").catch(() => ({ promotions: [] })),
        ]);

        setFeaturedProducts(featuredRes.products ?? []);
        setTrendingProducts(trendingRes.products ?? []);
        setCategories(categoriesRes.categories ?? []);
        const activePromos = promotionsRes.promotions ?? [];
        setPromotions(activePromos);
        // Show popup if there are active promotions and user hasn't dismissed today
        if (activePromos.length > 0) {
          const lastDismissed = localStorage.getItem("promo_popup_dismissed");
          const today = new Date().toDateString();
          if (lastDismissed !== today) {
            setShowPromoPopup(true);
          }
        }
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (featuredProductsForHero.length === 0) return;
    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prevIndex) =>
        (prevIndex + 1) % featuredProductsForHero.length
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredProductsForHero.length]);

  const currentProduct = featuredProductsForHero[currentFeaturedIndex];

  const handleViewFeatured = useCallback((id: string | number) => {
    onNavigate("product", featuredProducts.find((p) => p.id === id));
  }, [featuredProducts, onNavigate]);

  const handleViewTrending = useCallback((id: string | number) => {
    onNavigate("product", trendingProducts.find((p) => p.id === id));
  }, [trendingProducts, onNavigate]);

  const handleAddToCart = useCallback((prod: any) => {
    onAddToCart?.(prod);
  }, [onAddToCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-white/60 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />

        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
                Hàng mới về
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-white mb-6">
                Sản Phẩm Cao Cấp
                <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Chất Lượng Vượt Trội
                </span>
              </h1>
              <p className="text-xl text-white/70 mb-8 max-w-lg">
                Khám phá bộ sưu tập điện tử, thời trang và đồ gia dụng cao cấp được tuyển chọn. Ưu đãi có hạn giảm đến 50%!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => onNavigate("shop")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Mua ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => onNavigate("about")}>
                  Tìm hiểu thêm
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {currentProduct && (
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-8">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentFeaturedIndex}
                      src={currentProduct.image}
                      alt="Sản phẩm nổi bật"
                      className="w-full h-[500px] object-cover rounded-2xl"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                    />
                  </AnimatePresence>
                  <div className="absolute bottom-12 left-12 right-12 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-purple-400">Sản phẩm nổi bật</p>
                      <div className="flex gap-1">
                        {featuredProductsForHero.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentFeaturedIndex(index)}
                            className={`h-1.5 rounded-full transition-all ${
                              index === currentFeaturedIndex
                                ? "w-8 bg-purple-400"
                                : "w-1.5 bg-white/30 hover:bg-white/50"
                            }`}
                            aria-label={`Go to product ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentFeaturedIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-2xl text-white mb-2">{currentProduct.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-3xl text-white">{formatCurrency(currentProduct.price)}</span>
                          <Button
                            onClick={() => onNavigate("product", currentProduct)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600"
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-y border-white/10 bg-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "Miễn phí vận chuyển", desc: "Đơn hàng trên 50" },
              { icon: Shield, title: "Thanh toán an toàn", desc: "Bảo mật 100%" },
              { icon: Zap, title: "Giao hàng nhanh", desc: "2-3 ngày làm việc" },
              { icon: Headphones, title: "Hỗ trợ 24/7", desc: "Luôn sẵn sàng hỗ trợ" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 mb-4">
                  <feature.icon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-white/60">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl text-white mb-2">Danh mục sản phẩm</h2>
            <p className="text-white/60">Khám phá đa dạng sản phẩm của chúng tôi</p>
          </div>
          <Button variant="ghost" onClick={() => onNavigate("shop")}>
            Xem tất cả
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate("shop", { category: cat.name })}
              className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="text-4xl mb-3">
                {cat.name === "Điện tử" && "💻"}
                {cat.name === "Thời trang" && "👕"}
                {cat.name === "Nhà cửa" && "🏠"}
                {cat.name === "Thể thao" && "⚽"}
                {cat.name === "Làm đẹp" && "💄"}
                {cat.name === "Sách" && "📚"}
              </div>
              <h3 className="text-white group-hover:text-purple-400 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-white/50 mt-1">{cat.productCount} sản phẩm</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Sản phẩm nổi bậts */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl text-white mb-2">Sản phẩm nổi bật</h2>
            <p className="text-white/60">Sản phẩm được tuyển chọn dành cho bạn</p>
          </div>
          <Button variant="ghost" onClick={() => onNavigate("shop")}>
            Xem tất cả
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={handleViewFeatured}
              onAddToCart={handleAddToCart}
              onAddToWishlist={onAddToWishlist}
              isInWishlist={isInWishlist?.(product.id)}
            />
          ))}
        </div>
      </section>

      {/* Promotional Banner — dynamic from active platform coupons */}
      {promotions.length > 0 && (
        <section className="py-16 container mx-auto px-4">
          <div className="space-y-4">
            {promotions.map((promo) => {
              const discountLabel = promo.type === "PERCENTAGE"
                ? `${promo.value}%`
                : `${formatCurrency(Number(promo.value))}`;
              const title = promo.name || `Giảm ${discountLabel}`;
              const desc = promo.description || `Sử dụng mã ${promo.code} để được giảm ${discountLabel}. Đừng bỏ lỡ ưu đãi hấp dẫn này!`;
              const hasExpiry = !!promo.validUntil;
              return (
                <div key={promo.id} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 p-12">
                  <div className="relative z-10 max-w-2xl">
                    <Badge className="mb-4 bg-white/20 text-white border-white/30">
                      {hasExpiry ? `Hết hạn ${new Date(promo.validUntil!).toLocaleDateString("vi-VN")}` : "Ưu đãi đặc biệt"}
                    </Badge>
                    <h2 className="text-4xl text-white mb-4">{title}</h2>
                    <p className="text-xl text-white/90 mb-3">{desc}</p>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="inline-flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
                        <Tag className="h-4 w-4 text-white" />
                        <span className="text-white font-mono font-bold tracking-widest">{promo.code}</span>
                      </div>
                      {promo.minOrderAmount && (
                        <span className="text-white/70 text-sm">Đơn tối thiểu {formatCurrency(Number(promo.minOrderAmount))}</span>
                      )}
                    </div>
                    <Button
                      size="lg"
                      onClick={() => onNavigate("shop")}
                      className="bg-white text-purple-600 hover:bg-white/90"
                    >
                      Mua ngay
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNMzYgMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMjRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTEyIDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] " />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* AI Recommendations — shown only to logged-in users */}
      {isAuthenticated && (
        <RecommendedSection
          onNavigate={onNavigate}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          isInWishlist={(id) => isInWishlist?.(id as any) ?? false}
        />
      )}

      {/* Recently Viewed — shown only to logged-in users */}
      {isAuthenticated && (
        <RecentlyViewedSection
          onNavigate={onNavigate}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          isInWishlist={(id) => isInWishlist?.(id as any) ?? false}
        />
      )}

      {/* Trending Products */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl text-white mb-2">Xu hướng hiện tại</h2>
            <p className="text-white/60">Sản phẩm phổ biến nhất tuần này</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={handleViewTrending}
              onAddToCart={handleAddToCart}
              onAddToWishlist={onAddToWishlist}
              isInWishlist={isInWishlist?.(product.id)}
            />
          ))}
        </div>
      </section>

      {/* Promo Popup */}
      <AnimatePresence>
        {showPromoPopup && promotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowPromoPopup(false);
              localStorage.setItem("promo_popup_dismissed", new Date().toDateString());
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-gradient-to-br from-purple-900 to-blue-900 border border-purple-500/30 rounded-3xl p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowPromoPopup(false);
                  localStorage.setItem("promo_popup_dismissed", new Date().toDateString());
                }}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 mb-4">
                  <Tag className="h-7 w-7 text-purple-300" />
                </div>
                <h2 className="text-2xl text-white mb-1">Ưu đãi hôm nay</h2>
                <p className="text-white/50 text-sm">Đừng bỏ lỡ các mã giảm giá đặc biệt</p>
              </div>

              <div className="space-y-3 mb-6">
                {promotions.map((promo) => {
                  const discountLabel = promo.type === "PERCENTAGE"
                    ? `Giảm ${promo.value}%`
                    : `Giảm ${formatCurrency(Number(promo.value))}`;
                  return (
                    <div key={promo.id} className="bg-white/10 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-mono font-bold tracking-widest text-lg">{promo.code}</span>
                        <Badge className="bg-purple-500/30 text-purple-200 border-0">{discountLabel}</Badge>
                      </div>
                      {(promo.name || promo.description) && (
                        <p className="text-white/60 text-sm">{promo.description || promo.name}</p>
                      )}
                      {promo.minOrderAmount && (
                        <p className="text-white/40 text-xs mt-1">Đơn tối thiểu {formatCurrency(Number(promo.minOrderAmount))}</p>
                      )}
                      {promo.validUntil && (
                        <p className="text-white/40 text-xs mt-0.5">Hết hạn {new Date(promo.validUntil).toLocaleDateString("vi-VN")}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => {
                  setShowPromoPopup(false);
                  localStorage.setItem("promo_popup_dismissed", new Date().toDateString());
                  onNavigate("shop");
                }}
              >
                Mua sắm ngay
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
