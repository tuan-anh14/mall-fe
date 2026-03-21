import { useState, useEffect, useCallback } from "react";
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

const TX_ICON_STYLES: Record<string, { icon: typeof ArrowDownCircle; color: string; bg: string }> = {
  DEPOSIT: { icon: ArrowDownCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  PAYMENT: { icon: ArrowUpCircle, color: "text-red-500", bg: "bg-red-50" },
  REFUND: { icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-50" },
  ADJUSTMENT: { icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
};

const TX_LABELS: Record<string, string> = {
  DEPOSIT: "Nạp tiền",
  PAYMENT: "Thanh toán",
  REFUND: "Hoàn tiền",
  ADJUSTMENT: "Điều chỉnh",
};

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  COMPLETED: { label: "Thành công", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PENDING: { label: "Đang xử lý", class: "bg-amber-50 text-amber-700 border-amber-200" },
  FAILED: { label: "Thất bại", class: "bg-red-50 text-red-700 border-red-200" },
  CANCELLED: { label: "Đã hủy", class: "bg-gray-50 text-gray-500 border-gray-200" },
};

export function WalletDashboard({ onNavigate }: WalletDashboardProps) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositGateway, setDepositGateway] = useState<"VNPAY" | "MOMO">("VNPAY");
  const [isDepositing, setIsDepositing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const fetchWallet = useCallback(async () => {
    try {
      const data = await walletService.getWallet();
      setWallet(data);
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
      await Promise.allSettled([fetchWallet(), fetchTransactions(1)]);
      setLoading(false);
    };
    init();
  }, [fetchWallet, fetchTransactions]);

  useEffect(() => {
    fetchTransactions(page);
  }, [page, fetchTransactions]);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 1) {
      toast.error("Vui lòng nhập số tiền tối thiểu 1 ₫");
      return;
    }
    if (amount > 10000) {
      toast.error("Số tiền nạp tối đa 10.000 ₫");
      return;
    }

    setIsDepositing(true);
    try {
      const result = await walletService.createDeposit(amount, depositGateway);
      toast.info(`Đang chuyển hướng đến ${depositGateway}...`);

      // In sandbox: simulate immediate success after 1.5s
      setTimeout(async () => {
        try {
          await walletService.simulateDeposit(result.transactionId);
          await fetchWallet();
          await fetchTransactions(1);
          setPage(1);
          toast.success(`Nạp ${formatCurrency(amount)} thành công!`);
          setShowDepositModal(false);
          setDepositAmount("");
        } catch {
          toast.error("Giao dịch thất bại");
        }
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo giao dịch nạp tiền");
    } finally {
      setIsDepositing(false);
    }
  };

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

  const quickStats = [
    {
      label: "Tổng nạp",
      value: transactions.filter(t => t.type === "DEPOSIT" && t.status === "COMPLETED").reduce((s, t) => s + t.amount, 0),
      color: "text-emerald-700",
      iconColor: "text-emerald-600 bg-emerald-50",
      icon: ArrowDownCircle,
    },
    {
      label: "Đã thanh toán",
      value: transactions.filter(t => t.type === "PAYMENT").reduce((s, t) => s + t.amount, 0),
      color: "text-red-600",
      iconColor: "text-red-500 bg-red-50",
      icon: ArrowUpCircle,
    },
    {
      label: "Được hoàn",
      value: transactions.filter(t => t.type === "REFUND").reduce((s, t) => s + t.amount, 0),
      color: "text-blue-700",
      iconColor: "text-blue-600 bg-blue-50",
      icon: RefreshCw,
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
        <Button
          onClick={() => setShowDepositModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 font-medium shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Nạp tiền
        </Button>
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
                <p className="text-white/80 text-sm">Shop MALL Wallet</p>
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
      <div className="grid grid-cols-3 gap-3 mb-6">
        {quickStats.map(({ label, value, color, iconColor, icon: Icon }) => (
          <div key={label} className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconColor}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-gray-400 text-xs font-medium">{label}</span>
            </div>
            <p className={`text-lg font-bold tabular-nums ${color}`}>
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
              const isIn = txn.type === "DEPOSIT" || txn.type === "REFUND" || (txn.type === "ADJUSTMENT" && txn.amount > 0);
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
                        {TX_LABELS[txn.type]}
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
                {[10, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(String(amt))}
                    className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                      depositAmount === String(amt)
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
                min="1"
                max="10000"
                step="0.01"
                placeholder="Nhập số tiền..."
                className="bg-gray-50/50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2.5 block">Phương thức thanh toán</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["VNPAY", "MOMO"] as const).map((gw) => (
                  <button
                    key={gw}
                    onClick={() => setDepositGateway(gw)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 ${
                      depositGateway === gw
                        ? "border-blue-500 bg-blue-50/80 shadow-sm shadow-blue-500/10"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-lg ${gw === "VNPAY" ? "bg-red-50" : "bg-pink-50"}`}>
                      {gw === "VNPAY" ? "🏦" : "📱"}
                    </div>
                    <div className="text-left">
                      <p className="text-gray-900 text-sm font-semibold">{gw}</p>
                      <p className="text-gray-400 text-xs">
                        {gw === "VNPAY" ? "Internet Banking" : "Ví MoMo"}
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
                disabled={isDepositing || !depositAmount || parseFloat(depositAmount) < 1}
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
      </div>
    </div>
  );
}
