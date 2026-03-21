import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  Tag,
  Ticket,
  Star,
  UserCheck,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  LayoutDashboard,
  Wallet,
  BarChart3,
  History,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { get } from "../../lib/api";
import { toast } from "sonner";
import { formatCurrency, formatCurrencyCompact } from "../../lib/currency";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Stats {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  pendingSellerRequests: number;
  totalCategories: number;
  totalCoupons: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
  users: number;
}

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

const motionEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const chartCardClass =
  "bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden";

export function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [salesData, setSalesData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      get<Stats>("/api/v1/admin/stats"),
      get<MonthlyData[]>("/api/v1/admin/stats/sales"),
    ])
      .then(([s, sd]) => {
        setStats(s);
        setSalesData(sd);
      })
      .catch(() => toast.error("Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
        <div className="h-9 w-9 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
        <p className="text-sm text-gray-500">Đang tải bảng điều khiển…</p>
      </div>
    );
  }

  const statCards = stats
    ? [
        {
          label: "Tổng người dùng",
          value: stats.totalUsers.toLocaleString("vi-VN"),
          icon: Users,
          bar: "bg-blue-500",
          iconBox: "bg-blue-50 text-blue-600 border-blue-100",
          sub: `+${stats.newUsersThisMonth} tháng này`,
        },
        {
          label: "Người bán",
          value: stats.totalSellers.toLocaleString("vi-VN"),
          icon: ShoppingBag,
          bar: "bg-indigo-500",
          iconBox: "bg-indigo-50 text-indigo-600 border-indigo-100",
          sub: `${stats.totalBuyers.toLocaleString("vi-VN")} người mua`,
        },
        {
          label: "Sản phẩm",
          value: stats.totalProducts.toLocaleString("vi-VN"),
          icon: Package,
          bar: "bg-emerald-500",
          iconBox: "bg-emerald-50 text-emerald-600 border-emerald-100",
          sub: `${stats.totalCategories} danh mục`,
        },
        {
          label: "Tổng doanh thu",
          value: formatCurrencyCompact(stats.totalRevenue),
          icon: DollarSign,
          bar: "bg-amber-500",
          iconBox: "bg-amber-50 text-amber-600 border-amber-100",
          sub: `${stats.totalOrders.toLocaleString("vi-VN")} đơn`,
        },
        {
          label: "Mã giảm giá",
          value: stats.totalCoupons.toLocaleString("vi-VN"),
          icon: Ticket,
          bar: "bg-violet-500",
          iconBox: "bg-violet-50 text-violet-600 border-violet-100",
          sub: "Đang hoạt động",
        },
        {
          label: "Chờ duyệt Seller",
          value: stats.pendingSellerRequests.toLocaleString("vi-VN"),
          icon: UserCheck,
          bar: "bg-orange-500",
          iconBox: "bg-orange-50 text-orange-600 border-orange-100",
          sub: "Yêu cầu mới",
          alert: stats.pendingSellerRequests > 0,
        },
      ]
    : [];

  const quickLinks = [
    { label: "Quản lý tài khoản", page: "admin-accounts" as const, icon: Users, desc: "Xem, khóa, xóa tài khoản", accent: "bg-blue-50 text-blue-600 border-blue-100" },
    { label: "Danh mục sản phẩm", page: "admin-categories" as const, icon: Tag, desc: "Thêm, sửa, xóa danh mục", accent: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { label: "Mã giảm giá", page: "admin-coupons" as const, icon: Ticket, desc: "Tạo và quản lý coupon", accent: "bg-violet-50 text-violet-600 border-violet-100" },
    { label: "Duyệt Seller", page: "admin-seller-requests" as const, icon: UserCheck, desc: "Phê duyệt người bán", badge: stats?.pendingSellerRequests, accent: "bg-orange-50 text-orange-600 border-orange-100" },
    { label: "Đánh giá", page: "admin-reviews" as const, icon: Star, desc: "Kiểm duyệt reviews", accent: "bg-amber-50 text-amber-600 border-amber-100" },
    { label: "Thống kê", page: "admin-stats" as const, icon: TrendingUp, desc: "Báo cáo chi tiết", accent: "bg-violet-50 text-violet-600 border-violet-100" },
    { label: "Ví người dùng", page: "admin-wallets" as const, icon: Wallet, desc: "Số dư & giao dịch", accent: "bg-cyan-50 text-cyan-600 border-cyan-100" },
    { label: "Audit log", page: "admin-audit-log" as const, icon: History, desc: "Nhật ký thao tác", accent: "bg-slate-100 text-slate-600 border-slate-200" },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 lg:py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: motionEase }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="mb-1.5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Tổng quan
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Bảng điều khiển Admin
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi người dùng, đơn hàng và hoạt động hệ thống Shop MALL
          </p>
        </div>
        <Button
          variant="outline"
          className="h-10 w-full shrink-0 rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50 sm:w-auto"
          onClick={() => onNavigate("admin-stats")}
        >
          <BarChart3 className="mr-2 h-4 w-4 text-gray-500" />
          Xem báo cáo
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        {statCards.map((card, i) => {
          const StatIcon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: motionEase, delay: 0.05 + i * 0.04 }}
            >
              <Card className="relative overflow-hidden border-gray-200/80 p-4 shadow-sm transition-shadow hover:shadow-md">
                {card.alert && (
                  <div className="absolute right-2 top-2">
                    <AlertCircle className="h-4 w-4 animate-pulse text-orange-500" />
                  </div>
                )}
                <div className={`absolute bottom-3 left-0 top-3 w-1 rounded-full ${card.bar}`} aria-hidden />
                <div className="pl-2.5">
                  <div
                    className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl border ${card.iconBox}`}
                  >
                    <StatIcon className="h-5 w-5" />
                  </div>
                  <p className="text-lg font-bold tabular-nums text-gray-900 lg:text-xl">{card.value}</p>
                  <p className="text-xs font-medium text-gray-600">{card.label}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{card.sub}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: motionEase, delay: 0.2 }}
          className={chartCardClass}
        >
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-primary">
                <DollarSign className="h-4 w-4" />
              </span>
              Doanh thu theo tháng
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">Theo dữ liệu hệ thống</p>
          </div>
          <div className="bg-gray-50/80 px-3 py-4 sm:px-5">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={salesData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(0,0,0,0.25)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(0,0,0,0.25)" tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrencyCompact(v as number)} width={56} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  }}
                  labelStyle={{ color: "#374151", fontWeight: 600 }}
                  formatter={(v: number) => [formatCurrency(v), "Doanh thu"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1A56DB"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#1A56DB", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: motionEase, delay: 0.26 }}
          className={chartCardClass}
        >
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ShoppingBag className="h-4 w-4" />
              </span>
              Đơn hàng theo tháng
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">Số lượng đơn hoàn tất / ghi nhận</p>
          </div>
          <div className="bg-gray-50/80 px-3 py-4 sm:px-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={salesData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(0,0,0,0.25)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(0,0,0,0.25)" tick={{ fontSize: 11 }} width={36} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  }}
                  labelStyle={{ color: "#374151", fontWeight: 600 }}
                  formatter={(v: number) => [v, "Đơn hàng"]}
                />
                <Bar dataKey="orders" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: motionEase, delay: 0.32 }}
        className="mt-10"
      >
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Truy cập nhanh</h2>
            <p className="text-sm text-gray-500">Các module quản trị thường dùng</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map(({ label, page, icon: Icon, desc, badge, accent }, i) => (
            <motion.button
              key={page}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: motionEase, delay: 0.35 + i * 0.03 }}
              onClick={() => onNavigate(page)}
              className="group flex flex-col rounded-2xl border border-gray-200/80 bg-white p-4 text-left shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1">
                  {badge != null && badge > 0 && (
                    <Badge className="rounded-lg border-0 bg-orange-500 px-2 py-0.5 text-white hover:bg-orange-500">
                      {badge}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
                </div>
              </div>
              <p className="font-semibold text-gray-900">{label}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{desc}</p>
            </motion.button>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
