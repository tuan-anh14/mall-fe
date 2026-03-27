// ─── Blog ────────────────────────────────────────────────────────────────────

export type BlogStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';

export interface BlogAuthor {
  id: string;
  name: string;
  avatar: string | null;
  userType: 'BUYER' | 'SELLER' | 'ADMIN';
  storeName: string | null;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  blogCount?: number;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  thumbnail: string | null;
  status: BlogStatus;
  views: number;
  readTime: number;
  adminNote: string | null;
  author: BlogAuthor | null;
  category: BlogCategory;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListResponse {
  blogs: Blog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogDetailResponse {
  blog: Blog;
  related: Blog[];
}
