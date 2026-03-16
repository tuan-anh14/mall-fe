import { useEffect, useState, useCallback } from "react";
import { Search, Trash2, Lock, ChevronLeft, ChevronRight, Users, Filter, Plus, Eye, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { get, put, del, post } from "../../lib/api";
import { toast } from "sonner";

interface Account {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: "BUYER" | "SELLER" | "ADMIN";
  isEmailVerified: boolean;
  createdAt: string;
  sellerProfile?: { storeName: string; isVerified: boolean } | null;
  sellerRequest?: { status: string; createdAt: string } | null;
  _count: { orders: number; reviews: number };
}

interface AccountDetail extends Account {
  phone?: string;
  avatar?: string;
  memberSince?: string;
  _count: { orders: number; reviews: number; sessions: number };
}

interface CreateForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: "BUYER" | "SELLER" | "ADMIN";
}

const USER_TYPE_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "BUYER", label: "Người mua" },
  { value: "SELLER", label: "Người bán" },
  { value: "ADMIN", label: "Admin" },
];

const emptyCreateForm: CreateForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  userType: "BUYER",
};

export function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [detailAccount, setDetailAccount] = useState<AccountDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreateForm);
  const [creating, setCreating] = useState(false);
  const limit = 20;

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      if (userTypeFilter !== "ALL") params.set("userType", userTypeFilter);
      const data = await get<{ users: Account[]; total: number }>(`/api/v1/admin/accounts?${params}`);
      setAccounts(data.users);
      setTotal(data.total);
    } catch {
      toast.error("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  }, [page, search, userTypeFilter]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleClearFilter = () => {
    setSearchInput("");
    setSearch("");
    setUserTypeFilter("ALL");
    setPage(1);
  };

  const handleBan = async (id: string) => {
    try {
      const res = await put<{ message: string }>(`/api/v1/admin/accounts/${id}/ban`);
      toast.success(res.message);
    } catch (e: any) {
      toast.error(e.message || "Lỗi");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await del(`/api/v1/admin/accounts/${deleteTarget.id}`);
      toast.success("Đã xóa tài khoản");
      setDeleteTarget(null);
      fetchAccounts();
    } catch (e: any) {
      toast.error(e.message || "Lỗi");
    }
  };

  const handleViewDetail = async (acc: Account) => {
    setDetailLoading(true);
    setDetailAccount(null);
    try {
      const data = await get<AccountDetail>(`/api/v1/admin/accounts/${acc.id}`);
      setDetailAccount(data);
    } catch {
      toast.error("Không thể tải thông tin chi tiết");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.firstName.trim() || !createForm.lastName.trim()) return toast.error("Vui lòng nhập họ và tên");
    if (!createForm.email.trim()) return toast.error("Vui lòng nhập email");
    if (createForm.password.length < 6) return toast.error("Mật khẩu tối thiểu 6 ký tự");
    setCreating(true);
    try {
      await post("/api/v1/admin/accounts", createForm);
      toast.success("Đã tạo tài khoản thành công");
      setShowCreateDialog(false);
      setCreateForm(emptyCreateForm);
      fetchAccounts();
    } catch (e: any) {
      toast.error(e.message || "Không thể tạo tài khoản");
    } finally {
      setCreating(false);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const hasActiveFilter = search || userTypeFilter !== "ALL";

  const typeBadge = (type: string) => {
    if (type === "ADMIN") return <Badge className="bg-red-500/20 text-red-400 border-0">Admin</Badge>;
    if (type === "SELLER") return <Badge className="bg-purple-500/20 text-purple-400 border-0">Seller</Badge>;
    return <Badge className="bg-blue-500/20 text-blue-400 border-0">Buyer</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý tài khoản</h1>
          <p className="text-white/50 text-sm mt-0.5">{total} tài khoản</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Tạo tài khoản
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Tìm theo tên, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <Button size="sm" onClick={handleSearch} className="bg-white/10 hover:bg-white/20 flex-shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-white/40" />
          <Select value={userTypeFilter} onValueChange={(v: string) => { setUserTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {USER_TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilter}
              className="text-white/40 hover:text-white"
            >
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="bg-white/5 border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/40">
            <Users className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-lg">Không có dữ liệu</p>
            <p className="text-sm mt-1">
              {hasActiveFilter
                ? "Không tìm thấy tài khoản nào phù hợp với bộ lọc"
                : "Chưa có tài khoản nào"}
            </p>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" onClick={handleClearFilter} className="mt-3 text-purple-400">
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-white/50 text-sm font-medium">Người dùng</th>
                  <th className="px-4 py-3 text-white/50 text-sm font-medium">Loại</th>
                  <th className="px-4 py-3 text-white/50 text-sm font-medium">Email</th>
                  <th className="px-4 py-3 text-white/50 text-sm font-medium">Đơn hàng</th>
                  <th className="px-4 py-3 text-white/50 text-sm font-medium">Reviews</th>
                  <th className="px-4 py-3 text-white/50 text-sm font-medium">Ngày tạo</th>
                  <th className="px-4 py-3 text-white/50 text-sm font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium">{acc.firstName} {acc.lastName}</p>
                        {acc.sellerProfile && (
                          <p className="text-purple-400/70 text-xs">{acc.sellerProfile.storeName}</p>
                        )}
                        {acc.sellerRequest && acc.sellerRequest.status === "PENDING" && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-[10px] px-1">
                            Chờ duyệt seller
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{typeBadge(acc.userType)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white/60 text-xs">{acc.email}</span>
                        {acc.isEmailVerified && (
                          <span className="text-green-400 text-[10px]">✓</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70 text-sm">{acc._count.orders}</td>
                    <td className="px-4 py-3 text-white/70 text-sm">{acc._count.reviews}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">
                      {new Date(acc.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10"
                          title="Xem chi tiết"
                          onClick={() => handleViewDetail(acc)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {acc.userType !== "ADMIN" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-yellow-400/70 hover:text-yellow-400 hover:bg-yellow-400/10"
                              title="Khóa phiên đăng nhập"
                              onClick={() => handleBan(acc.id)}
                            >
                              <Lock className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-400/70 hover:text-red-400 hover:bg-red-400/10"
                              title="Xóa tài khoản"
                              onClick={() => setDeleteTarget(acc)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-sm">Trang {page} / {totalPages} ({total} tài khoản)</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pg = i + 1;
              return (
                <Button
                  key={pg}
                  variant={pg === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPage(pg)}
                  className="w-8"
                >
                  {pg}
                </Button>
              );
            })}
            <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-zinc-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Xóa tài khoản?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Xóa tài khoản <strong className="text-white">{deleteTarget?.email}</strong>. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Account Detail Dialog */}
      <Dialog open={!!detailAccount || detailLoading} onOpenChange={() => { setDetailAccount(null); }}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Chi tiết tài khoản</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : detailAccount ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/40 text-xs mb-1">Họ và tên</p>
                  <p className="text-white text-sm font-medium">{detailAccount.firstName} {detailAccount.lastName}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Email</p>
                  <p className="text-white/80 text-sm">{detailAccount.email}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Loại tài khoản</p>
                  <div>{typeBadge(detailAccount.userType)}</div>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Xác thực email</p>
                  <p className={`text-sm ${detailAccount.isEmailVerified ? "text-green-400" : "text-white/40"}`}>
                    {detailAccount.isEmailVerified ? "Đã xác thực ✓" : "Chưa xác thực"}
                  </p>
                </div>
                {detailAccount.phone && (
                  <div>
                    <p className="text-white/40 text-xs mb-1">Điện thoại</p>
                    <p className="text-white/80 text-sm">{detailAccount.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-white/40 text-xs mb-1">Ngày tạo</p>
                  <p className="text-white/80 text-sm">{new Date(detailAccount.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-white text-lg font-bold">{detailAccount._count.orders}</p>
                  <p className="text-white/40 text-xs mt-0.5">Đơn hàng</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-white text-lg font-bold">{detailAccount._count.reviews}</p>
                  <p className="text-white/40 text-xs mt-0.5">Reviews</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-white text-lg font-bold">{detailAccount._count.sessions}</p>
                  <p className="text-white/40 text-xs mt-0.5">Phiên</p>
                </div>
              </div>

              {detailAccount.sellerProfile && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-white/40 text-xs mb-2">Hồ sơ Shop</p>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 text-sm font-medium">{detailAccount.sellerProfile.storeName}</span>
                    {detailAccount.sellerProfile.isVerified && (
                      <Badge className="bg-green-500/20 text-green-400 border-0 text-[10px]">Đã xác minh</Badge>
                    )}
                  </div>
                </div>
              )}

              {detailAccount.sellerRequest && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-white/40 text-xs mb-1">Yêu cầu Seller</p>
                  <Badge className={
                    detailAccount.sellerRequest.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400 border-0" :
                    detailAccount.sellerRequest.status === "APPROVED" ? "bg-green-500/20 text-green-400 border-0" :
                    "bg-red-500/20 text-red-400 border-0"
                  }>
                    {detailAccount.sellerRequest.status === "PENDING" ? "Chờ duyệt" :
                     detailAccount.sellerRequest.status === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                  </Badge>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Create Account Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(o) => { if (!o) { setShowCreateDialog(false); setCreateForm(emptyCreateForm); } }}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Tạo tài khoản mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Họ *</Label>
                <Input
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm(f => ({ ...f, firstName: e.target.value }))}
                  placeholder="Nguyễn"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Tên *</Label>
                <Input
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm(f => ({ ...f, lastName: e.target.value }))}
                  placeholder="Văn A"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/60 text-sm">Email *</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/60 text-sm">Mật khẩu * (tối thiểu 6 ký tự)</Label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/60 text-sm">Loại tài khoản</Label>
              <Select value={createForm.userType} onValueChange={(v: any) => setCreateForm(f => ({ ...f, userType: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUYER">Người mua (Buyer)</SelectItem>
                  <SelectItem value="SELLER">Người bán (Seller)</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" className="border border-white/10 text-white" onClick={() => { setShowCreateDialog(false); setCreateForm(emptyCreateForm); }}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={creating} className="bg-purple-600 hover:bg-purple-700">
              {creating ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
