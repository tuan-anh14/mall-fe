import { get } from "../lib/api";

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productService = {
  getAll(filters: ProductFilters = {}): Promise<{ products: any[]; total?: number }> {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.search) params.set("search", filters.search);
    if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return get<{ products: any[]; total?: number }>(`/api/v1/products${qs ? `?${qs}` : ""}`);
  },

  getById(id: string | number): Promise<{ product: any }> {
    return get<{ product: any }>(`/api/v1/products/${id}`);
  },

  getFeatured(): Promise<{ products: any[] }> {
    return get<{ products: any[] }>("/api/v1/products?featured=true&limit=8");
  },

  getTrending(): Promise<{ products: any[] }> {
    return get<{ products: any[] }>("/api/v1/products?trending=true&limit=8");
  },
};
