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
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  totalRevenue: number;
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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-red-500/30 border-t-red-500 animate-spin" />
      </div>
    );
  }

  const tooltipStyle = {
    contentStyle: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 },
    labelStyle: { color: '#374151' },
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo thống kê</h1>
        <p className="text-gray-500 text-sm mt-0.5">Năm {new Date().getFullYear()}</p>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-gray-200 p-4">
            <Users className="h-5 w-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-gray-500 text-xs">Tổng người dùng</p>
            <p className="text-blue-400/70 text-xs mt-1">+{stats.newUsersThisMonth} tháng này</p>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-gray-200 p-4">
            <DollarSign className="h-5 w-5 text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{formatCurrencyCompact(stats.totalRevenue)}</p>
            <p className="text-gray-500 text-xs">Tổng doanh thu</p>
            <p className="text-yellow-400/70 text-xs mt-1">{stats.totalOrders} đơn hàng</p>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-gray-200 p-4">
            <ShoppingBag className="h-5 w-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalSellers.toLocaleString()}</p>
            <p className="text-gray-500 text-xs">Người bán</p>
            <p className="text-blue-400/70 text-xs mt-1">{stats.pendingSellerRequests} chờ duyệt</p>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-gray-200 p-4">
            <Package className="h-5 w-5 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts.toLocaleString()}</p>
            <p className="text-gray-500 text-xs">Sản phẩm</p>
            <p className="text-green-400/70 text-xs mt-1">{stats.totalCategories} danh mục</p>
          </Card>
        </div>
      )}

      {/* Revenue Chart */}
      <Card className="bg-white border-gray-200 p-5">
        <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-yellow-400" />
          Doanh thu theo tháng
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="month" stroke="rgba(0,0,0,0.3)" tick={{ fontSize: 11 }} />
            <YAxis stroke="rgba(0,0,0,0.3)" tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrencyCompact(v as number)} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [formatCurrency(v), 'Doanh thu']} />
            <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="url(#revenueGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Orders + Users Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-white border-gray-200 p-5">
          <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-blue-400" />
            Đơn hàng theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" stroke="rgba(0,0,0,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(0,0,0,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [v, 'Đơn hàng']} />
              <Bar dataKey="orders" fill="#7c3aed" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-white border-gray-200 p-5">
          <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            Người dùng mới theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" stroke="rgba(0,0,0,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(0,0,0,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [v, 'Người dùng']} />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Summary Table */}
      {stats && (
        <Card className="bg-white border-gray-200 p-5">
          <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            Tóm tắt hệ thống
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">{label}</span>
                <span className="text-gray-900 font-semibold">{value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
