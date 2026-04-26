import React, { useState, useEffect, useCallback } from 'react';
import { blogService } from '../../services/blog.service';
import type { Blog, BlogCategory } from '../../types/blog';
import { Search, Clock, Eye, BookOpen, ChevronRight, Tag } from 'lucide-react';

interface BlogPageProps {
  onNavigate: (page: string, data?: any) => void;
}

function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-5">
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-5 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
}

function BlogCard({ blog, onClick }: { blog: Blog; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:-translate-y-1"
      aria-label={`Read blog: ${blog.title}`}
    >
      {/* Thumbnail */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
        {blog.thumbnail ? (
          <img
            src={blog.thumbnail}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={48} className="text-blue-300" />
          </div>
        )}
        {/* Category chip */}
        <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
          {blog.category.name}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-gray-900 font-semibold text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
          {blog.title}
        </h3>
        {blog.summary && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
            {blog.summary}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {blog.author?.avatar ? (
                <img src={blog.author.avatar} alt={blog.author.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-blue-600 font-semibold text-xs">
                  {blog.author?.name?.charAt(0) ?? 'A'}
                </span>
              )}
            </div>
            <span className="font-medium text-gray-600">{blog.author?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {blog.readTime}m
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {blog.views.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogService.getPublished({
        page,
        limit: 9,
        search: search || undefined,
        category: activeCategory || undefined,
      });
      setBlogs(res.blogs);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeCategory]);

  useEffect(() => {
    blogService.getCategories().then(setCategories).catch(() => { });
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-20 px-4">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
            <BookOpen size={16} />
            Blog & Insights
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Khám phá Kiến thức &<br />Tin tức Mua sắm
          </h1>
          <p className="text-blue-100/80 text-lg mb-8">
            Bài viết từ các Seller uy tín và đội ngũ ShopHub
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
            <div className="flex">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Tìm kiếm bài viết..."
                className="flex-1 pl-12 pr-4 py-3.5 rounded-l-xl bg-white/95 backdrop-blur-sm border-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="px-5 bg-white rounded-r-xl text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </form>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleCategoryChange('')}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${!activeCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <Tag size={14} />
              Tất cả
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {cat.name}
                {cat.blogCount !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.slug ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>
                    {cat.blogCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Blog Grid ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {/* Stats */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-6">
            {total > 0 ? `${total} bài viết${search ? ` cho "${search}"` : ''}` : 'Không tìm thấy bài viết nào'}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <BookOpen size={32} className="text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Chưa có bài viết</h2>
            <p className="text-gray-500">Hãy thử tìm kiếm với từ khóa khác hoặc xem các danh mục khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map(blog => (
              <BlogCard
                key={blog.id}
                blog={blog}
                onClick={() => onNavigate('blog-post', { slug: blog.slug })}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Tiếp <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
// Suppress unused var warning for statusBadge kept for extension
let _: any;
