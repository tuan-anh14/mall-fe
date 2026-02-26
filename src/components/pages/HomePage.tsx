import { useState, useEffect } from "react";
import { ArrowRight, Zap, Shield, Truck, Headphones } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ProductCard } from "../ProductCard";
import { motion, AnimatePresence } from "motion/react";
import { products, categories } from "../../lib/mock-data";

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
  onAddToCart?: (product: any) => void;
  onAddToWishlist?: (product: any) => void;
  isInWishlist?: (productId: number) => boolean;
}

export function HomePage({ onNavigate, onAddToCart, onAddToWishlist, isInWishlist }: HomePageProps) {
  const featuredProducts = products.filter((p) => p.featured);
  const trendingProducts = products.filter((p) => p.trending);
  
  // Auto-rotate featured product every 10 seconds
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const featuredProductsForHero = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prevIndex) => 
        (prevIndex + 1) % featuredProductsForHero.length
      );
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [featuredProductsForHero.length]);

  const currentProduct = featuredProductsForHero[currentFeaturedIndex];

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
                New Arrival
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-white mb-6">
                Premium Products
                <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Exceptional Quality
                </span>
              </h1>
              <p className="text-xl text-white/70 mb-8 max-w-lg">
                Discover our curated collection of premium electronics, fashion, and home essentials. Limited time offers up to 50% off!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => onNavigate("shop")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => onNavigate("about")}>
                  Learn More
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-8">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentFeaturedIndex}
                    src={currentProduct.image}
                    alt="Featured Product"
                    className="w-full h-[500px] object-cover rounded-2xl"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
                <div className="absolute bottom-12 left-12 right-12 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-purple-400">Featured Product</p>
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
                        <span className="text-3xl text-white">${currentProduct.price}</span>
                        <Button
                          onClick={() => onNavigate("product", currentProduct)}
                          className="bg-gradient-to-r from-purple-600 to-blue-600"
                        >
                          View Details
                        </Button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-y border-white/10 bg-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
              { icon: Shield, title: "Secure Payment", desc: "100% protected" },
              { icon: Zap, title: "Fast Delivery", desc: "2-3 business days" },
              { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
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
            <h2 className="text-3xl text-white mb-2">Shop by Category</h2>
            <p className="text-white/60">Explore our wide range of products</p>
          </div>
          <Button variant="ghost" onClick={() => onNavigate("shop")}>
            View All
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
                {cat.name === "Electronics" && "💻"}
                {cat.name === "Fashion" && "👕"}
                {cat.name === "Home" && "🏠"}
                {cat.name === "Sports" && "⚽"}
                {cat.name === "Beauty" && "💄"}
                {cat.name === "Books" && "📚"}
              </div>
              <h3 className="text-white group-hover:text-purple-400 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-white/50 mt-1">{cat.count} items</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl text-white mb-2">Featured Products</h2>
            <p className="text-white/60">Hand-picked items just for you</p>
          </div>
          <Button variant="ghost" onClick={() => onNavigate("shop")}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={(id) => onNavigate("product", products.find((p) => p.id === id))}
              onAddToCart={(prod) => onAddToCart?.(prod, 1)}
              onAddToWishlist={onAddToWishlist}
              isInWishlist={isInWishlist?.(product.id)}
            />
          ))}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-16 container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 p-12">
          <div className="relative z-10 max-w-2xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Limited Time Offer
            </Badge>
            <h2 className="text-4xl text-white mb-4">Black Friday Sale</h2>
            <p className="text-xl text-white/90 mb-6">
              Get up to 50% off on selected items. Don't miss out on this amazing opportunity!
            </p>
            <Button
              size="lg"
              onClick={() => onNavigate("shop")}
              className="bg-white text-purple-600 hover:bg-white/90"
            >
              Shop Sale
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNMzYgMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMjRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTEyIDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] " />
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl text-white mb-2">Trending Now</h2>
            <p className="text-white/60">Most popular items this week</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={(id) => onNavigate("product", products.find((p) => p.id === id))}
              onAddToCart={(prod) => onAddToCart?.(prod, 1)}
              onAddToWishlist={onAddToWishlist}
              isInWishlist={isInWishlist?.(product.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
