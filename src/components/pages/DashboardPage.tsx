import React, { useState, useEffect } from "react";
import { TrendingUp, ShoppingBag, Users, Package, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { get } from "../../lib/api";
import { formatCurrency, formatCurrencyCompact } from "../../lib/currency";

interface DashboardStats {
  totalRevenue: number;
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

  const changeClass = (val: number) =>
    val >= 0
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30";

  const changeLabel = (val: number) => `${val >= 0 ? "+" : ""}${val}%`;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Đang tải bảng điều khiển...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl text-gray-900 mb-2">Bảng điều khiển</h1>
          <p className="text-gray-500">Chào mừng trở lại! Đây là tổng quan cửa hàng của bạn.</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => onNavigate("add-product")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <Badge className={changeClass(stats?.revenueChange ?? 0)}>
              {changeLabel(stats?.revenueChange ?? 0)}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mb-1">Tổng doanh thu</p>
          <p className="text-3xl text-gray-900">{formatCurrencyCompact(stats?.totalRevenue ?? 0)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-blue-400" />
            </div>
            <Badge className={changeClass(stats?.ordersChange ?? 0)}>
              {changeLabel(stats?.ordersChange ?? 0)}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mb-1">Tổng đơn hàng</p>
          <p className="text-3xl text-gray-900">{(stats?.totalOrders ?? 0).toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Package className="h-6 w-6 text-pink-400" />
            </div>
            <Badge className={changeClass(stats?.productsChange ?? 0)}>
              {changeLabel(stats?.productsChange ?? 0)}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mb-1">Sản phẩm</p>
          <p className="text-3xl text-gray-900">{stats?.totalProducts ?? 0}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-orange-400" />
            </div>
            <Badge className={changeClass(stats?.customersChange ?? 0)}>
              {changeLabel(stats?.customersChange ?? 0)}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mb-1">Khách hàng</p>
          <p className="text-3xl text-gray-900">{((stats?.totalCustomers ?? 0) / 1000).toFixed(1)}K</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl text-gray-900 mb-6">Tổng quan doanh thu</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="month" stroke="rgba(0,0,0,0.4)" />
              <YAxis stroke="rgba(0,0,0,0.4)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  color: "#111827",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl text-gray-900 mb-6">Đơn hàng theo tháng</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="month" stroke="rgba(0,0,0,0.4)" />
              <YAxis stroke="rgba(0,0,0,0.4)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  color: "#111827",
                }}
              />
              <Bar dataKey="orders" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
          <TabsTrigger value="orders">Đơn hàng gần đây</TabsTrigger>
          <TabsTrigger value="customers">Khách hàng</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl text-gray-900">Quản lý sản phẩm</h2>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => onNavigate("add-product")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm sản phẩm
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-500">Sản phẩm</TableHead>
                  <TableHead className="text-gray-500">Danh mục</TableHead>
                  <TableHead className="text-gray-500">Giá</TableHead>
                  <TableHead className="text-gray-500">Tồn kho</TableHead>
                  <TableHead className="text-gray-500">Trạng thái</TableHead>
                  <TableHead className="text-gray-500">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.slice(0, 6).map((product) => (
                  <TableRow key={product.id} className="border-gray-200 hover:bg-gray-50">
                    <TableCell className="text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden">
                          <img
                            src={product.images[0]?.url || ""}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span>{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">{product.category?.name ?? "-"}</TableCell>
                    <TableCell className="text-gray-900">{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          product.stock > 20
                            ? "bg-green-500/20 text-green-400"
                            : product.stock > 10
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }
                      >
                        {product.stock} sản phẩm
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={product.stock > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                        {product.stock > 0 ? "Đang bán" : "Hết hàng"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onNavigate("edit-product", product)}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400"
                          onClick={() => onNavigate("seller-products")}
                        >
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      Chưa có sản phẩm
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl text-gray-900">Đơn hàng gần đây</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-500">Mã đơn hàng</TableHead>
                  <TableHead className="text-gray-500">Ngày</TableHead>
                  <TableHead className="text-gray-500">Khách hàng</TableHead>
                  <TableHead className="text-gray-500">Tổng</TableHead>
                  <TableHead className="text-gray-500">Trạng thái</TableHead>
                  <TableHead className="text-gray-500">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="border-gray-200 hover:bg-gray-50">
                    <TableCell className="text-gray-900">{order.id}</TableCell>
                    <TableCell className="text-gray-500">{order.date}</TableCell>
                    <TableCell className="text-gray-500">{order.customer.name}</TableCell>
                    <TableCell className="text-gray-900">{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          order.status === "Delivered"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-blue-500/20 text-blue-400"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNavigate("seller-orders")}
                      >
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      Chưa có đơn hàng
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl text-gray-900">Quản lý khách hàng</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-500">Khách hàng</TableHead>
                  <TableHead className="text-gray-500">Email</TableHead>
                  <TableHead className="text-gray-500">Đơn hàng</TableHead>
                  <TableHead className="text-gray-500">Tổng chi tiêu</TableHead>
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
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                          Chưa có khách hàng
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return customers.map((customer) => (
                    <TableRow key={customer.id} className="border-gray-200 hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                            {customer.name[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="text-gray-900">{customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">{customer.email}</TableCell>
                      <TableCell className="text-gray-900">{customer.orderCount}</TableCell>
                      <TableCell className="text-gray-900">{formatCurrency(customer.totalSpent)}</TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
