import React, { useState, useEffect } from "react";
import { TrendingUp, ShoppingBag, Users, Package, Plus, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { get } from "../../lib/api";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface DashboardPageProps {
  onNavigate: (page: string, payload?: any) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    totalProducts: 0,
    productsChange: 0,
    totalCustomers: 0,
    customersChange: 0,
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        const [statsData, salesDataRes, productsRes, ordersRes] = await Promise.all([
          get("/api/v1/seller/dashboard/stats"),
          get("/api/v1/seller/dashboard/sales-data"),
          get("/api/v1/seller/products?limit=6"), // Fetch limited recent products
          get("/api/v1/seller/orders?limit=5")    // Fetch limited recent orders
        ]);
        
        setStats(statsData || stats);
        setSalesData(salesDataRes || []);
        
        // Ensure array mapping
        setRecentProducts(productsRes.data || productsRes.items || []);
        setRecentOrders(ordersRes.items || ordersRes.data || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

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
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              +{stats.revenueChange}%
            </Badge>
          </div>
          <p className="text-sm text-white/60 mb-1">Total Revenue</p>
          <p className="text-3xl text-white">
            ${isLoading ? "..." : (stats.totalRevenue / 1000).toFixed(1)}K
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-blue-400" />
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              +{stats.ordersChange}%
            </Badge>
          </div>
          <p className="text-sm text-white/60 mb-1">Total Orders</p>
          <p className="text-3xl text-white">{isLoading ? "..." : stats.totalOrders.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Package className="h-6 w-6 text-pink-400" />
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              +{stats.productsChange}%
            </Badge>
          </div>
          <p className="text-sm text-white/60 mb-1">Products</p>
          <p className="text-3xl text-white">{isLoading ? "..." : stats.totalProducts}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-orange-400" />
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              +{stats.customersChange}%
            </Badge>
          </div>
          <p className="text-sm text-white/60 mb-1">Customers</p>
          <p className="text-3xl text-white">{isLoading ? "..." : (stats.totalCustomers / 1000).toFixed(1)}K</p>
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
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10 bg-white/5 border-white/10"
                  />
                </div>
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                  onClick={() => onNavigate("add-product")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
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
                {recentProducts.slice(0, 6).map((product) => (
                  <TableRow key={product.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={product.images?.[0] || ""}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span>{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white/70">{product.category?.name || "Uncategorized"}</TableCell>
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
                      <Badge className="bg-green-500/20 text-green-400">Active</Badge>
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
                {recentOrders.slice(0, 5).map((order) => (
                  <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white">{order.id}</TableCell>
                    <TableCell className="text-white/70">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-white/70">
                      {order.user?.firstName ? `${order.user.firstName} ${order.user.lastName}` : `Customer #${order.userId?.substring(0,4) || "Unknown"}`}
                    </TableCell>
                    <TableCell className="text-white">${order.totalAmount}</TableCell>
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
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <Users className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-2xl text-white mb-2">Customer Management</h3>
            <p className="text-white/60 mb-4">
              View and manage your customer base, analytics, and insights.
            </p>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-blue-600"
              onClick={() => onNavigate("dashboard")}
            >
              View All Customers
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
