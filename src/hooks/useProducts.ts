import { useQuery } from "@tanstack/react-query";
import { productService, ProductFilters } from "../services/product.service";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  featured: () => [...productKeys.all, "featured"] as const,
  trending: () => [...productKeys.all, "trending"] as const,
  detail: (id: string | number) => [...productKeys.all, "detail", id] as const,
};

export function useProductList(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productService.getAll(filters),
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: productService.getFeatured,
    staleTime: 1000 * 60 * 10, // 10 phút — data ít thay đổi
  });
}

export function useTrendingProducts() {
  return useQuery({
    queryKey: productKeys.trending(),
    queryFn: productService.getTrending,
    staleTime: 1000 * 60 * 10,
  });
}

export function useProductDetail(id: string | number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
}
