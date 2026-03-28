import React, { useState, useEffect, useCallback } from 'react';
import { blogService } from '../../services/blog.service';
import { RichTextEditor } from '../blog/RichTextEditor';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Blog, BlogCategory, BlogStatus } from '../../types/blog';
import {
  PenTool,
  List,
  Plus,
  Edit3,
  Trash2,
  Eye,
  ChevronLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  Save,
  X,
  Upload,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface BlogManagementPageProps {
  onNavigate: (page: string, data?: any) => void;
}

type View = 'list' | 'editor';

const STATUS_CONFIG: Record<BlogStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  DRAFT: { label: 'Nháp', icon: <Edit3 size={12} />, cls: 'bg-gray-100 text-gray-600' },
  PENDING: { label: 'Chờ duyệt', icon: <Clock size={12} />, cls: 'bg-amber-50 text-amber-700' },
  PUBLISHED: { label: 'Đã đăng', icon: <CheckCircle size={12} />, cls: 'bg-green-50 text-green-700' },
  REJECTED: { label: 'Từ chối', icon: <XCircle size={12} />, cls: 'bg-red-50 text-red-700' },
};

export function BlogManagementPage({ onNavigate }: BlogManagementPageProps) {
  const [view, setView] = useState<View>('list');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; blog: Blog | null }>({ open: false, blog: null });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogService.getMyBlogs({ page, limit: 10 });
      setBlogs(res.blogs);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    blogService.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (view === 'list') fetchBlogs();
  }, [fetchBlogs, view]);

  const openEditor = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog);
      setTitle(blog.title);
      setContent(blog.content);
      setSummary(blog.summary ?? '');
      setThumbnail(blog.thumbnail ?? '');
      setCategoryId(blog.category.id);
    } else {
      setEditingBlog(null);
      setTitle('');
      setContent('');
      setSummary('');
      setThumbnail('');
      setCategoryId(categories[0]?.id ?? '');
    }
    setView('editor');
  };

  const handleSave = async (submitForReview = false) => {
    if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    if (!content.trim()) { toast.error('Vui lòng nhập nội dung'); return; }
    if (!categoryId) { toast.error('Vui lòng chọn danh mục'); return; }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content,
        summary: summary.trim() || undefined,
        thumbnail: thumbnail.trim() || undefined,
        categoryId,
        status: submitForReview ? 'PENDING' : 'DRAFT',
      };

      if (editingBlog) {
        await blogService.update(editingBlog.id, payload);
        toast.success(submitForReview ? 'Đã gửi bài để duyệt!' : 'Đã lưu nháp!');
      } else {
        await blogService.create(payload);
        toast.success(submitForReview ? 'Đã gửi bài để duyệt!' : 'Đã lưu nháp!');
      }
      setView('list');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ảnh quá lớn. Vui lòng chọn ảnh dưới 10MB');
      return;
    }

    setUploading(true);
    try {
      const res = await blogService.uploadImage(file);
      setThumbnail(res.url);
      toast.success('Đã tải ảnh lên thành công');
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (blog: Blog) => {
    setDeleteDialog({ open: true, blog });
  };

  const confirmDelete = async () => {
    const blog = deleteDialog.blog;
    if (!blog) return;

    try {
      await blogService.delete(blog.id);
      toast.success('Đã xóa bài viết');
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa');
    } finally {
      setDeleteDialog({ open: false, blog: null });
    }
  };

  // ── EDITOR VIEW ────────────────────────────────────────────────────────────
  if (view === 'editor') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} /> Quay lại
          </button>
          <h2 className="text-base font-semibold text-gray-800">
            {editingBlog ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors cursor-pointer"
            >
              <Save size={16} /> Lưu nháp
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors cursor-pointer"
            >
              <Send size={16} /> {saving ? 'Đang gửi...' : 'Gửi duyệt'}
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Rejection note alert */}
          {editingBlog?.adminNote && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Lý do từ chối</p>
                <p className="text-sm mt-1">{editingBlog.adminNote}</p>
              </div>
            </div>
          )}

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Tiêu đề bài viết..."
            className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-0 outline-none bg-transparent mb-4 leading-tight"
          />

          {/* Meta fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Danh mục *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all bg-white"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Ảnh bìa bài viết *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div 
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`flex items-center gap-3 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white cursor-pointer transition-all hover:bg-gray-50 hover:border-indigo-300 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploading ? (
                  <div className="flex items-center gap-2 text-indigo-600">
                    <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                    <span>Đang tải lên...</span>
                  </div>
                ) : (
                  <>
                    <Upload size={16} className="text-gray-400" />
                    <span className={thumbnail ? 'text-gray-900 truncate' : 'text-gray-400'}>
                      {thumbnail ? 'Thay đổi ảnh bìa' : 'Chọn ảnh bìa từ máy tính'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Tóm tắt (hiển thị trên card - dùng cho SEO)
            </label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Mô tả ngắn về nội dung bài viết..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{summary.length}/500</p>
          </div>

          {/* Rich Text Editor */}
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Nội dung *
          </label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Bắt đầu viết nội dung bài viết tại đây..."
            minHeight={500}
          />

          {/* Thumbnail preview */}
          {thumbnail && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Xem trước ảnh bìa
                </label>
                <button 
                  onClick={() => setThumbnail('')}
                  className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <Trash2 size={12} /> Xóa ảnh
                </button>
              </div>
              <div className="relative group overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 aspect-[21/9]">
                <ImageWithFallback
                  src={thumbnail}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  previewable={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <PenTool size={24} className="text-indigo-600" />
              Bài viết của tôi
            </h1>
            <p className="text-sm text-gray-500 mt-1">{total} bài viết</p>
          </div>
          <button
            onClick={() => openEditor()}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={18} /> Viết bài mới
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <List size={32} className="text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Chưa có bài viết nào</h2>
            <p className="text-gray-500 mb-6">Bắt đầu chia sẻ kiến thức của bạn với cộng đồng ShopHub!</p>
            <button
              onClick={() => openEditor()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Plus size={18} /> Viết bài đầu tiên
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {blogs.map(blog => {
                const cfg = STATUS_CONFIG[blog.status];
                const canEdit = blog.status === 'DRAFT' || blog.status === 'REJECTED';
                const canDelete = blog.status === 'DRAFT' || blog.status === 'REJECTED';
                return (
                  <div key={blog.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      {blog.thumbnail && (
                        <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                          <ImageWithFallback 
                            src={blog.thumbnail} 
                            alt={blog.title} 
                            className="w-full h-full object-cover" 
                            previewable={true}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
                            {blog.title}
                          </h3>
                          <span className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.cls}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {blog.category.name} • {blog.readTime}m đọc • {blog.views.toLocaleString()} lượt xem
                        </p>
                        {blog.adminNote && (
                          <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                            <AlertCircle size={12} /> {blog.adminNote}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          {blog.status === 'PUBLISHED' && (
                            <button
                              onClick={() => onNavigate('blog-post', { slug: blog.slug })}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <Eye size={13} /> Xem
                            </button>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => openEditor(blog)}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            >
                              <Edit3 size={13} /> Sửa
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(blog)}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} /> Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Trước</button>
                <span className="text-sm text-gray-600">Trang {page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Tiếp</button>
              </div>
            )}
          </>
        )}
        <AlertDialog 
          open={deleteDialog.open} 
          onOpenChange={(open) => !open && setDeleteDialog({ open: false, blog: null })}
        >
          <AlertDialogContent className="bg-white border-gray-200/80 rounded-2xl shadow-xl max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900 text-lg font-bold">Xóa bài viết</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 text-sm leading-relaxed">
                Bạn có chắc chắn muốn xóa bài viết <strong className="text-gray-700">"{deleteDialog.blog?.title}"</strong>? 
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel className="rounded-xl border-gray-200 font-medium cursor-pointer">
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold cursor-pointer"
              >
                Xóa bài viết
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
