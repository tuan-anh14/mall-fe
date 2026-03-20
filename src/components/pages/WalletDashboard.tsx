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

const TX_ICONS: Record<string, React.ReactNode> = {
  DEPOSIT: <ArrowDownCircle className="h-5 w-5 text-green-400" />,
  PAYMENT: <ArrowUpCircle className="h-5 w-5 text-red-400" />,
  REFUND: <RefreshCw className="h-5 w-5 text-blue-400" />,
  ADJUSTMENT: <TrendingUp className="h-5 w-5 text-yellow-400" />,
};

const TX_LABELS: Record<string, string> = {
  DEPOSIT: "Nạp tiền",
  PAYMENT: "Thanh toán",
  REFUND: "Hoàn tiền",
  ADJUSTMENT: "Điều chỉnh",
};

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  COMPLETED: { label: "Thành công", class: "bg-green-500/20 text-green-400" },
  PENDING: { label: "Đang xử lý", class: "bg-yellow-500/20 text-yellow-400" },
  FAILED: { label: "Thất bại", class: "bg-red-500/20 text-red-400" },
  CANCELLED: { label: "Đã hủy", class: "bg-foreground/10 text-muted-foreground" },
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
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  const balance = wallet?.balance ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl text-foreground mb-8">Ví của tôi</h1>

      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-2xl p-8 mb-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-foreground/5" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-foreground/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-foreground/20 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Số dư khả dụng</p>
              <p className="text-foreground text-xs">ShopHub Wallet</p>
            </div>
          </div>

          <div className="mb-8">
            <span className="text-5xl font-light text-foreground">
              {formatCurrency(balance)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              Cập nhật: {wallet ? new Date(wallet.updatedAt).toLocaleDateString("vi-VN") : "—"}
            </div>
            <Button
              onClick={() => setShowDepositModal(true)}
              className="bg-foreground/20 hover:bg-white/30 text-foreground border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nạp tiền
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Tổng nạp",
            value: transactions.filter(t => t.type === "DEPOSIT" && t.status === "COMPLETED").reduce((s, t) => s + t.amount, 0),
            color: "text-green-400",
            icon: <ArrowDownCircle className="h-5 w-5 text-green-400" />,
          },
          {
            label: "Đã thanh toán",
            value: transactions.filter(t => t.type === "PAYMENT").reduce((s, t) => s + t.amount, 0),
            color: "text-red-400",
            icon: <ArrowUpCircle className="h-5 w-5 text-red-400" />,
          },
          {
            label: "Được hoàn",
            value: transactions.filter(t => t.type === "REFUND").reduce((s, t) => s + t.amount, 0),
            color: "text-blue-400",
            icon: <RefreshCw className="h-5 w-5 text-blue-400" />,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-foreground/5 border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              {stat.icon}
              <span className="text-muted-foreground text-xs">{stat.label}</span>
            </div>
            <p className={`text-xl font-medium ${stat.color}`}>
              {formatCurrency(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="bg-foreground/5 border border-border rounded-2xl p-6">
        <h2 className="text-lg text-foreground mb-4">Lịch sử giao dịch</h2>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn) => {
              const isIn = txn.type === "DEPOSIT" || txn.type === "REFUND" || (txn.type === "ADJUSTMENT" && txn.amount > 0);
              const statusInfo = STATUS_BADGE[txn.status];
              return (
                <div
                  key={txn.id}
                  className="flex items-center gap-4 p-4 bg-foreground/5 rounded-xl hover:bg-white/8 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {TX_ICONS[txn.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-medium">
                      {TX_LABELS[txn.type]}
                    </p>
                    {txn.description && (
                      <p className="text-muted-foreground text-xs truncate">{txn.description}</p>
                    )}
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {new Date(txn.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-sm font-semibold ${isIn ? "text-green-400" : "text-red-400"}`}>
                      {isIn ? "+" : "-"}{formatCurrency(txn.amount)}
                    </p>
                    <Badge className={`text-xs mt-1 ${statusInfo?.class}`}>
                      {statusInfo?.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </Button>
            <span className="text-muted-foreground text-sm">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="bg-secondary border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-400" />
              Nạp tiền vào ví
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Chọn số tiền và phương thức thanh toán
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Quick amounts */}
            <div>
              <Label className="text-muted-foreground mb-2 block">Số tiền nhanh</Label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(String(amt))}
                    className={`py-2 rounded-lg text-sm border transition-all ${
                      depositAmount === String(amt)
                        ? "border-purple-500 bg-purple-500/20 text-purple-300"
                        : "border-border bg-foreground/5 text-muted-foreground hover:border-border"
                    }`}
                  >
                    {formatCurrency(amt)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="deposit-amount">Số tiền tùy chỉnh (VNĐ)</Label>
              <Input
                id="deposit-amount"
                type="number"
                min="1"
                max="10000"
                step="0.01"
                placeholder="Nhập số tiền..."
                className="bg-foreground/5 border-border mt-1"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-2 block">Phương thức thanh toán</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["VNPAY", "MOMO"] as const).map((gw) => (
                  <button
                    key={gw}
                    onClick={() => setDepositGateway(gw)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      depositGateway === gw
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-border bg-foreground/5 hover:border-border"
                    }`}
                  >
                    <span className="text-2xl">{gw === "VNPAY" ? "🏦" : "📱"}</span>
                    <div className="text-left">
                      <p className="text-foreground text-sm font-medium">{gw}</p>
                      <p className="text-muted-foreground text-xs">
                        {gw === "VNPAY" ? "Internet Banking" : "Ví MoMo"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-foreground/10" />

            {depositAmount && parseFloat(depositAmount) > 0 && (
              <div className="bg-foreground/5 rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Số tiền nạp</span>
                  <span className="text-foreground">{formatCurrency(parseFloat(depositAmount))}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Số dư sau nạp</span>
                  <span className="text-green-400">
                    {formatCurrency(balance + parseFloat(depositAmount))}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 border border-border"
                onClick={() => setShowDepositModal(false)}
                disabled={isDepositing}
              >
                Hủy
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount || parseFloat(depositAmount) < 1}
              >
                {isDepositing ? "Đang xử lý..." : `Nạp ${formatCurrency(parseFloat(depositAmount || "0"))}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
