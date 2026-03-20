import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Grid, List, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { ProductCard } from "../ProductCard";
import { Slider } from "../ui/slider";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Badge } from "../ui/badge";
import { get } from "../../lib/api";
import { formatCurrency } from "../../lib/currency";

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
}: FiltersContentProps) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-foreground mb-4">Danh mục</h3>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${cat.name}`}
                checked={selectedCategories.includes(cat.name)}
                onCheckedChange={() => toggleCategory(cat.name)}
              />
              <Label
                htmlFor={`cat-${cat.name}`}
                className="text-sm text-muted-foreground cursor-pointer"
              >
                {cat.name} ({cat.productCount})
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-foreground mb-4">Khoảng giá</h3>
        <Slider
          min={0}
          max={3000}
          step={50}
          value={priceRange}
          onValueChange={handlePriceRangeChange}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatCurrency(priceRange[0])}</span>
          <span>{formatCurrency(priceRange[1])}</span>
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="text-foreground mb-4">Thương hiệu</h3>
        <div className="space-y-3">
          {brands.slice(0, 8).map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <Label
                htmlFor={`brand-${brand}`}
                className="text-sm text-muted-foreground cursor-pointer"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-foreground mb-4">Đánh giá</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2].map((rating) => (
            <button
              key={rating}
              onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
              className={`flex items-center gap-2 text-sm w-full px-2 py-1 rounded-lg transition-colors ${
                selectedRating === rating
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "text-muted-foreground hover:text-white hover:bg-foreground/5"
              }`}
            >
              <span>{"⭐".repeat(rating)}</span>
              <span>trở lên</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" className="w-full" onClick={clearFilters}>
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

export function ShopPage({ onNavigate, initialCategory, initialSearch, onAddToCart, onAddToWishlist, isInWishlist }: ShopPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popularity");
  const [searchQuery, setSearchQuery] = useState(initialSearch ?? "");

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
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
  const priceRangeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 3000]);

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
    if (priceRangeDebounceRef.current) clearTimeout(priceRangeDebounceRef.current);
    priceRangeDebounceRef.current = setTimeout(() => {
      setDebouncedPriceRange(value);
    }, 500);
  };

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await get<{ categories: any[] }>("/api/v1/categories");
        setCategories(res.categories ?? []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", "12");
        params.set("page", "1");

        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }
        if (selectedCategories.length === 1) {
          params.set("category", selectedCategories[0]);
        }
        if (selectedBrands.length === 1) {
          params.set("brand", selectedBrands[0]);
        }
        if (debouncedPriceRange[0] > 0) {
          params.set("minPrice", String(debouncedPriceRange[0]));
        }
        if (debouncedPriceRange[1] < 3000) {
          params.set("maxPrice", String(debouncedPriceRange[1]));
        }
        if (selectedRating !== null) {
          params.set("rating", String(selectedRating));
        }
        if (sortBy && SORT_MAP[sortBy]) {
          params.set("sort", SORT_MAP[sortBy]);
        }

        const res = await get<{ products: any[]; total: number; page: number; limit: number; totalPages: number }>(
          `/api/v1/products?${params.toString()}`
        );

        const fetched = res.products ?? [];
        setProducts(fetched);
        setTotal(res.total ?? 0);

        // Derive brands from fetched products
        const uniqueBrands = Array.from(new Set(fetched.map((p: any) => p.brand).filter(Boolean))) as string[];
        setBrands((prev) => {
          // Merge with previously known brands so filter options don't disappear
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
  }, [selectedCategories, selectedBrands, selectedRating, debouncedPriceRange, sortBy, searchQuery]);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const toggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedRating(null);
    setPriceRange([0, 3000]);
    setDebouncedPriceRange([0, 3000]);
    setSearchQuery("");
  }, []);

  const handleViewProduct = useCallback((id: string | number) => {
    onNavigate("product", products.find((p) => p.id === id));
  }, [products, onNavigate]);

  const handleAddToCart = useCallback((prod: any) => {
    onAddToCart?.(prod, 1);
  }, [onAddToCart]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl text-foreground mb-2">Tất cả sản phẩm</h1>
          <p className="text-muted-foreground">
            {loading ? "Đang tải sản phẩm..." : `Hiển thị ${products.length} trên ${total} sản phẩm`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-foreground/5 border-border">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="popularity">Phổ biến nhất</SelectItem>
              <SelectItem value="price-low">Giá: Thấp đến Cao</SelectItem>
              <SelectItem value="price-high">Giá: Cao đến Thấp</SelectItem>
              <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
              <SelectItem value="newest">Mới nhất</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="hidden md:flex items-center gap-1 bg-foreground/5 rounded-lg p-1">
            <Button
              size="icon"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className="h-8 w-8"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className="h-8 w-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Filters */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-card border-border w-80">
              <SheetHeader>
                <SheetTitle className="text-foreground">Bộ lọc</SheetTitle>
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
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedRating !== null || searchQuery) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {searchQuery && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setSearchQuery("")}
            >
              🔍 "{searchQuery}" ×
            </Badge>
          )}
          {selectedCategories.map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleCategory(cat)}
            >
              {cat} ×
            </Badge>
          ))}
          {selectedBrands.map((brand) => (
            <Badge
              key={brand}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleBrand(brand)}
            >
              {brand} ×
            </Badge>
          ))}
          {selectedRating !== null && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setSelectedRating(null)}
            >
              {"⭐".repeat(selectedRating)} trở lên ×
            </Badge>
          )}
        </div>
      )}

      {/* Content Grid */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Desktop Filters */}
        <aside className="hidden md:block">
          <div className="sticky top-24 bg-foreground/5 border border-border rounded-2xl p-6">
            <h2 className="text-xl text-foreground mb-6 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
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
            />
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                <p className="text-muted-foreground text-sm">Đang tải sản phẩm...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">Không tìm thấy sản phẩm</p>
              <Button className="mt-4" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              }
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={handleViewProduct}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={onAddToWishlist}
                  isInWishlist={isInWishlist?.(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
