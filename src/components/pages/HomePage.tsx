import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Zap, Shield, Truck, Headphones, Tag, X, Sparkles } from "lucide-react";
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

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const sectionReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
};

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-[3px] border-blue-100" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 animate-spin" />
          </div>
          <p className="text-gray-400 text-sm tracking-wide">Đang tải...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        </div>

        <div className="container mx-auto px-4 py-24 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Badge className="mb-6 bg-white/15 text-white border-white/20 backdrop-blur-sm px-4 py-1.5 text-sm">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Hàng mới về
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-6xl lg:text-7xl text-white mb-6 font-bold tracking-tight leading-[1.1]"
              >
                Sản Phẩm Cao Cấp
                <span className="block bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
                  Chất Lượng Vượt Trội
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg text-blue-100/80 mb-10 max-w-lg leading-relaxed"
              >
                Khám phá bộ sưu tập điện tử, thời trang và đồ gia dụng cao cấp được tuyển chọn. Ưu đãi có hạn giảm đến 50%!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-wrap gap-4"
              >
                <Button
                  size="lg"
                  onClick={() => onNavigate("shop")}
                  className="bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
                >
                  Mua ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigate("about")}
                  className="bg-white text-blue-950 font-medium hover:bg-blue-50 shadow-lg shadow-white/10 transition-all duration-300"
                >
                  Tìm hiểu thêm
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              {currentProduct && (
                <div className="relative rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/15 p-6">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentFeaturedIndex}
                      src={currentProduct.image}
                      alt="Sản phẩm nổi bật"
                      className="w-full h-[480px] object-cover rounded-2xl"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </AnimatePresence>

                  <div className="absolute bottom-10 left-10 right-10">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-black/10 border border-white/80">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Sản phẩm nổi bật</p>
                        <div className="flex gap-1.5">
                          {featuredProductsForHero.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentFeaturedIndex(index)}
                              className={`rounded-full transition-all duration-500 ${
                                index === currentFeaturedIndex
                                  ? "w-8 h-2 bg-blue-600"
                                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                              }`}
                              aria-label={`Go to product ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentFeaturedIndex}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-1">{currentProduct.name}</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-gray-900">{formatCurrency(currentProduct.price)}</span>
                            <Button
                              onClick={() => onNavigate("product", currentProduct)}
                              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:-translate-y-0.5"
                            >
                              Xem chi tiết
                              <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { icon: Truck, title: "Miễn phí vận chuyển", desc: "Đơn hàng trên 50", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
              { icon: Shield, title: "Thanh toán an toàn", desc: "Bảo mật 100%", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
              { icon: Zap, title: "Giao hàng nhanh", desc: "2-3 ngày làm việc", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
              { icon: Headphones, title: "Hỗ trợ 24/7", desc: "Luôn sẵn sàng hỗ trợ", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="group text-center p-6 rounded-2xl hover:bg-gray-50/80 transition-colors duration-300"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.bg} border ${feature.border} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Danh mục sản phẩm</h2>
            <p className="text-gray-500">Khám phá đa dạng sản phẩm của chúng tôi</p>
          </div>
          <Button variant="ghost" onClick={() => onNavigate("shop")} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 hidden sm:flex">
            Xem tất cả
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.map((cat, i) => {
            const categoryStyles: Record<string, { emoji: string; gradient: string }> = {
              "Điện tử": { emoji: "💻", gradient: "from-blue-50 to-indigo-50" },
              "Thời trang": { emoji: "👕", gradient: "from-pink-50 to-rose-50" },
              "Nhà cửa": { emoji: "🏠", gradient: "from-amber-50 to-orange-50" },
              "Thể thao": { emoji: "⚽", gradient: "from-emerald-50 to-green-50" },
              "Làm đẹp": { emoji: "💄", gradient: "from-violet-50 to-purple-50" },
              "Sách": { emoji: "📚", gradient: "from-cyan-50 to-sky-50" },
            };
            const style = categoryStyles[cat.name] || { emoji: "📦", gradient: "from-gray-50 to-slate-50" };

            return (
              <motion.button
                key={i}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate("shop", { category: cat.name })}
                className={`group relative bg-gradient-to-br ${style.gradient} border border-gray-200/80 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300`}
              >
                <div className="text-4xl mb-3">{style.emoji}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{cat.productCount} sản phẩm</p>
              </motion.button>
            );
          })}
        </motion.div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Sản phẩm nổi bật</h2>
              <p className="text-gray-500">Sản phẩm được tuyển chọn dành cho bạn</p>
            </div>
            <Button variant="ghost" onClick={() => onNavigate("shop")} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 hidden sm:flex">
              Xem tất cả
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featuredProducts.slice(0, 4).map((product) => (
              <motion.div key={product.id} variants={staggerItem}>
                <ProductCard
                  product={product}
                  onView={handleViewFeatured}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={onAddToWishlist}
                  isInWishlist={isInWishlist?.(product.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Promotional Banner ── */}
      {promotions.length > 0 && (
        <section className="py-20 container mx-auto px-4">
          <div className="space-y-6">
            {promotions.map((promo) => {
              const discountLabel = promo.type === "PERCENTAGE"
                ? `${promo.value}%`
                : `${formatCurrency(Number(promo.value))}`;
              const title = promo.name || `Giảm ${discountLabel}`;
              const desc = promo.description || `Sử dụng mã ${promo.code} để được giảm ${discountLabel}. Đừng bỏ lỡ ưu đãi hấp dẫn này!`;
              const hasExpiry = !!promo.validUntil;
              return (
                <motion.div
                  key={promo.id}
                  variants={sectionReveal}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-12 md:p-16"
                >
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-blue-400/15 blur-2xl" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNMzYgMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMjRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTEyIDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
                  </div>

                  <div className="relative z-10 max-w-2xl">
                    <Badge className="mb-4 bg-white/15 text-white border-white/20 backdrop-blur-sm">
                      {hasExpiry ? `Hết hạn ${new Date(promo.validUntil!).toLocaleDateString("vi-VN")}` : "Ưu đãi đặc biệt"}
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">{title}</h2>
                    <p className="text-lg text-white/80 mb-4 leading-relaxed">{desc}</p>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-5 py-2.5 border border-white/20">
                        <Tag className="h-4 w-4 text-white" />
                        <span className="text-white font-mono font-bold tracking-widest">{promo.code}</span>
                      </div>
                      {promo.minOrderAmount && (
                        <span className="text-white/60 text-sm">Đơn tối thiểu {formatCurrency(Number(promo.minOrderAmount))}</span>
                      )}
                    </div>
                    <Button
                      size="lg"
                      onClick={() => onNavigate("shop")}
                      className="bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Mua ngay
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
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

      {/* ── Trending Products ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Xu hướng hiện tại</h2>
              <p className="text-gray-500">Sản phẩm phổ biến nhất tuần này</p>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {trendingProducts.slice(0, 4).map((product) => (
              <motion.div key={product.id} variants={staggerItem}>
                <ProductCard
                  product={product}
                  onView={handleViewTrending}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={onAddToWishlist}
                  isInWishlist={isInWishlist?.(product.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Promo Popup ── */}
      <AnimatePresence>
        {showPromoPopup && promotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowPromoPopup(false);
              localStorage.setItem("promo_popup_dismissed", new Date().toDateString());
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl shadow-black/20"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowPromoPopup(false);
                  localStorage.setItem("promo_popup_dismissed", new Date().toDateString());
                }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200/60 mb-4">
                  <Tag className="h-7 w-7 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Ưu đãi hôm nay</h2>
                <p className="text-gray-500 text-sm">Đừng bỏ lỡ các mã giảm giá đặc biệt</p>
              </div>

              <div className="space-y-3 mb-6">
                {promotions.map((promo) => {
                  const discountLabel = promo.type === "PERCENTAGE"
                    ? `Giảm ${promo.value}%`
                    : `Giảm ${formatCurrency(Number(promo.value))}`;
                  return (
                    <div key={promo.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-colors duration-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-900 font-mono font-bold tracking-widest text-lg">{promo.code}</span>
                        <Badge className="bg-amber-100 text-amber-700 border-0">{discountLabel}</Badge>
                      </div>
                      {(promo.name || promo.description) && (
                        <p className="text-gray-500 text-sm">{promo.description || promo.name}</p>
                      )}
                      {promo.minOrderAmount && (
                        <p className="text-gray-400 text-xs mt-1">Đơn tối thiểu {formatCurrency(Number(promo.minOrderAmount))}</p>
                      )}
                      {promo.validUntil && (
                        <p className="text-gray-400 text-xs mt-0.5">Hết hạn {new Date(promo.validUntil).toLocaleDateString("vi-VN")}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                className="w-full bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl"
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
