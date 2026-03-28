import React, { useState, useEffect, useCallback } from 'react';
import { blogService } from '../../services/blog.service';
import type { Blog, BlogStatus } from '../../types/blog';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit3,
  Trash2,
  Search,
  Filter,
  BookOpen,
  AlertCircle,
  Plus,
  Settings2,
  Tag,
  X,
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

interface AdminBlogPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const STATUS_TABS: { label: string; value: BlogStatus | ''; icon: React.ReactNode }[] = [
  { label: 'Tất cả', value: '', icon: <BookOpen size={14} /> },
  { label: 'Chờ duyệt', value: 'PENDING', icon: <Clock size={14} /> },
  { label: 'Đã đăng', value: 'PUBLISHED', icon: <CheckCircle size={14} /> },
  { label: 'Từ chối', value: 'REJECTED', icon: <XCircle size={14} /> },
  { label: 'Nháp', value: 'DRAFT', icon: <Edit3 size={14} /> },
];

const STATUS_CONFIG: Record<BlogStatus, { label: string; cls: string }> = {
  DRAFT: { label: 'Nháp', cls: 'bg-gray-100 text-gray-600' },
  PENDING: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  PUBLISHED: { label: 'Đã đăng', cls: 'bg-green-50 text-green-700' },
  REJECTED: { label: 'Từ chối', cls: 'bg-red-50 text-red-700' },
};

