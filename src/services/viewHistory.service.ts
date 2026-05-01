import { get, post, del } from "../lib/api";

export interface ViewHistoryItem {
  id: string;
  productId: string;
  viewCount: number;
  lastViewedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number | null;
    discount?: number | null;
    stock: number;
    status: string;
    badge?: string | null;
    ratingAverage: number;
    rating: number;
    reviewCount: number;
    reviews: number;
    category?: string | null;
    categoryId?: string;
    brand?: string | null;
    image?: string | null;
    images: string[];
    seller?: {
      id: string;
      storeName: string;
      storeSlug: string;
      userId: string;
    } | null;
  };
}

export interface ViewHistoryResponse {
  items: ViewHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RecommendationsResponse {
  products: any[];
  source: "ai" | "builtin";
  isPersonalized: boolean;
}

export const viewHistoryService = {
  trackView(productId: string): Promise<{ success: boolean }> {
    return post<{ success: boolean }>("/api/v1/view-history/track", { productId });
  },

  getHistory(page = 1, limit = 20): Promise<ViewHistoryResponse> {
    return get<ViewHistoryResponse>(`/api/v1/view-history?page=${page}&limit=${limit}`);
  },

  removeFromHistory(productId: string): Promise<{ success: boolean }> {
    return del<{ success: boolean }>(`/api/v1/view-history/${productId}`);
  },

  clearHistory(): Promise<{ success: boolean }> {
    return del<{ success: boolean }>("/api/v1/view-history");
  },

  getRecommendations(limit = 12): Promise<RecommendationsResponse> {
    return get<RecommendationsResponse>(`/api/v1/recommendations?limit=${limit}`);
  },

  getSimilarProducts(productId: string, limit = 8): Promise<RecommendationsResponse> {
    return get<RecommendationsResponse>(`/api/v1/recommendations/similar/${productId}?limit=${limit}`);
  },
};
