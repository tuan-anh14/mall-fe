import { useEffect, useState } from "react";
import { TrendingUp, Users, ShoppingBag, DollarSign, Package } from "lucide-react";
import { Card } from "../ui/card";
import { get } from "../../lib/api";
import { toast } from "sonner";
import { formatCurrency, formatCurrencyCompact } from "../../lib/currency";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AdminPageLayout, AdminSpinner, adminPanelClass } from "../admin/AdminPageLayout";

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
  users: number;
}

interface Stats {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  totalProducts: number;
  totalOrders: number;
  totalGMV: number;
  totalPlatformEarnings: number;
  newUsersThisMonth: number;
  pendingSellerRequests: number;
  totalCategories: number;
  totalCoupons: number;
}

export function AdminStatsPage() {
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
      <AdminPageLayout
        title="Báo cáo thống kê"
        description={`Năm ${new Date().getFullYear()}`}
      >
        <AdminSpinner className="min-h-[40vh]" />
      </AdminPageLayout>
    );
  }

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    },
    labelStyle: { color: "#374151", fontWeight: 600 },
  };

  const chartWrap = "border-b border-gray-100 px-5 py-4";
  const chartBody = "bg-gray-50/80 px-3 py-4 sm:px-5";

  return (
    <AdminPageLayout
      title="Báo cáo thống kê"
      description={`Số liệu tổng hợp năm ${new Date().getFullYear()}`}
    >
      {stats && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6 lg:gap-4 mb-8">
          {[
            {
              label: "Tổng người dùng",
              value: stats.totalUsers.toLocaleString("vi-VN"),
              sub: `+${stats.newUsersThisMonth} tháng này`,
              icon: Users,
              bar: "bg-blue-500",
              box: "border-blue-100 bg-blue-50 text-primary",
            },
            {
              label: "Tổng doanh thu",
              value: formatCurrencyCompact(stats.totalGMV),
              sub: `${stats.totalOrders.toLocaleString("vi-VN")} đơn`,
              icon: DollarSign,
              bar: "bg-amber-500",
              box: "border-amber-100 bg-amber-50 text-amber-700",
            },
            {
              label: "Lợi nhuận sàn",
              value: formatCurrencyCompact(stats.totalPlatformEarnings),
              sub: "Phí 5% từ Seller",
              icon: TrendingUp,
              bar: "bg-emerald-600",
              box: "border-emerald-100 bg-emerald-50 text-emerald-700",
            },
            {
              label: "Người bán",
              value: stats.totalSellers.toLocaleString("vi-VN"),
              sub: `${stats.pendingSellerRequests} chờ duyệt`,
              icon: ShoppingBag,
              bar: "bg-indigo-500",
              box: "border-indigo-100 bg-indigo-50 text-indigo-700",
            },
            {
              label: "Sản phẩm",
              value: stats.totalProducts.toLocaleString("vi-VN"),
              sub: `${stats.totalCategories} danh mục`,
              icon: Package,
              bar: "bg-emerald-500",
              box: "border-emerald-100 bg-emerald-50 text-emerald-700",
            },
            {
              label: "Đơn hàng",
              value: stats.totalOrders.toLocaleString("vi-VN"),
              sub: "Tổng toàn hệ thống",
              icon: ShoppingBag,
              bar: "bg-rose-500",
              box: "border-rose-100 bg-rose-50 text-rose-700",
            },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.label} className={`relative overflow-hidden ${adminPanelClass} p-4`}>
                <div className={`absolute bottom-3 left-0 top-3 w-1 rounded-full ${c.bar}`} />
                <div className="pl-2.5">
                  <div
                    className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl border ${c.box}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xl font-bold tabular-nums text-gray-900">{c.value}</p>
                  <p className="text-xs font-medium text-gray-600">{c.label}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{c.sub}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className={adminPanelClass}>
        <div className={chartWrap}>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-primary">
              <DollarSign className="h-4 w-4" />
            </span>
            Doanh thu theo tháng
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">Biểu đồ vùng — đơn vị theo cài đặt hệ thống</p>
        </div>
        <div className={chartBody}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradAdmin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A56DB" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#1A56DB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(0,0,0,0.25)" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="rgba(0,0,0,0.25)"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatCurrencyCompact(v as number)}
                width={56}
              />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [formatCurrency(v), "Doanh thu"]} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1A56DB"
                fill="url(#revenueGradAdmin)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Card className={adminPanelClass}>
          <div className={chartWrap}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <ShoppingBag className="h-4 w-4" />
              </span>
              Đơn hàng theo tháng
            </h3>
          </div>
          <div className={chartBody}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(0,0,0,0.25)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(0,0,0,0.25)" tick={{ fontSize: 11 }} width={36} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [v, "Đơn hàng"]} />
                <Bar dataKey="orders" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className={adminPanelClass}>
          <div className={chartWrap}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-primary">
                <Users className="h-4 w-4" />
              </span>
              Người dùng mới theo tháng
            </h3>
          </div>
          <div className={chartBody}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(0,0,0,0.25)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(0,0,0,0.25)" tick={{ fontSize: 11 }} width={36} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [v, "Người dùng"]} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#1A56DB"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#1A56DB", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {stats && (
        <Card className={adminPanelClass}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </span>
              Tóm tắt hệ thống
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">Chỉ số chi tiết</p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Tổng người dùng", value: stats.totalUsers },
              { label: "Người mua", value: stats.totalBuyers },
              { label: "Người bán", value: stats.totalSellers },
              { label: "Đơn hàng", value: stats.totalOrders },
              { label: "Sản phẩm", value: stats.totalProducts },
              { label: "Danh mục", value: stats.totalCategories },
              { label: "Mã giảm giá", value: stats.totalCoupons },
              { label: "Chờ duyệt Seller", value: stats.pendingSellerRequests },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5"
              >
                <span className="text-sm text-gray-600">{label}</span>
                <span className="font-semibold tabular-nums text-gray-900">
                  {value.toLocaleString("vi-VN")}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </AdminPageLayout>
  );
}
