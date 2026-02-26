import { useState } from "react";
import { Search, Package, Truck, CheckCircle, Clock, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { orders, products } from "../../lib/mock-data";
import { toast } from "sonner@2.0.3";

interface SellerOrdersPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function SellerOrdersPage({ onNavigate }: SellerOrdersPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getOrdersWithDetails = () => {
    return orders.map((order) => ({
      ...order,
      customer: `Customer #${Math.floor(Math.random() * 1000)}`,
      items: order.items.map((item) => ({
        ...item,
        product: products.find((p) => p.id === item.productId)!,
      })),
    }));
  };

  const allOrders = getOrdersWithDetails();

  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingOrders = allOrders.filter((o) => o.status === "Processing");
  const shippedOrders = allOrders.filter((o) => o.status === "Shipped");
  const deliveredOrders = allOrders.filter((o) => o.status === "Delivered");

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
  };

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
          <p className="text-3xl text-white">{allOrders.length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-yellow-400" />
            <p className="text-sm text-white/60">Pending</p>
          </div>
          <p className="text-3xl text-white">{pendingOrders.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="h-5 w-5 text-purple-400" />
            <p className="text-sm text-white/60">Shipped</p>
          </div>
          <p className="text-3xl text-white">{shippedOrders.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="text-sm text-white/60">Delivered</p>
          </div>
          <p className="text-3xl text-white">{deliveredOrders.length}</p>
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

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start bg-white/5 border-b border-white/10 rounded-none px-4">
            <TabsTrigger value="all">All Orders ({allOrders.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="shipped">Shipped ({shippedOrders.length})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({deliveredOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/70">Order ID</TableHead>
                    <TableHead className="text-white/70">Date</TableHead>
                    <TableHead className="text-white/70">Customer</TableHead>
                    <TableHead className="text-white/70">Items</TableHead>
                    <TableHead className="text-white/70">Total</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-white/70 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white">{order.id}</TableCell>
                        <TableCell className="text-white/70">{order.date}</TableCell>
                        <TableCell className="text-white/70">{order.customer}</TableCell>
                        <TableCell className="text-white/70">{order.items.length} items</TableCell>
                        <TableCell className="text-white">${order.total.toFixed(2)}</TableCell>
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
                                className="bg-gradient-to-r from-purple-600 to-blue-600"
                                onClick={() => handleUpdateStatus(order.id, order.status === "Processing" ? "Shipped" : "Delivered")}
                              >
                                {order.status === "Processing" ? "Mark Shipped" : "Mark Delivered"}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-white/60 py-8">
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/70">Order ID</TableHead>
                    <TableHead className="text-white/70">Date</TableHead>
                    <TableHead className="text-white/70">Customer</TableHead>
                    <TableHead className="text-white/70">Items</TableHead>
                    <TableHead className="text-white/70">Total</TableHead>
                    <TableHead className="text-white/70 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingOrders.length > 0 ? (
                    pendingOrders.map((order) => (
                      <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white">{order.id}</TableCell>
                        <TableCell className="text-white/70">{order.date}</TableCell>
                        <TableCell className="text-white/70">{order.customer}</TableCell>
                        <TableCell className="text-white/70">{order.items.length} items</TableCell>
                        <TableCell className="text-white">${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onNavigate("orders")}
                            >
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-purple-600 to-blue-600"
                              onClick={() => handleUpdateStatus(order.id, "Shipped")}
                            >
                              Mark Shipped
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-white/60 py-8">
                        No pending orders
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="shipped" className="m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/70">Order ID</TableHead>
                    <TableHead className="text-white/70">Date</TableHead>
                    <TableHead className="text-white/70">Customer</TableHead>
                    <TableHead className="text-white/70">Items</TableHead>
                    <TableHead className="text-white/70">Total</TableHead>
                    <TableHead className="text-white/70 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shippedOrders.length > 0 ? (
                    shippedOrders.map((order) => (
                      <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white">{order.id}</TableCell>
                        <TableCell className="text-white/70">{order.date}</TableCell>
                        <TableCell className="text-white/70">{order.customer}</TableCell>
                        <TableCell className="text-white/70">{order.items.length} items</TableCell>
                        <TableCell className="text-white">${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onNavigate("orders")}
                            >
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-purple-600 to-blue-600"
                              onClick={() => handleUpdateStatus(order.id, "Delivered")}
                            >
                              Mark Delivered
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-white/60 py-8">
                        No shipped orders
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="delivered" className="m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/70">Order ID</TableHead>
                    <TableHead className="text-white/70">Date</TableHead>
                    <TableHead className="text-white/70">Customer</TableHead>
                    <TableHead className="text-white/70">Items</TableHead>
                    <TableHead className="text-white/70">Total</TableHead>
                    <TableHead className="text-white/70 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveredOrders.length > 0 ? (
                    deliveredOrders.map((order) => (
                      <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white">{order.id}</TableCell>
                        <TableCell className="text-white/70">{order.date}</TableCell>
                        <TableCell className="text-white/70">{order.customer}</TableCell>
                        <TableCell className="text-white/70">{order.items.length} items</TableCell>
                        <TableCell className="text-white">${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onNavigate("orders")}
                            >
                              View Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-white/60 py-8">
                        No delivered orders
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
