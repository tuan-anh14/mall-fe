import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  TrendingUp,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  ArrowRightCircle,
  Banknote,
  DollarSign,
  Briefcase,
  History,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { toast } from "sonner";
import { walletService, WalletInfo, WalletTransaction } from "../../services/wallet.service";
import { formatCurrency } from "../../lib/currency";

interface WalletDashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

const TX_ICON_STYLES: Record<string, { icon: any; color: string; bg: string }> = {
  DEPOSIT: { icon: ArrowDownCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  PAYMENT: { icon: ArrowUpCircle, color: "text-red-500", bg: "bg-red-50" },
  REFUND: { icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-50" },
  ADJUSTMENT: { icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
  WITHDRAW: { icon: ArrowRightCircle, color: "text-orange-600", bg: "bg-orange-50" },
  SELLER_INCOME: { icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  SELLER_FEE_DEDUCTED: { icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
};

const TX_LABELS: Record<string, string> = {
  DEPOSIT: "Nạp tiền",
  PAYMENT: "Thanh toán",
  REFUND: "Hoàn tiền trả hàng",
  ADJUSTMENT: "Điều chỉnh",
  WITHDRAW: "Rút tiền",
  SELLER_INCOME: "Doanh thu",
  SELLER_FEE_DEDUCTED: "Phí sàn (5%)",
  SELLER_REFUND_DEDUCTED: "Khấu trừ hoàn tiền",
};

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  COMPLETED: { label: "Thành công", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PENDING: { label: "Đang xử lý", class: "bg-amber-50 text-amber-700 border-amber-200" },
  FAILED: { label: "Thất bại", class: "bg-red-50 text-red-700 border-red-200" },
  CANCELLED: { label: "Đã hủy", class: "bg-gray-50 text-gray-500 border-gray-200" },
};

export function WalletDashboard({ onNavigate }: WalletDashboardProps) {
  const { user, checkAuth } = useAuth();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Deposit states
  const [depositAmount, setDepositAmount] = useState("");
  const [depositGateway, setDepositGateway] = useState<"VNPAY">("VNPAY");
  const [isDepositing, setIsDepositing] = useState(false);

  // Withdraw states
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    bankAccount: "",
    accountHolder: ""
  });

  const [showBalance, setShowBalance] = useState(true);

  const fetchWalletData = useCallback(async () => {
    try {
      const [walletData, statsData] = await Promise.all([
        walletService.getWallet(),
        walletService.getStats()
      ]);
      setWallet(walletData);
      setStats(statsData);
    } catch {
      toast.error("Không thể tải thông tin ví");
    }
  }, []);

  const fetchTransactions = useCallback(async (p: number) => {
    try {
      const data = await walletService.getTransactions(p, 15);
      setTransactions(data.transactions);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Không thể tải lịch sử giao dịch");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.allSettled([checkAuth(), fetchWalletData(), fetchTransactions(1)]);
      setLoading(false);
    };
    init();
  }, [fetchWalletData, fetchTransactions]);

  useEffect(() => {
    fetchTransactions(page);
  }, [page, fetchTransactions]);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 10000) {
      toast.error("Vui lòng nhập số tiền tối thiểu 10.000 ₫");
      return;
    }
    if (amount > 50000000) {
      toast.error("Số tiền nạp tối đa 50.000.000 ₫");
      return;
    }

    setIsDepositing(true);
    try {
      // In production, returnUrl should be set to current page
      const returnUrl = window.location.origin + "/wallet";
      const result = await walletService.createDeposit(amount, depositGateway, returnUrl);

      toast.info(`Đang chuyển hướng đến ${depositGateway}...`);

      // Redirect to VNPay/MoMo
      window.location.href = result.paymentUrl;
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo giao dịch nạp tiền");
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 50000) {
      toast.error("Số tiền rút tối thiểu là 50.000 ₫");
      return;
    }
    if (amount > balance) {
      toast.error("Số dư ví không đủ");
      return;
    }
    if (!bankInfo.bankName || !bankInfo.bankAccount) {
      toast.error("Vui lòng nhập đầy đủ thông tin ngân hàng");
      return;
    }

    setIsWithdrawing(true);
    try {
      await walletService.withdraw({
        amount,
        ...bankInfo
      });
      toast.success("Yêu cầu rút tiền đã được thực hiện thành công!");
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      fetchWalletData();
      fetchTransactions(1);
    } catch (err: any) {
      toast.error(err.message || "Không thể thực hiện yêu cầu rút tiền");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Handle Return Parameters
  useEffect(() => {
    const handleReturn = async () => {
      const search = window.location.search;
      if (!search.includes("vnp_ResponseCode")) return;

      const params = new URLSearchParams(search);
      const vnpResponseCode = params.get("vnp_ResponseCode");

      try {
        await walletService.verifyVnpayCallback(search);

        if (vnpResponseCode === "00") {
          toast.success("Nạp tiền thành công!");
        } else if (vnpResponseCode === "24") {
          toast.info("Đã hủy thanh toán Nạp tiền!");
        } else {
          toast.error(`Nạp tiền thất bại (Mã lỗi: ${vnpResponseCode})`);
        }
      } catch (err) {
        toast.error("Quá trình xác thực nạp tiền gặp lỗi.");
      } finally {
        fetchWalletData();
        fetchTransactions(1);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleReturn();
  }, [fetchWalletData, fetchTransactions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-600/30 border-t-blue-600 animate-spin" />
          <p className="text-gray-400 text-sm">Đang tải ví...</p>
        </div>
      </div>
    );
  }

  const balance = wallet?.balance ?? 0;

  const isSeller = user?.userType?.toLowerCase() === "seller";

  const quickStats = [
    ...(isSeller ? [
      {
        label: "Tổng thu",
        value: stats?.totalIncome ?? 0,
        color: "text-emerald-700",
        iconColor: "text-emerald-600 bg-emerald-50",
        icon: TrendingUp,
      },
      {
        label: "Phí sàn (5%)",
        value: stats?.totalFees ?? 0,
        color: "text-indigo-600",
        iconColor: "text-indigo-600 bg-indigo-50",
        icon: Briefcase,
      },
    ] : []),
    {
      label: "Đã nạp qua VNPAY",
      value: stats?.totalDeposited ?? 0,
      color: "text-emerald-600",
      iconColor: "text-emerald-600 bg-emerald-50",
      icon: ArrowDownCircle,
    },
    {
      label: "Đã chi tiêu",
      value: stats?.totalSpent ?? 0,
      color: "text-red-600",
      iconColor: "text-red-500 bg-red-50",
      icon: ArrowUpCircle,
    },
    {
      label: "Đã rút",
      value: stats?.totalWithdrawn ?? 0,
      color: "text-orange-600",
      iconColor: "text-orange-600 bg-orange-50",
      icon: Banknote,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 lg:py-10 max-w-4xl">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Ví của tôi</h1>
            <p className="text-gray-500 text-sm mt-0.5">Quản lý số dư và giao dịch</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowWithdrawModal(true)}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl h-10 font-medium"
            >
              <ArrowRightCircle className="h-4 w-4 mr-1.5" />
              Rút tiền
            </Button>
            <Button
              onClick={() => setShowDepositModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 font-medium shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Nạp tiền
            </Button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 mb-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 shadow-xl shadow-blue-900/15">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium tracking-wide uppercase">Số dư khả dụng</p>
                  <p className="text-white/80 text-sm">Shop HUB Wallet</p>
                </div>
              </div>
              <button
                onClick={() => setShowBalance(v => !v)}
                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                {showBalance ? <EyeOff className="h-4 w-4 text-white/70" /> : <Eye className="h-4 w-4 text-white/70" />}
              </button>
            </div>

            <div className="mb-8">
              <span className="text-4xl lg:text-5xl font-bold text-white tabular-nums tracking-tight">
                {showBalance ? formatCurrency(balance) : "••••••••"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-white/50 text-xs">
                Cập nhật lần cuối: {wallet ? new Date(wallet.updatedAt).toLocaleDateString("vi-VN") : "—"}
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-white/40" />
                <span className="text-white/40 text-xs">Digital Wallet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`grid grid-cols-2 ${isSeller ? "lg:grid-cols-5" : "lg:grid-cols-3"} gap-3 mb-6`}>
          {quickStats.map(({ label, value, color, iconColor, icon: Icon }) => (
            <div key={label} className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{label}</span>
              </div>
              <p className={`text-base font-black tabular-nums ${color}`}>
                {formatCurrency(value)}
              </p>
            </div>
          ))}
        </div>

        {/* Transaction History */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 lg:p-6 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Lịch sử giao dịch</h2>
            <p className="text-gray-400 text-xs mt-0.5">{transactions.length > 0 ? `${transactions.length} giao dịch gần nhất` : "Chưa có giao dịch"}</p>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-semibold mb-1">Chưa có giao dịch</p>
              <p className="text-gray-400 text-sm mb-5">Nạp tiền để bắt đầu sử dụng ví</p>
              <Button
                onClick={() => setShowDepositModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 font-medium shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Nạp tiền ngay
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((txn) => {
                const isIn = ["DEPOSIT", "REFUND", "SELLER_INCOME"].includes(txn.type) || (txn.type === "ADJUSTMENT" && txn.amount > 0);
                const statusInfo = STATUS_BADGE[txn.status];
                const iconStyle = TX_ICON_STYLES[txn.type] ?? TX_ICON_STYLES.ADJUSTMENT;
                const TxIcon = iconStyle.icon;
                return (
                  <div
                    key={txn.id}
                    className="flex items-center gap-3.5 px-5 lg:px-6 py-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconStyle.bg}`}>
                      <TxIcon className={`h-[18px] w-[18px] ${iconStyle.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 text-sm font-semibold">
                          {txn.title || TX_LABELS[txn.type] || "Giao dịch ví"}
                        </p>
                        <Badge variant="secondary" className={`text-[10px] font-medium px-1.5 py-0 h-5 ${statusInfo?.class}`}>
                          {statusInfo?.label}
                        </Badge>
                      </div>
                      {txn.description && (
                        <p className="text-gray-400 text-xs truncate mt-0.5">{txn.description}</p>
                      )}
                      <p className="text-gray-300 text-[11px] mt-0.5">
                        {new Date(txn.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className={`text-sm font-bold tabular-nums ${isIn ? "text-emerald-600" : "text-red-500"}`}>
                        {isIn ? "+" : "−"}{formatCurrency(txn.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 px-5 py-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-gray-500 text-xs font-medium tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Deposit Modal */}
        <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
          <DialogContent className="bg-white border-gray-200/80 max-w-md rounded-2xl p-0 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-6 pb-5">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2.5 text-lg">
                  <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                  Nạp tiền vào ví
                </DialogTitle>
                <DialogDescription className="text-white/60 text-sm">
                  Chọn số tiền và phương thức thanh toán
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="space-y-5 px-6 py-5">
              {/* Quick amounts */}
              <div>
                <Label className="text-gray-700 text-sm font-medium mb-2.5 block">Số tiền nhanh</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[20000, 50000, 100000, 200000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setDepositAmount(String(amt))}
                      className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${depositAmount === String(amt)
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                    >
                      {formatCurrency(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deposit-amount" className="text-sm font-medium">Số tiền tùy chỉnh (VNĐ)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  min="10000"
                  max="50000000"
                  step="1000"
                  placeholder="Nhập số tiền (tối thiểu 10.000 ₫)..."
                  className="bg-gray-50/50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2.5 block">Phương thức thanh toán</Label>
                <div className="grid grid-cols-1 gap-3">
                  {(["VNPAY"] as const).map((gw) => (
                    <button
                      key={gw}
                      onClick={() => setDepositGateway(gw)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 ${depositGateway === gw
                        ? "border-blue-500 bg-blue-50/80 shadow-sm shadow-blue-500/10"
                        : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                    >
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-lg bg-red-50`}>
                        🏦
                      </div>
                      <div className="text-left">
                        <p className="text-gray-900 text-sm font-semibold">{gw}</p>
                        <p className="text-gray-400 text-xs">
                          Internet Banking & Ví điện tử
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {depositAmount && parseFloat(depositAmount) > 0 && (
                <div className="bg-gray-50/80 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Số tiền nạp</span>
                    <span className="text-gray-900 font-semibold tabular-nums">{formatCurrency(parseFloat(depositAmount))}</span>
                  </div>
                  <Separator className="bg-gray-200" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Số dư sau nạp</span>
                    <span className="text-emerald-600 font-bold tabular-nums">
                      {formatCurrency(balance + parseFloat(depositAmount))}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-11 font-medium"
                  onClick={() => setShowDepositModal(false)}
                  disabled={isDepositing}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none transition-all"
                  onClick={handleDeposit}
                  disabled={isDepositing || !depositAmount || parseFloat(depositAmount) < 10000}
                >
                  {isDepositing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </span>
                  ) : `Nạp ${formatCurrency(parseFloat(depositAmount || "0"))}`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Withdraw Modal */}
        <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
          <DialogContent className="bg-white border-gray-200/80 max-w-md rounded-2xl p-0 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 pt-6 pb-5">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2.5 text-lg">
                  <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <ArrowRightCircle className="h-4 w-4 text-white" />
                  </div>
                  Rút tiền về tài khoản
                </DialogTitle>
                <DialogDescription className="text-white/60 text-sm">
                  Nhập số tiền và thông tin nhận thanh toán
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex gap-3 text-amber-800 text-xs shadow-sm">
                <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p>Tiền sẽ được chuyển vào tài khoản ngân hàng của bạn trong vòng 24h làm việc.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="withdraw-amount" className="text-sm font-medium">Số tiền rút (VNĐ)</Label>
                <div className="relative">
                  <Input
                    id="withdraw-amount"
                    type="number"
                    min="50000"
                    placeholder="Tối thiểu 50.000 ₫..."
                    className="bg-gray-50/50 border-gray-200 rounded-xl h-11 pl-10 focus:ring-2 focus:ring-blue-500/20"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <Banknote className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                </div>
                <div className="flex justify-between mt-1 px-1">
                  <p className="text-[10px] text-gray-400">Số dư hiện tại: {formatCurrency(balance)}</p>
                  <button
                    onClick={() => setWithdrawAmount(String(balance))}
                    className="text-[10px] text-blue-600 font-bold hover:underline"
                  >
                    Rút tất cả
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Thông tin ngân hàng</Label>
                  <div className="space-y-3">
                    <Input
                      placeholder="Tên ngân hàng (e.g. MB Bank, VCB...)"
                      className="bg-gray-50/50 border-gray-200 rounded-xl h-10 text-sm"
                      value={bankInfo.bankName}
                      onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                    />
                    <Input
                      placeholder="Số tài khoản"
                      className="bg-gray-50/50 border-gray-200 rounded-xl h-10 text-sm"
                      value={bankInfo.bankAccount}
                      onChange={(e) => setBankInfo({ ...bankInfo, bankAccount: e.target.value })}
                    />
                    <Input
                      placeholder="Tên chủ tài khoản (In hoa không dấu)"
                      className="bg-gray-50/50 border-gray-200 rounded-xl h-10 text-sm"
                      value={bankInfo.accountHolder}
                      onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-11 font-medium"
                  onClick={() => setShowWithdrawModal(false)}
                  disabled={isWithdrawing}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold shadow-lg shadow-blue-600/20"
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) < 50000}
                >
                  {isWithdrawing ? "Đang xử lý..." : "Xác nhận rút"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
