import React, { useState, useEffect } from "react";
import { TrendingUp, ShoppingBag, Users, Package, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { get } from "../../lib/api";

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
        <p className="text-white/60">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl text-white mb-2">Dashboard</h1>
          <p className="text-white/60">Welcome back! Here's your store overview.</p>
        </div>
        <Button
          className="bg-gradient-to-r from-purple-600 to-blue-600"
          onClick={() => onNavigate("add-product")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <Badge className={changeClass(stats?.revenueChange ?? 0)}>
              {changeLabel(stats?.revenueChange ?? 0)}
            </Badge>
          </div>
          <p className="text-sm text-white/60 mb-1">Total Revenue</p>
          <p className="text-3xl text-white">${((stats?.totalRevenue ?? 0) / 1000).toFixed(1)}K</p>
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
          <p className="text-sm text-white/60 mb-1">Total Orders</p>
          <p className="text-3xl text-white">{(stats?.totalOrders ?? 0).toLocaleString()}</p>
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
          <p className="text-sm text-white/60 mb-1">Products</p>
          <p className="text-3xl text-white">{stats?.totalProducts ?? 0}</p>
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
          <p className="text-sm text-white/60 mb-1">Customers</p>
          <p className="text-3xl text-white">{((stats?.totalCustomers ?? 0) / 1000).toFixed(1)}K</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl text-white mb-6">Revenue Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="url(#colorRevenue)"
                strokeWidth={3}
                dot={false}
              />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl text-white mb-6">Orders by Month</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
              <Bar dataKey="orders" fill="url(#colorOrders)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="w-full justify-start bg-white/5 border-b border-white/10 rounded-none">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl text-white">Product Management</h2>
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600"
                onClick={() => onNavigate("add-product")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/70">Product</TableHead>
                  <TableHead className="text-white/70">Category</TableHead>
                  <TableHead className="text-white/70">Price</TableHead>
                  <TableHead className="text-white/70">Stock</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.slice(0, 6).map((product) => (
                  <TableRow key={product.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden">
                          <img
                            src={product.images[0]?.url || ""}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span>{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white/70">{product.category?.name ?? "-"}</TableCell>
                    <TableCell className="text-white">${product.price}</TableCell>
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
                        {product.stock} units
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={product.stock > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                        {product.stock > 0 ? "Active" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onNavigate("edit-product", product)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400"
                          onClick={() => onNavigate("seller-products")}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-white/60 py-8">
                      No products yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl text-white">Recent Orders</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/70">Order ID</TableHead>
                  <TableHead className="text-white/70">Date</TableHead>
                  <TableHead className="text-white/70">Customer</TableHead>
                  <TableHead className="text-white/70">Total</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white">{order.id}</TableCell>
                    <TableCell className="text-white/70">{order.date}</TableCell>
                    <TableCell className="text-white/70">{order.customer.name}</TableCell>
                    <TableCell className="text-white">${order.total.toFixed(2)}</TableCell>
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
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-white/60 py-8">
                      No orders yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl text-white">Customer Management</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/70">Customer</TableHead>
                  <TableHead className="text-white/70">Email</TableHead>
                  <TableHead className="text-white/70">Orders</TableHead>
                  <TableHead className="text-white/70">Total Spent</TableHead>
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
                        <TableCell colSpan={4} className="text-center text-white/60 py-8">
                          No customers yet
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return customers.map((customer) => (
                    <TableRow key={customer.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm">
                            {customer.name[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="text-white">{customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">{customer.email}</TableCell>
                      <TableCell className="text-white">{customer.orderCount}</TableCell>
                      <TableCell className="text-white">${customer.totalSpent.toFixed(2)}</TableCell>
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
