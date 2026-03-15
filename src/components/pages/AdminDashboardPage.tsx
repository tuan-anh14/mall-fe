import { useEffect, useState } from "react";
import { Users, Package, ShoppingBag, DollarSign, Tag, Ticket, Star, UserCheck, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { get } from "../../lib/api";
import { toast } from "sonner";
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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-red-500/30 border-t-red-500 animate-spin" />
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: "Tổng người dùng", value: stats.totalUsers.toLocaleString(), icon: Users, color: "from-blue-500/20 to-blue-600/20", iconColor: "text-blue-400", sub: `+${stats.newUsersThisMonth} tháng này` },
        { label: "Người bán", value: stats.totalSellers.toLocaleString(), icon: ShoppingBag, color: "from-purple-500/20 to-purple-600/20", iconColor: "text-purple-400", sub: `${stats.totalBuyers} người mua` },
        { label: "Sản phẩm", value: stats.totalProducts.toLocaleString(), icon: Package, color: "from-green-500/20 to-green-600/20", iconColor: "text-green-400", sub: `${stats.totalCategories} danh mục` },
        { label: "Tổng doanh thu", value: `$${(stats.totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign, color: "from-yellow-500/20 to-yellow-600/20", iconColor: "text-yellow-400", sub: `${stats.totalOrders} đơn hàng` },
        { label: "Mã giảm giá", value: stats.totalCoupons.toLocaleString(), icon: Ticket, color: "from-pink-500/20 to-pink-600/20", iconColor: "text-pink-400", sub: "đang hoạt động" },
        { label: "Chờ duyệt Seller", value: stats.pendingSellerRequests.toLocaleString(), icon: UserCheck, color: "from-orange-500/20 to-orange-600/20", iconColor: "text-orange-400", sub: "yêu cầu mới", alert: stats.pendingSellerRequests > 0 },
      ]
    : [];

  const quickLinks = [
    { label: "Quản lý tài khoản", page: "admin-accounts", icon: Users, desc: "Xem, khóa, xóa tài khoản" },
    { label: "Danh mục sản phẩm", page: "admin-categories", icon: Tag, desc: "Thêm, sửa, xóa danh mục" },
    { label: "Mã giảm giá", page: "admin-coupons", icon: Ticket, desc: "Tạo và quản lý coupon" },
    { label: "Duyệt Seller", page: "admin-seller-requests", icon: UserCheck, desc: "Xem xét và phê duyệt", badge: stats?.pendingSellerRequests },
    { label: "Quản lý Reviews", page: "admin-reviews", icon: Star, desc: "Xem và xóa đánh giá" },
    { label: "Thống kê", page: "admin-stats", icon: TrendingUp, desc: "Báo cáo chi tiết" },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">Tổng quan hệ thống ShopHub</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, iconColor, sub, alert }) => (
          <Card key={label} className={`bg-gradient-to-br ${color} border-white/10 p-4 relative`}>
            {alert && (
              <div className="absolute top-2 right-2">
                <AlertCircle className="h-4 w-4 text-orange-400 animate-pulse" />
              </div>
            )}
            <Icon className={`h-5 w-5 ${iconColor} mb-2`} />
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-white/70 text-xs font-medium">{label}</p>
            <p className="text-white/40 text-xs mt-0.5">{sub}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-white/5 border-white/10 p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-yellow-400" />
            Doanh thu theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, 'Doanh thu']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-white/5 border-white/10 p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-purple-400" />
            Đơn hàng theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                formatter={(v: number) => [v, 'Đơn hàng']}
              />
              <Bar dataKey="orders" fill="#7c3aed" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Truy cập nhanh</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {quickLinks.map(({ label, page, icon: Icon, desc, badge }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className="text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all group"
            >
              <div className="flex items-start justify-between">
                <Icon className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-colors mb-2" />
                {badge != null && badge > 0 && (
                  <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-white font-medium text-sm">{label}</p>
              <p className="text-white/40 text-xs mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
