import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, ShoppingBag, Users, Package, Plus, LayoutDashboard, PenTool } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { get } from "../../lib/api";
import { formatCurrency, formatCurrencyCompact } from "../../lib/currency";

interface DashboardStats {
  totalRevenue: number;
  walletBalance: number;
  totalFees: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  customersChange: number;
}

interface SalesDataPoint {
  month: string;
  revenue: number;
  orders: number;
}

interface Product {
  id: string;
  name: string;
  category: { id: string; name: string } | null;
  price: number;
  stock: number;
  status: string;
  images: { id: string; url: string; isPrimary: boolean; sortOrder: number }[];
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  customer: { id: string; name: string; email: string };
  items: any[];
}

interface DashboardPageProps {
  onNavigate: (page: string, payload?: any) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, salesDataRes, productsRes, ordersRes] = await Promise.all([
          get<DashboardStats>('/api/v1/seller/dashboard/stats'),
          get<SalesDataPoint[]>('/api/v1/seller/dashboard/sales-data'),
          get<{ data: Product[]; stats: any }>('/api/v1/seller/products'),
          get<{ data: Order[]; stats: any }>('/api/v1/seller/orders'),
        ]);
        setStats(statsData);
        setSalesData(salesDataRes);
        setProducts(productsRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

  const changeClass = (val: number) =>
    val >= 0
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
      : "bg-red-50 text-red-700 border-red-200 font-semibold";

  const changeLabel = (val: number) => `${val >= 0 ? "+" : ""}${val}%`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-blue-600/30 border-t-blue-600 animate-spin" />
          <p className="text-gray-500 text-sm">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Ví của tôi",
      value: formatCurrency(stats?.walletBalance ?? 0),
      change: stats?.revenueChange ?? 0,
      icon: TrendingUp,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      label: "Doanh thu (Net)",
      value: formatCurrencyCompact(stats?.totalRevenue ?? 0),
      change: stats?.revenueChange ?? 0,
      icon: ShoppingBag,
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      label: "Phí sàn (5%)",
      value: formatCurrencyCompact(stats?.totalFees ?? 0),
      change: 0,
      icon: Package,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      label: "Số đơn hàng",
      value: (stats?.totalOrders ?? 0).toLocaleString("vi-VN"),
      change: stats?.ordersChange ?? 0,
      icon: Users,
      iconBg: "bg-orange-50 text-orange-600 border-orange-100",
    },
  ];

  const chartCardClass =
    "bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden";

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Bảng điều khiển</h1>
              <p className="text-gray-500 text-sm mt-1">Tổng quan doanh thu, đơn hàng và cửa hàng của bạn</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl h-11 font-semibold shadow-sm flex-1 sm:flex-initial"
              onClick={() => onNavigate("my-blogs")}
            >
              <PenTool className="h-4 w-4 mr-2" />
              Bài viết Blog
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold shadow-lg shadow-blue-600/20 flex-1 sm:flex-initial"
              onClick={() => onNavigate("add-product")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease, delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {statCards.map((card, i) => {
            const StatIcon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease, delay: 0.08 + i * 0.05 }}
                className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center border ${card.iconBg}`}>
                    <StatIcon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className={`text-xs border ${changeClass(card.change)}`}>
                    {changeLabel(card.change)}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums mt-1">{card.value}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease, delay: 0.12 }}
          className="grid lg:grid-cols-2 gap-5 mb-8"
        >
          <div className={chartCardClass}>
            <div className="px-5 pt-5 pb-2 border-b border-gray-100 bg-gray-50/40">
              <h2 className="text-base font-bold text-gray-900">Tổng quan doanh thu</h2>
              <p className="text-xs text-gray-500 mt-0.5">Xu hướng theo tháng</p>
            </div>
            <div className="p-4 lg:p-5">
              <div className="rounded-xl bg-gray-50/80 border border-gray-100 p-2">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        color: "#111827",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.08)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={chartCardClass}>
            <div className="px-5 pt-5 pb-2 border-b border-gray-100 bg-gray-50/40">
              <h2 className="text-base font-bold text-gray-900">Đơn hàng theo tháng</h2>
              <p className="text-xs text-gray-500 mt-0.5">Số lượng đơn đã tạo</p>
            </div>
            <div className="p-4 lg:p-5">
              <div className="rounded-xl bg-gray-50/80 border border-gray-100 p-2">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        color: "#111827",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.08)",
                      }}
                    />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <Tabs defaultValue="products" variant="underline" className="w-full gap-0">
            <TabsList className="w-full px-2 sm:px-4">
              <TabsTrigger value="products">Sản phẩm</TabsTrigger>
              <TabsTrigger value="orders">Đơn hàng gần đây</TabsTrigger>
              <TabsTrigger value="customers">Khách hàng</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-0 p-0 focus-visible:outline-none">
              <div className="border-t border-gray-100">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/40 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Quản lý sản phẩm</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Tối đa 6 sản phẩm hiển thị nhanh</p>
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 font-medium shadow-sm w-full sm:w-auto"
                    onClick={() => onNavigate("add-product")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm sản phẩm
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100 hover:bg-transparent bg-gray-50/50">
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Sản phẩm</TableHead>
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Danh mục</TableHead>
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Giá</TableHead>
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Tồn kho</TableHead>
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Trạng thái</TableHead>
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.slice(0, 6).map((product) => (
                        <TableRow key={product.id} className="border-gray-100 hover:bg-gray-50/80">
                          <TableCell className="text-gray-900">
                            <div className="flex items-center gap-3 min-w-[200px]">
                              <div className="w-11 h-11 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                <img
                                  src={product.images[0]?.url || ""}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-medium text-sm line-clamp-2">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">{product.category?.name ?? "—"}</TableCell>
                          <TableCell className="text-gray-900 font-semibold tabular-nums text-sm">{formatCurrency(product.price)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                product.stock > 20
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                                  : product.stock > 10
                                    ? "bg-amber-50 text-amber-800 border-amber-200 font-medium"
                                    : "bg-red-50 text-red-700 border-red-200 font-medium"
                              }
                            >
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                product.stock > 0
                                  ? "bg-blue-50 text-blue-700 border-blue-200 font-medium"
                                  : "bg-gray-100 text-gray-600 border-gray-200 font-medium"
                              }
                            >
                              {product.stock > 0 ? "Đang bán" : "Hết hàng"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg h-8 text-xs font-medium"
                                onClick={() => onNavigate("edit-product", product)}
                              >
                                Sửa
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg h-8 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => onNavigate("seller-products")}
                              >
                                Quản lý
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {products.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-14">
                            <Package className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                            <p className="font-medium text-gray-700">Chưa có sản phẩm</p>
                            <p className="text-sm text-gray-400 mt-1">Thêm sản phẩm để bắt đầu bán hàng</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-0 p-0 focus-visible:outline-none">
              <div className="border-t border-gray-100">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/40">
                  <h2 className="text-base font-bold text-gray-900">Đơn hàng gần đây</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Danh sách đơn từ API người bán</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100 hover:bg-transparent bg-gray-50/50">
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Mã đơn</TableHead>
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Ngày</TableHead>
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Khách hàng</TableHead>
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Tổng</TableHead>
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Trạng thái</TableHead>
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="border-gray-100 hover:bg-gray-50/80">
                          <TableCell className="text-gray-900 font-mono text-xs font-medium">#{String(order.id).slice(-8)}</TableCell>
                          <TableCell className="text-gray-500 text-sm">{order.date}</TableCell>
                          <TableCell className="text-gray-700 text-sm font-medium">{order.customer.name}</TableCell>
                          <TableCell className="text-gray-900 font-semibold tabular-nums text-sm">{formatCurrency(order.total)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                order.status === "Delivered"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                                  : "bg-blue-50 text-blue-700 border-blue-200 font-medium"
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg h-8 text-xs font-medium"
                              onClick={() => onNavigate("seller-orders")}
                            >
                              Chi tiết
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {orders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-14">
                            <ShoppingBag className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                            <p className="font-medium text-gray-700">Chưa có đơn hàng</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="customers" className="mt-0 p-0 focus-visible:outline-none">
              <div className="border-t border-gray-100">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/40">
                  <h2 className="text-base font-bold text-gray-900">Khách hàng</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Gom từ đơn hàng của bạn</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100 hover:bg-transparent bg-gray-50/50">
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Khách hàng</TableHead>
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Email</TableHead>
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Đơn hàng</TableHead>
                        <TableHead className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Tổng chi tiêu</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const customerMap = new Map<string, { id: string; name: string; email: string; orderCount: number; totalSpent: number }>();
                        orders.forEach((order) => {
                          const c = order.customer;
                          if (!customerMap.has(c.id)) {
                            customerMap.set(c.id, { ...c, orderCount: 1, totalSpent: order.total });
                          } else {
                            const existing = customerMap.get(c.id)!;
                            existing.orderCount++;
                            existing.totalSpent += order.total;
                          }
                        });
                        const customers = Array.from(customerMap.values());
                        if (customers.length === 0) {
                          return (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-gray-500 py-14">
                                <Users className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                                <p className="font-medium text-gray-700">Chưa có khách hàng</p>
                                <p className="text-sm text-gray-400 mt-1">Xuất hiện khi có đơn hàng</p>
                              </TableCell>
                            </TableRow>
                          );
                        }
                        return customers.map((customer) => (
                          <TableRow key={customer.id} className="border-gray-100 hover:bg-gray-50/80">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                  {customer.name[0]?.toUpperCase() || "?"}
                                </div>
                                <span className="text-gray-900 font-medium text-sm">{customer.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">{customer.email}</TableCell>
                            <TableCell className="text-gray-900 font-semibold tabular-nums text-sm">{customer.orderCount}</TableCell>
                            <TableCell className="text-gray-900 font-semibold tabular-nums text-sm">{formatCurrency(customer.totalSpent)}</TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
