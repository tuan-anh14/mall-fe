import React, { useState, useEffect, useCallback } from "react";
import { Search, Package, Truck, CheckCircle, Clock, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { get, put } from "../../lib/api";
import { toast } from "sonner@2.0.3";

interface OrderCustomer {
  id: string;
  name: string;
  email: string;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  selectedColor: string | null;
  selectedSize: string | null;
  productName: string;
  productImage: string | null;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  customer: OrderCustomer;
  items: OrderItem[];
}

interface OrderStats {
  total: number;
  pending: number;
  shipped: number;
  delivered: number;
}

interface SellerOrdersPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function SellerOrdersPage({ onNavigate }: SellerOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({ total: 0, pending: 0, shipped: 0, delivered: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const query = params.toString();
      const res = await get<{ data: Order[]; stats: OrderStats }>(
        `/api/v1/seller/orders${query ? `?${query}` : ''}`
      );
      setOrders(res.data);
      setStats(res.stats);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await put(`/api/v1/seller/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "Processing");
  const shippedOrders = orders.filter((o) => o.status === "Shipped");
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");

  const OrderTable = ({ rows, showStatus = true }: { rows: Order[]; showStatus?: boolean }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-white/5">
            <TableHead className="text-white/70">Order ID</TableHead>
            <TableHead className="text-white/70">Date</TableHead>
            <TableHead className="text-white/70">Customer</TableHead>
            <TableHead className="text-white/70">Items</TableHead>
            <TableHead className="text-white/70">Total</TableHead>
            {showStatus && <TableHead className="text-white/70">Status</TableHead>}
            <TableHead className="text-white/70 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((order) => (
              <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="text-white">{order.id}</TableCell>
                <TableCell className="text-white/70">{order.date}</TableCell>
                <TableCell className="text-white/70">{order.customer.name}</TableCell>
                <TableCell className="text-white/70">{order.items.length} items</TableCell>
                <TableCell className="text-white">${order.total.toFixed(2)}</TableCell>
                {showStatus && (
                  <TableCell>
                    <Badge
                      className={
                        order.status === "Delivered"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : order.status === "Shipped"
                          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigate("orders")}
                    >
                      View Details
                    </Button>
                    {order.status !== "Delivered" && (
                      <Button
                        size="sm"
                        disabled={updatingId === order.id}
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                        onClick={() =>
                          handleUpdateStatus(
                            order.id,
                            order.status === "Processing" ? "Shipped" : "Delivered"
                          )
                        }
                      >
                        {updatingId === order.id
                          ? "Updating..."
                          : order.status === "Processing"
                          ? "Mark Shipped"
                          : "Mark Delivered"}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={showStatus ? 7 : 6} className="text-center text-white/60 py-8">
                No orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl text-white mb-2">Order Management</h1>
        <p className="text-white/60">Track and manage customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-5 w-5 text-blue-400" />
            <p className="text-sm text-white/60">Total Orders</p>
          </div>
          <p className="text-3xl text-white">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-yellow-400" />
            <p className="text-sm text-white/60">Pending</p>
          </div>
          <p className="text-3xl text-white">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="h-5 w-5 text-purple-400" />
            <p className="text-sm text-white/60">Shipped</p>
          </div>
          <p className="text-3xl text-white">{stats.shipped}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="text-sm text-white/60">Delivered</p>
          </div>
          <p className="text-3xl text-white">{stats.delivered}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl text-white">All Orders</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <Input
                  placeholder="Search orders..."
                  className="pl-10 bg-white/5 border-white/10 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px] bg-white/5 border-white/10 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white/60 py-12">Loading orders...</div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start bg-white/5 border-b border-white/10 rounded-none px-4">
              <TabsTrigger value="all">All Orders ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="shipped">Shipped ({stats.shipped})</TabsTrigger>
              <TabsTrigger value="delivered">Delivered ({stats.delivered})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="m-0">
              <OrderTable rows={orders} showStatus={true} />
            </TabsContent>

            <TabsContent value="pending" className="m-0">
              <OrderTable rows={pendingOrders} showStatus={false} />
            </TabsContent>

            <TabsContent value="shipped" className="m-0">
              <OrderTable rows={shippedOrders} showStatus={false} />
            </TabsContent>

            <TabsContent value="delivered" className="m-0">
              <OrderTable rows={deliveredOrders} showStatus={false} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
