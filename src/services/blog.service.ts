import { get, post, put, patch, del } from '../lib/api';
import type {
  BlogListResponse,
  BlogDetailResponse,
  BlogCategory,
} from '../types/blog';

const BASE = '/api/v1';

export interface BlogFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
}

function buildQs(filters: BlogFilters) {
  const p = new URLSearchParams();
  if (filters.category) p.set('category', filters.category);
  if (filters.search) p.set('search', filters.search);
  if (filters.page) p.set('page', String(filters.page));
  if (filters.limit) p.set('limit', String(filters.limit));
  if (filters.status) p.set('status', filters.status);
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

export const blogService = {
  // ── Public ──────────────────────────────────────────────
  getPublished(filters: BlogFilters = {}): Promise<BlogListResponse> {
    return get<BlogListResponse>(`${BASE}/blogs${buildQs(filters)}`);
  },

  getBySlug(slug: string): Promise<BlogDetailResponse> {
    return get<BlogDetailResponse>(`${BASE}/blogs/${slug}`);
  },

  getCategories(): Promise<BlogCategory[]> {
    return get<BlogCategory[]>(`${BASE}/blog-categories`);
  },

  // ── Author ───────────────────────────────────────────────
  getMyBlogs(filters: BlogFilters = {}): Promise<BlogListResponse> {
    return get<BlogListResponse>(`${BASE}/my-blogs${buildQs(filters)}`);
  },

  create(data: Record<string, unknown>): Promise<{ blog: import('../types/blog').Blog }> {
    return post<{ blog: import('../types/blog').Blog }>(`${BASE}/blogs`, data);
  },

  update(id: string, data: Record<string, unknown>): Promise<{ blog: import('../types/blog').Blog }> {
    return put<{ blog: import('../types/blog').Blog }>(`${BASE}/blogs/${id}`, data);
  },

  delete(id: string): Promise<{ message: string }> {
    return del<{ message: string }>(`${BASE}/blogs/${id}`);
  },

  // ── Admin ────────────────────────────────────────────────
  adminGetAll(filters: BlogFilters = {}): Promise<BlogListResponse> {
    return get<BlogListResponse>(`${BASE}/admin/blogs${buildQs(filters)}`);
  },

  adminUpdate(id: string, data: Record<string, unknown>): Promise<{ blog: import('../types/blog').Blog }> {
    return put<{ blog: import('../types/blog').Blog }>(`${BASE}/admin/blogs/${id}`, data);
  },

  adminDelete(id: string): Promise<{ message: string }> {
    return del<{ message: string }>(`${BASE}/admin/blogs/${id}`);
  },

  approve(id: string): Promise<{ blog: import('../types/blog').Blog }> {
    return patch<{ blog: import('../types/blog').Blog }>(`${BASE}/admin/blogs/${id}/approve`, {});
  },

  reject(id: string, reason: string): Promise<{ blog: import('../types/blog').Blog }> {
    return patch<{ blog: import('../types/blog').Blog }>(`${BASE}/admin/blogs/${id}/reject`, { reason });
  },

  // ── Categories (admin write) ─────────────────────────────
  createCategory(name: string): Promise<BlogCategory> {
    return post<BlogCategory>(`${BASE}/blog-categories`, { name });
  },

  deleteCategory(id: string): Promise<{ message: string }> {
    return del<{ message: string }>(`${BASE}/blog-categories/${id}`);
  },

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return post<{ url: string }>(`${BASE}/upload/blog`, formData);
  },
};