export function AdminBlogPage({ onNavigate }: AdminBlogPageProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<BlogStatus | ''>('PENDING');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [rejectModal, setRejectModal] = useState<{ open: boolean; blogId: string; title: string }>({ open: false, blogId: '', title: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState<import('../../types/blog').BlogCategory[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [deleteBlogDialog, setDeleteBlogDialog] = useState<{ open: boolean; blog: Blog | null }>({ open: false, blog: null });
  const [deleteCatDialog, setDeleteCatDialog] = useState<{ open: boolean; cat: import('../../types/blog').BlogCategory | null }>({ open: false, cat: null });

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogService.adminGetAll({
        page,
        limit: 10,
        status: activeStatus || undefined,
        search: search || undefined,
      });
      setBlogs(res.blogs);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  }, [page, activeStatus, search]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleApprove = async (blog: Blog) => {
    try {
      await blogService.approve(blog.id);
      toast.success(`Đã duyệt: "${blog.title}"`);
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.message || 'Không thể duyệt bài');
    }
  };

  const openRejectModal = (blog: Blog) => {
    setRejectModal({ open: true, blogId: blog.id, title: blog.title });
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Vui lòng nhập lý do từ chối'); return; }
    try {
      await blogService.reject(rejectModal.blogId, rejectReason.trim());
      toast.success('Đã từ chối bài viết');
      setRejectModal({ open: false, blogId: '', title: '' });
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (blog: Blog) => {
    setDeleteBlogDialog({ open: true, blog });
  };

  const confirmDeleteBlog = async () => {
    const blog = deleteBlogDialog.blog;
    if (!blog) return;
    try {
      await blogService.adminDelete(blog.id);
      toast.success('Đã xóa bài viết');
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa');
    } finally {
      setDeleteBlogDialog({ open: false, blog: null });
    }
  };

  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const cats = await blogService.getCategories();
      setCategories(cats);
    } catch {
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setCatLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await blogService.createCategory(newCatName.trim());
      toast.success('Đã thêm danh mục');
      setNewCatName('');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Không thể thêm danh mục');
    }
  };

  const handleDeleteCategory = async (cat: import('../../types/blog').BlogCategory) => {
    setDeleteCatDialog({ open: true, cat });
  };

  const confirmDeleteCat = async () => {
    const cat = deleteCatDialog.cat;
    if (!cat) return;
    try {
      await blogService.deleteCategory(cat.id);
      toast.success('Đã xóa danh mục');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa danh mục');
    } finally {
      setDeleteCatDialog({ open: false, cat: null });
    }
  };

  useEffect(() => {
    if (showCategoryModal) fetchCategories();
  }, [showCategoryModal]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck size={24} className="text-indigo-600" />
              Quản lý Blog
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{total} bài viết</p>
          </div>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
          >
            <Settings2 size={16} className="text-gray-400" />
            Quản lý danh mục
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status tabs */}
            <div className="flex flex-wrap gap-2">
              {STATUS_TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => { setActiveStatus(tab.value as BlogStatus | ''); setPage(1); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeStatus === tab.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <Filter size={16} /> Lọc
              </button>
            </form>
          </div>
        </div>

        {/* Blog Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <BookOpen size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-500">Không có bài viết nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {blogs.map(blog => {
                const cfg = STATUS_CONFIG[blog.status];
                return (
                  <div key={blog.id} className={`p-5 hover:bg-gray-50 transition-colors ${blog.status === 'PENDING' ? 'border-l-4 border-amber-400' : ''}`}>
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-50 to-purple-100">
                        {blog.thumbnail ? (
                          <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen size={20} className="text-indigo-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 leading-snug line-clamp-1">{blog.title}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Bởi <strong>{blog.author?.name}</strong>
                              {blog.author?.storeName ? ` (${blog.author.storeName})` : ''} •
                              {blog.category.name} •
                              {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
                            {cfg.label}
                          </span>
                        </div>

                        {blog.summary && (
                          <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{blog.summary}</p>
                        )}

                        {blog.adminNote && (
                          <p className="flex items-center gap-1 text-xs text-red-600 mt-1.5">
                            <AlertCircle size={12} /> Lý do từ chối: {blog.adminNote}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center flex-wrap gap-2 mt-3">
                          {blog.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(blog)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                              >
                                <CheckCircle size={13} /> Duyệt
                              </button>
                              <button
                                onClick={() => openRejectModal(blog)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                              >
                                <XCircle size={13} /> Từ chối
                              </button>
                            </>
                          )}
                          {blog.status === 'PUBLISHED' && (
                            <button
                              onClick={() => onNavigate('blog-post', { slug: blog.slug })}
                              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <Eye size={13} /> Xem
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(blog)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 text-xs rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} /> Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Trang {page} / {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Trước</button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Tiếp</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Reject Modal ──────────────────────────────────────────────────── */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Từ chối bài viết</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">"{rejectModal.title}"</p>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Lý do từ chối *
            </label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Vui lòng nhập lý do cụ thể để tác giả có thể chỉnh sửa..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModal({ open: false, blogId: '', title: '' })}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer"
              >
                <XCircle size={16} /> Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Category Modal ────────────────────────────────────────────────── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Tag size={20} className="text-indigo-600" />
                Quản lý danh mục bài viết
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleCreateCategory} className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Tên danh mục mới..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                />
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus size={18} /> Thêm
                </button>
              </form>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {catLoading ? (
                  <div className="py-10 text-center">
                    <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-center py-10 text-gray-500 text-sm">Chưa có danh mục nào</p>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Xóa danh mục"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Blog Confirmation */}
      <AlertDialog 
        open={deleteBlogDialog.open} 
        onOpenChange={(open) => !open && setDeleteBlogDialog({ open: false, blog: null })}
      >
        <AlertDialogContent className="bg-white border-gray-200/80 rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 text-lg font-bold">Xóa vĩnh viễn bài bài viết</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 text-sm leading-relaxed">
              Bạn có chắc chắn muốn xóa bài viết <strong className="text-gray-700">"{deleteBlogDialog.blog?.title}"</strong>? 
              Dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl border-gray-200 font-medium cursor-pointer">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBlog}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold cursor-pointer"
            >
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation */}
      <AlertDialog 
        open={deleteCatDialog.open} 
        onOpenChange={(open) => !open && setDeleteCatDialog({ open: false, cat: null })}
      >
        <AlertDialogContent className="bg-white border-gray-200/80 rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 text-lg font-bold">Xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 text-sm leading-relaxed">
              Bạn có chắc chắn muốn xóa danh mục <strong className="text-gray-700">"{deleteCatDialog.cat?.name}"</strong>? 
              Các bài viết thuộc danh mục này sẽ cần được cập nhật lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl border-gray-200 font-medium cursor-pointer">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCat}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold cursor-pointer"
            >
              Xóa danh mục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
