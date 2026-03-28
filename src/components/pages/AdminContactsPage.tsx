import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Search,
  Filter,
  MoreVertical,
  Reply,
  Archive,
  Trash2,
  Clock,
  User,
  MessageCircle,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  AlertCircle,
  Upload,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { get, post, patch, del, API_URL } from "../../lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useRef } from "react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "PENDING" | "REPLIED" | "ARCHIVED";
  adminReply: string | null;
  adminReplyAt: string | null;
  adminReplyAttachments: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const motionEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  // Modal states
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const url = `/api/v1/contacts/admin?page=${page}&limit=10${
        statusFilter !== "ALL" ? `&status=${statusFilter}` : ""
      }`;
      const response = await get<{ items: ContactMessage[]; meta: PaginationMeta }>(url);
      setContacts(response.items);
      setMeta(response.meta);
    } catch (error) {
      toast.error("Không thể tải danh sách liên hệ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, statusFilter]);

  const handleReply = async () => {
    if (!selectedContact || !replyText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    setIsSending(true);
    try {
      await post(`/api/v1/contacts/admin/${selectedContact.id}/reply`, {
        replyText,
        attachments: photoUrls.filter(url => url.trim() !== ""),
      });
      toast.success("Đã gửi phản hồi thành công qua email!");
      setSelectedContact(null);
      setReplyText("");
      setPhotoUrls([]);
      fetchContacts();
    } catch (error) {
      toast.error("Gửi phản hồi thất bại");
    } finally {
      setIsSending(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await patch(`/api/v1/contacts/admin/${id}/status`, { status });
      toast.success("Đã cập nhật trạng thái");
      fetchContacts();
    } catch (error) {
      toast.error("Cập nhật thất bại");
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa tin nhắn này?")) return;
    try {
      await del(`/api/v1/contacts/admin/${id}`);
      toast.success("Đã xóa tin nhắn");
      fetchContacts();
    } catch (error) {
      toast.error("Xóa thất bại");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((file) => fd.append("files", file));

      const res = await fetch(`${API_URL}/api/v1/upload/images`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Tải lên thất bại");

      const urls: string[] = json.data?.urls ?? [];
      setPhotoUrls((prev) => [...prev, ...urls]);
      toast.success("Đã tải ảnh lên thành công");
    } catch (err: any) {
      toast.error(err.message || "Không thể tải ảnh lên");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhotoUrl = async (index: number) => {
    const url = photoUrls[index];
    try {
      // Optioanly delete from server
      await del("/api/v1/upload/images", { url });
    } catch (error) {
      // Non-fatal
    }
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Chờ xử lý</Badge>;
      case "REPLIED":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Đã phản hồi</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200">Lưu trữ</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 lg:py-10 max-w-7xl px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: motionEase }}
        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Mail className="h-4 w-4" />
            Quản trị hỗ trợ
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tin nhắn liên hệ</h1>
          <p className="text-gray-500 mt-1">Quản lý và phản hồi các thắc mắc từ người dùng</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="REPLIED">Đã phản hồi</option>
              <option value="ARCHIVED">Đã lưu trữ</option>
            </select>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchContacts}
            disabled={loading}
            className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 h-10 px-4"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Làm mới"}
          </Button>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-[250px] font-semibold text-gray-700">Người gửi</TableHead>
                <TableHead className="font-semibold text-gray-700">Chủ đề & Nội dung</TableHead>
                <TableHead className="w-[150px] font-semibold text-gray-700">Thời gian</TableHead>
                <TableHead className="w-[120px] font-semibold text-gray-700">Trạng thái</TableHead>
                <TableHead className="w-[80px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 w-32 bg-gray-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-full bg-gray-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-gray-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-gray-100 animate-pulse rounded" /></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-60 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <MessageCircle className="h-12 w-12 mb-3 opacity-20" />
                      <p>Không có tin nhắn nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow 
                    key={contact.id}
                    className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-primary border border-blue-100">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">{contact.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{contact.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                          {contact.subject}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {contact.message}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(contact.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(contact.status)}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100">
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-lg border-gray-200">
                          <DropdownMenuLabel className="text-xs text-gray-400">Thao tác</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSelectedContact(contact)} className="rounded-lg gap-2 cursor-pointer">
                            <Reply className="h-3.5 w-3.5 text-blue-500" /> Phản hồi
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(contact.id, "ARCHIVED")} className="rounded-lg gap-2 cursor-pointer">
                            <Archive className="h-3.5 w-3.5 text-amber-500" /> Lưu trữ
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => deleteMessage(contact.id)} className="rounded-lg gap-2 text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" /> Xóa tin nhắn
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50/30 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
              Trang <span className="text-gray-900">{meta.page}</span> / {meta.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 rounded-lg border-gray-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page === meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="h-8 w-8 rounded-lg border-gray-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Details/Reply Modal */}
      <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 gap-0 overflow-hidden border-0 shadow-2xl">
          <DialogHeader className="p-6 bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Chi tiết liên hệ
                </DialogTitle>
                <DialogDescription className="text-gray-500 mt-1">
                  Thông tin gửi từ {selectedContact?.name}
                </DialogDescription>
              </div>
              <Badge className="bg-blue-50 text-primary border-blue-100">#{selectedContact?.id.slice(-6)}</Badge>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Contact Info Header */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Họ tên</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-gray-400" />
                  {selectedContact?.name}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Email</p>
                <div className="text-sm font-semibold text-gray-900 flex items-start gap-2 break-all">
                  <Mail className="h-3.5 w-3.5 text-gray-400 mt-1 flex-shrink-0" />
                  {selectedContact?.email}
                </div>
              </div>
            </div>

            {/* Original Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                <span>Nội dung yêu cầu</span>
                <span>{selectedContact && formatDistanceToNow(new Date(selectedContact.createdAt), { addSuffix: true, locale: vi })}</span>
              </div>
              <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-gray-900 mb-2 truncate">
                  {selectedContact?.subject}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {selectedContact?.message}
                </p>
              </div>
            </div>

            {/* Admin Historical Reply */}
            {selectedContact?.status === "REPLIED" && selectedContact.adminReply && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-emerald-600 font-bold">
                  <CheckCircle2 className="h-3 w-3" />
                  Đã phản hồi vào {selectedContact.adminReplyAt && formatDistanceToNow(new Date(selectedContact.adminReplyAt), { addSuffix: true, locale: vi })}
                </div>
                <div className="bg-emerald-50/30 border border-emerald-100 p-5 rounded-3xl space-y-4">
                  <p className="text-sm text-emerald-800 leading-relaxed italic whitespace-pre-wrap">
                    {selectedContact.adminReply}
                  </p>
                  
                  {/* Reply Attachments Preview */}
                  {selectedContact.adminReplyAttachments && selectedContact.adminReplyAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-100/50 pt-4">
                      {selectedContact.adminReplyAttachments.map((url, i) => (
                        <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-200 shadow-sm transition-transform hover:scale-110">
                          <ImageWithFallback
                            src={url}
                            alt={`Phản hồi ${i + 1}`}
                            className="w-full h-full object-cover"
                            previewable={true}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reply Form */}
            {selectedContact?.status === "PENDING" && (
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Reply className="h-4 w-4 text-blue-500" />
                      Phản hồi của bạn
                    </label>
                  </div>
                  <Textarea
                    placeholder="Nhập nội dung phản hồi cho khách hàng..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[140px] rounded-2xl border-gray-200 focus:ring-primary/20 bg-gray-50/50 focus:bg-white transition-all resize-none shadow-inner"
                  />
                </div>

                {/* Photos */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-emerald-500" />
                      Đính kèm hình ảnh
                    </label>
                    {photoUrls.length > 0 && (
                      <span className="text-[10px] text-gray-400 font-medium">{photoUrls.length} ảnh đã chọn</span>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                      uploading
                        ? "border-primary/50 bg-primary/5"
                        : "border-gray-200 hover:border-primary/50 hover:bg-gray-50/50"
                    }`}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm text-primary font-medium">Đang tải lên Cloudinary...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-900 font-medium">Kéo thả hoặc nhấn để tải ảnh</p>
                        <p className="text-[11px] text-gray-400 uppercase tracking-widest">PNG, JPG, WEBP • MAX 10MB</p>
                      </div>
                    )}
                  </div>

                  {photoUrls.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                      <AnimatePresence>
                        {photoUrls.map((url, i) => (
                          <motion.div
                            key={url}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100 shadow-sm"
                          >
                            <ImageWithFallback
                              src={url}
                              alt="Đính kèm"
                              className="w-full h-full object-cover"
                              previewable={true}
                            />
                            <button
                              onClick={() => removePhotoUrl(i)}
                              className="absolute top-1.5 right-1.5 h-6 w-6 bg-red-600 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110 active:scale-95"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-gray-50/50 border-t border-gray-100">
            <Button variant="ghost" onClick={() => setSelectedContact(null)} className="rounded-xl font-medium">
              Đóng
            </Button>
            {selectedContact?.status === "PENDING" && (
              <Button
                onClick={handleReply}
                disabled={isSending || !replyText.trim()}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-8 transition-all hover:scale-105 active:scale-95"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Gửi phản hồi qua Email
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
