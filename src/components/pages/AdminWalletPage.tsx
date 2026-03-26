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
  History,
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
import {
  AdminPageLayout,
  AdminSpinner,
  adminPanelClass,
  adminTheadRowClass,
  adminThClass,
  adminTrClass,
  adminBtnPrimaryClass,
  AdminPagination,
} from "../admin/AdminPageLayout";

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
  
  // History Modal states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyWallet, setHistoryWallet] = useState<any>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await walletService.adminGetWallets(page, 10, search || undefined);
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

  const fetchHistory = useCallback(async () => {
    if (!historyWallet) return;
    setHistoryLoading(true);
    try {
      const data = await walletService.adminGetTransactions(historyWallet.user.id, historyPage, 10);
      setHistoryLogs(data.transactions);
      setHistoryTotal(data.total);
      setHistoryTotalPages(data.totalPages);
    } catch {
      toast.error("Không thể tải lịch sử giao dịch");
    } finally {
      setHistoryLoading(false);
    }
  }, [historyWallet, historyPage]);

  useEffect(() => {
    if (showHistoryModal) {
      fetchHistory();
    }
  }, [fetchHistory, showHistoryModal]);

  const openHistory = (wallet: any) => {
    setHistoryWallet(wallet);
    setHistoryPage(1);
    setShowHistoryModal(true);
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
    <AdminPageLayout
      title="Quản lý ví người dùng"
      description={`${total.toLocaleString("vi-VN")} ví trong hệ thống`}
    >
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
        <div className="relative min-w-[200px] max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm theo email, số điện thoại, tên..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="rounded-xl border-gray-200 bg-gray-50 pl-9"
          />
        </div>
        <Button onClick={handleSearch} className={adminBtnPrimaryClass}>
          <Search className="mr-2 h-4 w-4" />
          Tìm kiếm
        </Button>
        {search ? (
          <Button
            variant="ghost"
            className="rounded-xl text-gray-600"
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
          >
            Xóa bộ lọc
          </Button>
        ) : null}
      </div>

      <div className={adminPanelClass}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className={adminTheadRowClass}>
              <th className={adminThClass}>Người dùng</th>
              <th className={adminThClass}>Email</th>
              <th className={`${adminThClass} text-right`}>Số dư</th>
              <th className={`${adminThClass} text-right`}>Giao dịch</th>
              <th className={`${adminThClass} text-right`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <AdminSpinner className="min-h-[14rem]" />
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
                <tr key={w.id} className={adminTrClass}>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/90">
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
                  <td className="px-4 py-4 text-sm text-gray-600 sm:px-6">{w.user.email}</td>
                  <td className="px-4 py-4 text-right sm:px-6">
                    <span className="font-medium tabular-nums text-gray-900">{formatCurrency(w.balance)}</span>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-gray-500 sm:px-6">
                    {w.transactionCount}
                  </td>
                  <td className="px-4 py-4 text-right sm:px-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openHistory(w)}
                        className="rounded-xl border border-gray-100 text-gray-500 hover:text-primary hover:bg-blue-50"
                        title="Xem lịch sử giao dịch"
                      >
                        <History className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAdjust(w)}
                        className="rounded-xl border-blue-200 text-primary hover:bg-blue-50"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                        Điều chỉnh
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          setCurrentPage={setPage}
          totalItems={total}
        />
      </div>

      {/* Adjust Modal */}
      <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
        <DialogContent className="bg-white border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              Điều chỉnh số dư ví
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Nhập số tiền dương để cộng tiền, số âm để trừ tiền
            </DialogDescription>
          </DialogHeader>

          {selectedWallet && (
            <div className="space-y-4 mt-2">
              {/* User Info */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/90 p-4">
                <p className="text-gray-900 text-sm font-medium">
                  {selectedWallet.user.firstName} {selectedWallet.user.lastName}
                </p>
                <p className="text-gray-500 text-sm">{selectedWallet.user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Wallet className="h-4 w-4 text-primary" />
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
                  className={`flex-1 ${adminBtnPrimaryClass}`}
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

      {/* Wallet History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="bg-white border-gray-200 max-w-2xl sm:max-w-3xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2 text-gray-900 border-b pb-4">
              <History className="h-5 w-5 text-primary" />
              Lịch sử giao dịch ví
            </DialogTitle>
            {historyWallet && (
              <div className="mt-2 space-y-1">
                <p className="text-gray-900 font-medium">
                  {historyWallet.user.firstName} {historyWallet.user.lastName}
                </p>
                <p className="text-gray-500 text-sm">
                  {historyWallet.user.email} • Số dư: <span className="font-bold text-primary">{formatCurrency(historyWallet.balance)}</span>
                </p>
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col px-6">
            <div className="flex-1 overflow-y-auto min-h-0 border rounded-xl">
              {historyLoading ? (
                <div className="h-full flex items-center justify-center py-20">
                  <AdminSpinner />
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-gray-400">
                  <History className="h-10 w-10 mb-2 opacity-20" />
                  <p>Không có lịch sử giao dịch</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-700">Thời gian</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Loại</th>
                      <th className="px-4 py-3 font-semibold text-right text-gray-700">Số tiền</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Trạng thái</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Mô tả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historyLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                          {new Date(log.createdAt).toLocaleString("vi-VN")}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            log.type === "DEPOSIT" ? "bg-emerald-50 text-emerald-600" :
                            log.type === "PAYMENT" ? "bg-blue-50 text-blue-600" :
                            log.type === "REFUND" ? "bg-indigo-50 text-indigo-600" :
                            "bg-amber-50 text-amber-600"
                          }`}>
                            {log.type === "DEPOSIT" ? "Nạp tiền" :
                             log.type === "PAYMENT" ? "Thanh toán" :
                             log.type === "REFUND" ? "Hoàn tiền" : "Điều chỉnh"}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          ["DEPOSIT", "REFUND"].includes(log.type) || (log.type === "ADJUSTMENT" && log.amount > 0) 
                            ? "text-emerald-600" : "text-red-500"
                        }`}>
                          {["DEPOSIT", "REFUND"].includes(log.type) || (log.type === "ADJUSTMENT" && log.amount > 0) ? "+" : "-"}
                          {formatCurrency(Math.abs(log.amount))}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className={
                            log.status === "COMPLETED" ? "text-emerald-500" :
                            log.status === "PENDING" ? "text-amber-500" : "text-red-500"
                          }>
                            {log.status === "COMPLETED" ? "Thành công" :
                             log.status === "PENDING" ? "Đang xử lý" : "Thất bại"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={log.description}>
                          {log.description || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="py-4 mt-auto">
               <AdminPagination 
                  currentPage={historyPage}
                  totalPages={historyTotalPages}
                  setCurrentPage={setHistoryPage}
                  totalItems={historyTotal}
               />
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50/50 flex justify-end">
            <Button variant="ghost" className="rounded-xl border border-gray-200" onClick={() => setShowHistoryModal(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
}
