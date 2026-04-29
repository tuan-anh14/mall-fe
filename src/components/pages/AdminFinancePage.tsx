import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ShieldCheck,
  Undo2,
  AlertCircle,
  TrendingUp,
  Package,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  Info,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner";
import { financeService, EscrowOrder, EscrowStats } from "../../services/finance.service";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function AdminFinancePage() {
  const [orders, setOrders] = useState<EscrowOrder[]>([]);
  const [stats, setStats] = useState<EscrowStats | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "RELEASE" | "REFUND" | null;
    orderId: string | null;
  }>({ open: false, type: null, orderId: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, ordersData] = await Promise.all([
        financeService.getStats(),
        financeService.getEscrowOrders(page, 10),
      ]);
      setStats(statsData);
      setOrders(ordersData.orders);
      setTotal(ordersData.total);
      setTotalPages(ordersData.totalPages);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải dữ liệu tài chính");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleForceRelease = async (orderId: string) => {
    setConfirmModal({ open: true, type: "RELEASE", orderId });
  };

  const handleForceRefund = async (orderId: string) => {
    setConfirmModal({ open: true, type: "REFUND", orderId });
  };

  const executeAction = async () => {
    const { type, orderId } = confirmModal;
    if (!orderId || !type) return;

    setConfirmModal((prev) => ({ ...prev, open: false }));
    setIsProcessing(orderId);
    try {
      if (type === "RELEASE") {
        await financeService.forceRelease(orderId);
        toast.success("Giải ngân cưỡng bức thành công!");
      } else {
        await financeService.forceRefund(orderId);
        toast.success("Hoàn tiền cưỡng bức thành công!");
      }
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xử lý thao tác");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <AdminPageLayout
      title="Quản lý Tài chính (Escrow)"
      description="Quản lý quỹ tạm giữ và quyết toán doanh thu hệ thống"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600/80 uppercase tracking-wider">Tổng quỹ Escrow</p>
              <h3 className="mt-1 text-3xl font-bold text-gray-900">
                {stats ? formatCurrency(stats.escrowBalance) : "0 ₫"}
              </h3>
            </div>
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-blue-600/70">
            <Info className="mr-1 h-3 w-3" />
            Tổng tiền khách đã trả đang nằm ở Sàn
          </div>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/50 to-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600/80 uppercase tracking-wider">Chờ quyết toán</p>
              <h3 className="mt-1 text-3xl font-bold text-gray-900">
                {stats ? stats.escrowOrdersCount : 0} <span className="text-lg font-medium text-gray-400">đơn</span>
              </h3>
            </div>
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-amber-600/70">
            <TrendingUp className="mr-1 h-3 w-3" />
            Đơn đã giao nhưng chưa trả tiền Shop
          </div>
        </div>

        <div className="hidden lg:block rounded-3xl border border-gray-100 bg-white p-6 shadow-sm border-dashed">
          <div className="flex h-full items-center justify-center text-center text-gray-400">
            <div>
              <DollarSign className="mx-auto h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm italic">Hệ thống Escrow tự động bảo vệ giao dịch</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className={adminPanelClass}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h4 className="font-semibold text-gray-900">Danh sách chờ quyết toán</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-gray-400 hover:text-gray-600">
                  <Filter className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Lọc dữ liệu</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className={adminTheadRowClass}>
                <th className={adminThClass}>Mã đơn hàng</th>
                <th className={adminThClass}>Khách hàng</th>
                <th className={adminThClass}>Cửa hàng</th>
                <th className={`${adminThClass} text-right`}>Tổng tiền</th>
                <th className={adminThClass}>Trạng thái đơn</th>
                <th className={`${adminThClass} text-right`}>Thao tác cưỡng bức</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <AdminSpinner className="min-h-[20rem]" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400">
                    <Package className="mx-auto h-12 w-12 mb-3 opacity-20" />
                    <p>Hiện không có đơn hàng nào chờ quyết toán</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className={adminTrClass}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-mono text-sm font-semibold text-gray-900">
                        {order.id}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a href={`/order-tracking?orderId=${order.id}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết đơn</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-400">Cập nhật: {new Date(order.updatedAt).toLocaleString("vi-VN")}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {order.customer.firstName} {order.customer.lastName}
                      </div>
                      <div className="text-xs text-gray-400">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {order.seller.storeName}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-gray-900 tabular-nums">
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleForceRefund(order.id)}
                          disabled={isProcessing === order.id}
                        >
                          <Undo2 className="mr-1.5 h-3.5 w-3.5" />
                          Hoàn tiền
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                          onClick={() => handleForceRelease(order.id)}
                          disabled={isProcessing === order.id}
                        >
                          <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                          Giải ngân
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

      {/* Admin Policy Notice */}
      <div className="mt-8 rounded-2xl bg-amber-50/50 border border-amber-100 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Lưu ý cho Quản trị viên</p>
            <p className="mt-1 text-xs text-amber-700/80 leading-relaxed">
              Các thao tác <strong>Cưỡng bức</strong> sẽ bỏ qua luồng tự động của hệ thống và ảnh hưởng trực tiếp đến ví của người dùng. 
              Vui lòng chỉ sử dụng sau khi đã xác minh kỹ các bằng chứng hoặc xử lý tranh chấp giữa Shop và Khách hàng.
              Mọi thao tác đều được lưu lại trong <strong>Lịch sử hoạt động (Audit Log)</strong>.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={confirmModal.open} onOpenChange={(open) => setConfirmModal(p => ({ ...p, open }))}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {confirmModal.type === "RELEASE" ? (
                <>
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  Xác nhận Giải ngân
                </>
              ) : (
                <>
                  <Undo2 className="h-6 w-6 text-red-600" />
                  Xác nhận Hoàn tiền
                </>
              )}
            </DialogTitle>
            <DialogDescription className="py-4">
              {confirmModal.type === "RELEASE" ? (
                <>
                  Bạn có chắc chắn muốn <strong>GIẢI NGÂN cưỡng bức</strong> cho đơn hàng{" "}
                  <code className="bg-gray-100 px-1 rounded font-mono text-gray-900">{confirmModal.orderId}</code>?
                  <br /><br />
                  Tiền sẽ được chuyển ngay lập tức từ quỹ tạm giữ vào ví của người bán.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn <strong>HOÀN TIỀN cưỡng bức</strong> cho đơn hàng{" "}
                  <code className="bg-gray-100 px-1 rounded font-mono text-gray-900">{confirmModal.orderId}</code>?
                  <br /><br />
                  Tiền sẽ được trả lại ví của khách hàng và đơn hàng sẽ bị hủy.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" className="rounded-xl" onClick={() => setConfirmModal(p => ({ ...p, open: false }))}>
              Hủy bỏ
            </Button>
            <Button 
              className={`rounded-xl px-6 ${confirmModal.type === "RELEASE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"} text-white shadow-lg`}
              onClick={executeAction}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
}
