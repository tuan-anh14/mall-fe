import React, { useState, useEffect } from 'react';
import { blogService } from '../../services/blog.service';
import type { Blog } from '../../types/blog';
import {
  ArrowLeft,
  Clock,
  Eye,
  Calendar,
  Tag,
  Share2,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

interface BlogPostPageProps {
  slug: string;
  onNavigate: (page: string, data?: any) => void;
}

function RelatedCard({ blog, onClick }: { blog: Blog; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group flex gap-4 cursor-pointer hover:bg-gray-50 rounded-xl p-3 transition-colors"
    >
      <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-50 to-purple-100">
        {blog.thumbnail ? (
          <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={20} className="text-indigo-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
          {blog.title}
        </p>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <Clock size={10} /> {blog.readTime}m đọc
        </p>
      </div>
    </div>
  );
}

export function BlogPostPage({ slug, onNavigate }: BlogPostPageProps) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [related, setRelated] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    blogService
      .getBySlug(slug)
      .then(res => {
        setBlog(res.blog);
        setRelated(res.related ?? []);
      })
      .catch(() => setError('Không tìm thấy bài viết.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = async () => {
    try {
      await navigator.share({ title: blog?.title, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">{error || 'Bài viết không tồn tại.'}</p>
        <button
          onClick={() => onNavigate('blog')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft size={16} /> Quay về Blog
        </button>
      </div>
    );
  }

  const publishedDate = new Date(blog.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Cover Image ──────────────────────────────────────────────────── */}
      {blog.thumbnail && (
        <div className="relative h-72 md:h-96 w-full overflow-hidden">
          <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={() => onNavigate('blog')}
            className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white transition-colors shadow"
          >
            <ArrowLeft size={16} /> Blog
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* ── Main Content ─────────────────────────────────────────────── */}
          <article className="flex-1 min-w-0">
            {/* Breadcrumb */}
            {!blog.thumbnail && (
              <button
                onClick={() => onNavigate('blog')}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-6 transition-colors"
              >
                <ArrowLeft size={16} /> Quay về Blog
              </button>
            )}

            {/* Category chip */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 font-semibold px-3 py-1 rounded-full">
                <Tag size={12} /> {blog.category.name}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
              {blog.title}
            </h1>

            {/* Summary */}
            {blog.summary && (
              <p className="text-lg text-gray-500 leading-relaxed mb-6 border-l-4 border-indigo-200 pl-4">
                {blog.summary}
              </p>
            )}

            {/* Author & Meta */}
            <div className="flex items-center justify-between py-4 border-y border-gray-100 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
                  {blog.author?.avatar ? (
                    <img src={blog.author.avatar} alt={blog.author.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-indigo-600 font-bold text-sm">
                      {blog.author?.name?.charAt(0) ?? 'A'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{blog.author?.name}</p>
                  {blog.author?.storeName && (
                    <p className="text-xs text-gray-500">{blog.author.storeName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {publishedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {blog.readTime} phút đọc
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={12} /> {blog.views.toLocaleString()} lượt xem
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
                  title="Chia sẻ"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>

            {/* Rich HTML Content */}
            <div
              className="prose prose-lg prose-indigo max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-strong:text-gray-900
                prose-blockquote:border-indigo-400 prose-blockquote:bg-indigo-50 prose-blockquote:rounded-r-xl prose-blockquote:py-1
                prose-img:rounded-xl prose-img:shadow-md
                prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                prose-code:bg-gray-100 prose-code:px-1.5 prose-code:rounded
                prose-pre:bg-gray-900 prose-pre:rounded-xl
              "
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </article>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="lg:w-80 flex-shrink-0">
            {/* Author Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Về tác giả</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
                  {blog.author?.avatar ? (
                    <img src={blog.author.avatar} alt={blog.author.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-indigo-600 font-bold">{blog.author?.name?.charAt(0) ?? 'A'}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{blog.author?.name}</p>
                  {blog.author?.storeName && (
                    <p className="text-xs text-gray-500">{blog.author.storeName}</p>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${blog.author?.userType === 'SELLER' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                    {blog.author?.userType === 'SELLER' ? 'Seller' : blog.author?.userType === 'ADMIN' ? 'Admin' : 'Thành viên'}
                  </span>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <ChevronRight size={16} className="text-indigo-500" />
                  Bài viết liên quan
                </h3>
                <div className="space-y-2">
                  {related.map(r => (
                    <RelatedCard
                      key={r.id}
                      blog={r}
                      onClick={() => onNavigate('blog-post', { slug: r.slug })}
                    />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
