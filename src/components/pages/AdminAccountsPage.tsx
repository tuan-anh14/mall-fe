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
import {
  AdminPageLayout,
  AdminSpinner,
  adminPanelClass,
  adminTheadRowClass,
  adminThClass,
  adminTrClass,
  AdminPagination,
  adminBtnPrimaryClass,
} from "../admin/AdminPageLayout";

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
  const limit = 10;

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
    if (type === "ADMIN")
      return (
        <Badge className="border border-blue-200 bg-blue-100 text-blue-900 hover:bg-blue-100">Admin</Badge>
      );
    if (type === "SELLER")
      return (
        <Badge className="border-0 bg-emerald-50 text-emerald-800 hover:bg-emerald-50">Seller</Badge>
      );
    return <Badge className="border-0 bg-slate-100 text-slate-700 hover:bg-slate-100">Buyer</Badge>;
  };

  return (
    <AdminPageLayout
      title="Quản lý tài khoản"
      description={`${total.toLocaleString("vi-VN")} tài khoản trong hệ thống`}
      actions={
        <Button onClick={() => setShowCreateDialog(true)} className={adminBtnPrimaryClass}>
          <Plus className="mr-1 h-4 w-4" />
          Tạo tài khoản
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
        <div className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm theo tên, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <Button size="sm" onClick={handleSearch} className="bg-gray-100 hover:bg-gray-200 text-gray-700 flex-shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={userTypeFilter} onValueChange={(v: string) => { setUserTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36 bg-gray-50 border-gray-200 text-gray-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
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
              className="text-gray-400 hover:text-gray-700"
            >
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className={adminPanelClass}>
        {loading ? (
          <AdminSpinner />
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <Users className="h-7 w-7 text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-900">Không có dữ liệu</p>
            <p className="mt-1 text-sm text-gray-500">
              {hasActiveFilter
                ? "Không tìm thấy tài khoản nào phù hợp với bộ lọc"
                : "Chưa có tài khoản nào"}
            </p>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" onClick={handleClearFilter} className="mt-3 text-blue-600">
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className={adminTheadRowClass}>
                  <th className={adminThClass}>Người dùng</th>
                  <th className={adminThClass}>Loại</th>
                  <th className={adminThClass}>Email</th>
                  <th className={adminThClass}>Đơn hàng</th>
                  <th className={adminThClass}>Reviews</th>
                  <th className={adminThClass}>Ngày tạo</th>
                  <th className={`${adminThClass} text-right`}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.id} className={adminTrClass}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900 text-sm font-medium">{acc.firstName} {acc.lastName}</p>
                        {acc.sellerProfile && (
                          <p className="text-blue-600 text-xs opacity-70">{acc.sellerProfile.storeName}</p>
                        )}
                        {acc.sellerRequest && acc.sellerRequest.status === "PENDING" && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-[10px] px-1">
                            Chờ duyệt seller
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{typeBadge(acc.userType)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500 text-xs">{acc.email}</span>
                        {acc.isEmailVerified && (
                          <span className="text-green-400 text-[10px]">✓</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{acc._count.orders}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{acc._count.reviews}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(acc.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
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
      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        setCurrentPage={setPage}
        totalItems={total}
      />

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Xóa tài khoản?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Xóa tài khoản <strong className="text-gray-900">{deleteTarget?.email}</strong>. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Account Detail Dialog */}
      <Dialog open={!!detailAccount || detailLoading} onOpenChange={() => { setDetailAccount(null); }}>
        <DialogContent className="bg-white border-gray-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Chi tiết tài khoản</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <AdminSpinner className="min-h-[8rem]" label="Đang tải chi tiết…" />
          ) : detailAccount ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Họ và tên</p>
                  <p className="text-gray-900 text-sm font-medium">{detailAccount.firstName} {detailAccount.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Email</p>
                  <p className="text-gray-600 text-sm">{detailAccount.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Loại tài khoản</p>
                  <div>{typeBadge(detailAccount.userType)}</div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Xác thực email</p>
                  <p className={`text-sm ${detailAccount.isEmailVerified ? "text-green-400" : "text-gray-400"}`}>
                    {detailAccount.isEmailVerified ? "Đã xác thực ✓" : "Chưa xác thực"}
                  </p>
                </div>
                {detailAccount.phone && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Điện thoại</p>
                    <p className="text-gray-600 text-sm">{detailAccount.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-xs mb-1">Ngày tạo</p>
                  <p className="text-gray-600 text-sm">{new Date(detailAccount.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-gray-900 text-lg font-bold">{detailAccount._count.orders}</p>
                  <p className="text-gray-400 text-xs mt-0.5">Đơn hàng</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-gray-900 text-lg font-bold">{detailAccount._count.reviews}</p>
                  <p className="text-gray-400 text-xs mt-0.5">Reviews</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-gray-900 text-lg font-bold">{detailAccount._count.sessions}</p>
                  <p className="text-gray-400 text-xs mt-0.5">Phiên</p>
                </div>
              </div>

              {detailAccount.sellerProfile && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-gray-400 text-xs mb-2">Hồ sơ Shop</p>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 text-sm font-medium">{detailAccount.sellerProfile.storeName}</span>
                    {detailAccount.sellerProfile.isVerified && (
                      <Badge className="bg-green-500/20 text-green-400 border-0 text-[10px]">Đã xác minh</Badge>
                    )}
                  </div>
                </div>
              )}

              {detailAccount.sellerRequest && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-gray-400 text-xs mb-1">Yêu cầu Seller</p>
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
        <DialogContent className="bg-white border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Tạo tài khoản mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-gray-500 text-sm">Họ *</Label>
                <Input
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm(f => ({ ...f, firstName: e.target.value }))}
                  placeholder="Nguyễn"
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-500 text-sm">Tên *</Label>
                <Input
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm(f => ({ ...f, lastName: e.target.value }))}
                  placeholder="Văn A"
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-500 text-sm">Email *</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-500 text-sm">Mật khẩu * (tối thiểu 6 ký tự)</Label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-500 text-sm">Loại tài khoản</Label>
              <Select value={createForm.userType} onValueChange={(v: any) => setCreateForm(f => ({ ...f, userType: v }))}>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="BUYER">Người mua (Buyer)</SelectItem>
                  <SelectItem value="SELLER">Người bán (Seller)</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" className="border border-gray-200 text-gray-700" onClick={() => { setShowCreateDialog(false); setCreateForm(emptyCreateForm); }}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={creating} className={adminBtnPrimaryClass}>
              {creating ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
}
