import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Wallet,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { walletService } from "../../services/wallet.service";
import { formatCurrency } from "../../lib/currency";

export function AdminWalletPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await walletService.adminGetWallets(page, 20, search || undefined);
      setWallets(data.wallets);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Không thể tải danh sách ví");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const openAdjust = async (wallet: any) => {
    try {
      const detail = await walletService.adminGetWallet(wallet.user.id) as any;
      setSelectedWallet(detail);
      setAdjustAmount("");
      setAdjustReason("");
      setShowAdjustModal(true);
    } catch {
      toast.error("Không thể tải thông tin ví");
    }
  };

  const handleAdjust = async () => {
    if (!selectedWallet) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount === 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ (khác 0)");
      return;
    }
    if (!adjustReason.trim()) {
      toast.error("Vui lòng nhập lý do điều chỉnh");
      return;
    }

    setIsAdjusting(true);
    try {
      const result = await walletService.adminAdjust(
        selectedWallet.user.id,
        amount,
        adjustReason.trim()
      ) as any;
      toast.success(
        `Điều chỉnh thành công. Số dư mới: ${formatCurrency(result.newBalance)}`
      );
      setShowAdjustModal(false);
      fetchWallets();
    } catch (err: any) {
      toast.error(err.message || "Điều chỉnh thất bại");
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900">Quản lý Ví</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tổng cộng {total} ví người dùng
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm theo email, số điện thoại, tên..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9 bg-gray-50 border-gray-200"
          />
        </div>
        <Button onClick={handleSearch} className="bg-gradient-to-r from-blue-600 to-blue-600">
          <Search className="h-4 w-4 mr-2" />
          Tìm kiếm
        </Button>
        {search && (
          <Button
            variant="ghost"
            onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 text-gray-500 text-sm font-medium">Người dùng</th>
              <th className="text-left p-4 text-gray-500 text-sm font-medium">Email</th>
              <th className="text-right p-4 text-gray-500 text-sm font-medium">Số dư</th>
              <th className="text-right p-4 text-gray-500 text-sm font-medium">Giao dịch</th>
              <th className="text-right p-4 text-gray-500 text-sm font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  <div className="w-8 h-8 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto" />
                </td>
              </tr>
            ) : wallets.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-400">
                  <Wallet className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  Không tìm thấy ví
                </td>
              </tr>
            ) : (
              wallets.map((w) => (
                <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-900 text-sm">
                          {w.user.firstName} {w.user.lastName}
                        </p>
                        <p className="text-gray-400 text-xs capitalize">{w.user.userType.toLowerCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{w.user.email}</td>
                  <td className="p-4 text-right">
                    <span className="text-gray-900 font-medium">{formatCurrency(w.balance)}</span>
                  </td>
                  <td className="p-4 text-right text-gray-500 text-sm">
                    {w.transactionCount}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openAdjust(w)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/20"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                      Điều chỉnh
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <p className="text-gray-400 text-sm">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
        <DialogContent className="bg-white border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-blue-400" />
              Điều chỉnh số dư ví
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Nhập số tiền dương để cộng tiền, số âm để trừ tiền
            </DialogDescription>
          </DialogHeader>

          {selectedWallet && (
            <div className="space-y-4 mt-2">
              {/* User Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-900 text-sm font-medium">
                  {selectedWallet.user.firstName} {selectedWallet.user.lastName}
                </p>
                <p className="text-gray-500 text-sm">{selectedWallet.user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Wallet className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-900 font-medium">
                    Số dư hiện tại: {formatCurrency(selectedWallet.balance)}
                  </span>
                </div>
              </div>

              <Separator className="bg-gray-200" />

              {/* Amount input */}
              <div>
                <Label>Số tiền điều chỉnh (VNĐ)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ví dụ: 50 (cộng) hoặc -20 (trừ)"
                  className="bg-gray-50 border-gray-200 mt-1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
                {adjustAmount && !isNaN(parseFloat(adjustAmount)) && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    {parseFloat(adjustAmount) > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-gray-500">Số dư sau điều chỉnh: </span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(Math.max(0, selectedWallet.balance + parseFloat(adjustAmount)))}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <Label>Lý do <span className="text-red-400">*</span></Label>
                <Input
                  placeholder="Ví dụ: Chuyển khoản ngân hàng #ABCDEF"
                  className="bg-gray-50 border-gray-200 mt-1"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 border border-gray-200"
                  onClick={() => setShowAdjustModal(false)}
                  disabled={isAdjusting}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-600"
                  onClick={handleAdjust}
                  disabled={isAdjusting || !adjustAmount || !adjustReason.trim()}
                >
                  {isAdjusting ? "Đang xử lý..." : "Xác nhận điều chỉnh"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
