import { useEffect, useState } from "react";
import { Search, Trash2, Lock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
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
import { get, put, del } from "../../lib/api";
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

export function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const limit = 20;

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      const data = await get<{ users: Account[]; total: number }>(`/api/v1/admin/accounts?${params}`);
      setAccounts(data.users);
      setTotal(data.total);
    } catch {
      toast.error("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, [page, search]);

  const handleSearch = () => {
    setSearch(searchInput);
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

  const totalPages = Math.ceil(total / limit);

  const typeBadge = (type: string) => {
    if (type === "ADMIN") return <Badge className="bg-red-500/20 text-red-400 border-0">Admin</Badge>;
    if (type === "SELLER") return <Badge className="bg-purple-500/20 text-purple-400 border-0">Seller</Badge>;
    return <Badge className="bg-blue-500/20 text-blue-400 border-0">Buyer</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý tài khoản</h1>
          <p className="text-white/50 text-sm mt-0.5">{total} tài khoản</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Tìm theo tên, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-64 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
          <Button size="sm" onClick={handleSearch} className="bg-white/10 hover:bg-white/20">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-white/5 border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-white/50 text-sm font-medium">Người dùng</th>
                  <th className="px-4 py-3 text-white/50 text-sm font-medium">Loại</th>
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
                        <p className="text-white/40 text-xs">{acc.email}</p>
                        {acc.sellerProfile && (
                          <p className="text-purple-400/70 text-xs">{acc.sellerProfile.storeName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{typeBadge(acc.userType)}</td>
                    <td className="px-4 py-3 text-white/70 text-sm">{acc._count.orders}</td>
                    <td className="px-4 py-3 text-white/70 text-sm">{acc._count.reviews}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">
                      {new Date(acc.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
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
          <p className="text-white/40 text-sm">Trang {page} / {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
    </div>
  );
}
