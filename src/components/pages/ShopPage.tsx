import { useState } from "react";
import { Grid, List, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { ProductCard } from "../ProductCard";
import { Slider } from "../ui/slider";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { products, categories } from "../../lib/mock-data";
import { Badge } from "../ui/badge";

interface ShopPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialCategory?: string;
  onAddToCart?: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  isInWishlist?: (productId: number) => boolean;
}

export function ShopPage({ onNavigate, initialCategory, onAddToCart, onAddToWishlist, isInWishlist }: ShopPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popularity");

  const brands = Array.from(new Set(products.map((p) => p.brand)));

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const filteredProducts = products.filter((product) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return b.id - a.id;
      default:
        return b.reviews - a.reviews;
    }
  });

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-white mb-4">Categories</h3>
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
                className="text-sm text-white/70 cursor-pointer"
              >
                {cat.name} ({cat.count})
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-white mb-4">Price Range</h3>
        <Slider
          min={0}
          max={3000}
          step={50}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="text-white mb-4">Brands</h3>
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
                className="text-sm text-white/70 cursor-pointer"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-white mb-4">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2].map((rating) => (
            <button
              key={rating}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <span>{"⭐".repeat(rating)}</span>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSelectedCategories([]);
          setSelectedBrands([]);
          setPriceRange([0, 3000]);
        }}
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl text-white mb-2">All Products</h1>
          <p className="text-white/60">
            Showing {sortedProducts.length} of {products.length} products
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10">
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-lg p-1">
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
            <SheetContent side="left" className="bg-zinc-950 border-white/10 w-80">
              <SheetHeader>
                <SheetTitle className="text-white">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-6">
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
        </div>
      )}

      {/* Content Grid */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Desktop Filters */}
        <aside className="hidden md:block">
          <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl text-white mb-6 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </h2>
            <FiltersContent />
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-white/60">No products found</p>
              <Button
                className="mt-4"
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedBrands([]);
                  setPriceRange([0, 3000]);
                }}
              >
                Clear Filters
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
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={(id) =>
                    onNavigate("product", products.find((p) => p.id === id))
                  }
                  onAddToCart={(prod) => onAddToCart?.(prod, 1)}
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
