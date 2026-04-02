import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Grid, List, SlidersHorizontal, Search, Package, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { ProductCard } from "../ProductCard";
import { Slider } from "../ui/slider";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Badge } from "../ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { get } from "../../lib/api";
import { formatCurrency } from "../../lib/currency";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease },
  },
};

interface FiltersContentProps {
  categories: any[];
  selectedCategories: string[];
  toggleCategory: (cat: string) => void;
  priceRange: number[];
  handlePriceRangeChange: (value: number[]) => void;
  brands: string[];
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  selectedRating: number | null;
  setSelectedRating: React.Dispatch<React.SetStateAction<number | null>>;
  clearFilters: () => void;
  maxPriceLimit: number;
}

const FiltersContent = memo(function FiltersContent({
  categories,
  selectedCategories,
  toggleCategory,
  priceRange,
  handlePriceRangeChange,
  brands,
  selectedBrands,
  toggleBrand,
  selectedRating,
  setSelectedRating,
  clearFilters,
  maxPriceLimit,
}: FiltersContentProps) {
  return (
    <div className="space-y-7">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Danh mục</h3>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center space-x-2.5 group">
              <Checkbox
                id={`cat-${cat.name}`}
                checked={selectedCategories.includes(cat.name)}
                onCheckedChange={() => toggleCategory(cat.name)}
              />
              <Label
                htmlFor={`cat-${cat.name}`}
                className="text-sm text-gray-600 cursor-pointer group-hover:text-gray-900 transition-colors duration-200 flex items-center justify-between w-full"
              >
                <span>{cat.name}</span>
                <span className="text-xs text-gray-400">{cat.productCount}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Khoảng giá</h3>
        <Slider
          min={0}
          max={maxPriceLimit}
          step={Math.ceil(maxPriceLimit / 100)}
          value={priceRange}
          onValueChange={handlePriceRangeChange}
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">{formatCurrency(priceRange[0])}</span>
          <span className="text-xs text-gray-400">—</span>
          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">{formatCurrency(priceRange[1])}</span>
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Thương hiệu</h3>
          <div className="space-y-2.5">
            {brands.slice(0, 8).map((brand) => (
              <div key={brand} className="flex items-center space-x-2.5 group">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => toggleBrand(brand)}
                />
                <Label
                  htmlFor={`brand-${brand}`}
                  className="text-sm text-gray-600 cursor-pointer group-hover:text-gray-900 transition-colors duration-200"
                >
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Đánh giá</h3>
        <div className="space-y-1.5">
          {[5, 4, 3, 2].map((rating) => (
            <button
              key={rating}
              onClick={() =>
                setSelectedRating(selectedRating === rating ? null : rating)
              }
              className={`flex items-center gap-2 text-sm w-full px-3 py-2 rounded-xl transition-all duration-200 ${
                selectedRating === rating
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
              }`}
            >
              <span className="text-xs">{"⭐".repeat(rating)}</span>
              <span>trở lên</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" className="w-full border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200" onClick={clearFilters}>
        Xóa tất cả bộ lọc
      </Button>
    </div>
  );
});

interface ShopPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialCategory?: string;
  initialSearch?: string;
  onAddToCart?: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  isInWishlist?: (productId: number) => boolean;
}

const SORT_MAP: Record<string, string> = {
  popularity: "popular",
  "price-low": "price_asc",
  "price-high": "price_desc",
  rating: "rating",
  newest: "newest",
};

export function ShopPage({
  onNavigate,
  initialCategory,
  initialSearch,
  onAddToCart,
  onAddToWishlist,
  isInWishlist,
}: ShopPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [maxPriceLimit, setMaxPriceLimit] = useState(3000);
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : [],
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popularity");
  const [searchQuery, setSearchQuery] = useState(initialSearch ?? "");

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // Sync search query when header search navigates to shop page
  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  // Debounce price range to avoid firing on every slider tick
  const priceRangeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 3000]);

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
    if (priceRangeDebounceRef.current)
      clearTimeout(priceRangeDebounceRef.current);
    priceRangeDebounceRef.current = setTimeout(() => {
      setDebouncedPriceRange(value);
    }, 500);
  };

  // Sync price range when maxPriceLimit changes for the first time or if it's at max
  useEffect(() => {
    if (priceRange[1] === 3000 && maxPriceLimit !== 3000) {
      setPriceRange([priceRange[0], maxPriceLimit]);
      setDebouncedPriceRange([priceRange[0], maxPriceLimit]);
    }
  }, [maxPriceLimit]);

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await get<{ categories: any[] } | any[]>("/api/v1/categories");
        const rawCats = res as any;
        setCategories(Array.isArray(rawCats) ? rawCats : (rawCats.categories ?? []));
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Reset to page 1 when filters change (not when page itself changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedBrands, selectedRating, debouncedPriceRange, sortBy, searchQuery]);

  // Fetch products whenever filters or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", "12");
        params.set("page", String(currentPage));

        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }
        if (selectedCategories.length > 0) {
          params.set("category", selectedCategories.join(","));
        }
        if (selectedBrands.length > 0) {
          params.set("brand", selectedBrands.join(","));
        }
        if (debouncedPriceRange[0] > 0) {
          params.set("minPrice", String(debouncedPriceRange[0]));
        }
        if (debouncedPriceRange[1] < maxPriceLimit) {
          params.set("maxPrice", String(debouncedPriceRange[1]));
        }
        if (selectedRating !== null) {
          params.set("rating", String(selectedRating));
        }
        params.set("sort", SORT_MAP[sortBy] ?? "popular");

        const res = await get<{
          products: any[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          maxPrice?: number;
        }>(`/api/v1/products?${params.toString()}`);

        const fetched = res.products ?? [];
        setProducts(fetched);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 1);
        if (res.maxPrice && res.maxPrice !== maxPriceLimit) {
          setMaxPriceLimit(res.maxPrice);
        }

        // Derive brands from fetched products
        const uniqueBrands = Array.from(
          new Set(fetched.map((p: any) => p.brand).filter(Boolean)),
        ) as string[];
        setBrands((prev) => {
          const merged = Array.from(new Set([...prev, ...uniqueBrands]));
          return merged;
        });
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    selectedCategories,
    selectedBrands,
    selectedRating,
    debouncedPriceRange,
    sortBy,
    searchQuery,
    currentPage,
  ]);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  }, []);

  const toggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedRating(null);
    setPriceRange([0, maxPriceLimit]);
    setDebouncedPriceRange([0, maxPriceLimit]);
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const handleViewProduct = useCallback(
    (id: string | number) => {
      onNavigate(
        "product",
        products.find((p) => p.id === id),
      );
    },
    [products, onNavigate],
  );

  const handleAddToCart = useCallback(
    (prod: any) => {
      onAddToCart?.(prod);
    },
    [onAddToCart],
  );

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || selectedRating !== null || searchQuery;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Tất cả sản phẩm</h1>
              <p className="text-gray-500">
                {loading
                  ? "Đang tải sản phẩm..."
                  : `Hiển thị ${products.length} trên ${total} sản phẩm`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200 rounded-xl h-10 shadow-sm">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-xl shadow-lg">
                  <SelectItem value="popularity">Phổ biến nhất</SelectItem>
                  <SelectItem value="price-low">Giá: Thấp đến Cao</SelectItem>
                  <SelectItem value="price-high">Giá: Cao đến Thấp</SelectItem>
                  <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
                <Button
                  size="icon"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  onClick={() => setViewMode("grid")}
                  className={`h-8 w-8 rounded-lg transition-all duration-200 ${viewMode === "grid" ? "shadow-sm" : "hover:bg-gray-200"}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  onClick={() => setViewMode("list")}
                  className={`h-8 w-8 rounded-lg transition-all duration-200 ${viewMode === "list" ? "shadow-sm" : "hover:bg-gray-200"}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 shadow-sm border-gray-200">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="bg-white border-gray-200 w-80"
                >
                  <SheetHeader>
                    <SheetTitle className="text-gray-900">Bộ lọc</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent
                      categories={categories}
                      selectedCategories={selectedCategories}
                      toggleCategory={toggleCategory}
                      priceRange={priceRange}
                      handlePriceRangeChange={handlePriceRangeChange}
                      brands={brands}
                      selectedBrands={selectedBrands}
                      toggleBrand={toggleBrand}
                      selectedRating={selectedRating}
                      setSelectedRating={setSelectedRating}
                      clearFilters={clearFilters}
                      maxPriceLimit={maxPriceLimit}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* ── Active Filters ── */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-gray-500 mr-1">Bộ lọc:</span>
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors duration-200 rounded-lg px-3 py-1 gap-1.5"
                    onClick={() => setSearchQuery("")}
                  >
                    <Search className="h-3 w-3" />
                    "{searchQuery}"
                    <X className="h-3 w-3 ml-0.5" />
                  </Badge>
                )}
                {selectedCategories.map((cat) => (
                  <Badge
                    key={cat}
                    variant="secondary"
                    className="cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors duration-200 rounded-lg px-3 py-1 gap-1.5"
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                    <X className="h-3 w-3 ml-0.5" />
                  </Badge>
                ))}
                {selectedBrands.map((brand) => (
                  <Badge
                    key={brand}
                    variant="secondary"
                    className="cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors duration-200 rounded-lg px-3 py-1 gap-1.5"
                    onClick={() => toggleBrand(brand)}
                  >
                    {brand}
                    <X className="h-3 w-3 ml-0.5" />
                  </Badge>
                ))}
                {selectedRating !== null && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors duration-200 rounded-lg px-3 py-1 gap-1.5"
                    onClick={() => setSelectedRating(null)}
                  >
                    {"⭐".repeat(selectedRating)} trở lên
                    <X className="h-3 w-3 ml-0.5" />
                  </Badge>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors duration-200 ml-2 underline underline-offset-2"
                >
                  Xóa tất cả
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Content Grid ── */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Desktop Filters */}
          <aside className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="sticky top-24"
            >
              <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2.5 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                  </div>
                  Bộ lọc
                </h2>
                <FiltersContent
                  categories={categories}
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  priceRange={priceRange}
                  handlePriceRangeChange={handlePriceRangeChange}
                  brands={brands}
                  selectedBrands={selectedBrands}
                  toggleBrand={toggleBrand}
                  selectedRating={selectedRating}
                  setSelectedRating={setSelectedRating}
                  clearFilters={clearFilters}
                  maxPriceLimit={maxPriceLimit}
                />
              </div>
            </motion.div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-[3px] border-blue-100" />
                    <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 animate-spin" />
                  </div>
                  <p className="text-gray-400 text-sm">Đang tải sản phẩm...</p>
                </motion.div>
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="text-center py-24"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-100 mb-6">
                  <Package className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy sản phẩm</p>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm sản phẩm</p>
                <Button onClick={clearFilters} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5">
                  Xóa bộ lọc
                </Button>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                key={`${sortBy}-${selectedCategories.join()}-${selectedBrands.join()}-${selectedRating}-${searchQuery}-${debouncedPriceRange.join()}`}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    : "space-y-4"
                }
              >
                {products.map((product) => (
                  <motion.div key={product.id} variants={staggerItem}>
                    <ProductCard
                      product={product}
                      onView={handleViewProduct}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={onAddToWishlist}
                      isInWishlist={isInWishlist?.(product.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="h-9 w-9 p-0 rounded-xl border-gray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "…" ? (
                      <span key={`ellipsis-${idx}`} className="text-gray-400 text-sm px-1">…</span>
                    ) : (
                      <Button
                        key={item}
                        variant={currentPage === item ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(item as number)}
                        className={`h-9 w-9 p-0 rounded-xl text-sm font-medium transition-all duration-200 ${
                          currentPage === item
                            ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </Button>
                    )
                  )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="h-9 w-9 p-0 rounded-xl border-gray-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
