import React, { useState, useEffect, useCallback } from "react";
import { Search, Package, Truck, CheckCircle, Clock, Filter, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { get, put } from "../../lib/api";
import { toast } from "sonner";
import { formatCurrency } from "../../lib/currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { SellerReturnRequestModal } from "../SellerReturnRequestModal";

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
  revenueStatus?: string;
  isPaidOnline?: boolean;
  paymentMethod?: string;
  returnRequest?: { id: string };
  rawStatus: string;
}

interface OrderStats {
  total: number;
  pending: number;
  shipped: number;
  delivered: number;
  returns: number;
}

interface SellerOrdersPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const STATUS_VI: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Confirmed: "Đã xác nhận",
  Processing: "Đang xử lý",
  Shipped: "Đang giao",
  Delivered: "Đã giao",
  Cancelled: "Đã hủy",
  Refunded: "Hoàn tiền",
  RETURN_REQUESTED: "Chờ đổi trả",
  RETURNED: "Đã trả hàng",
  CANCEL_REQUESTED: "Yêu cầu hủy",
};

const normalizeStatusKey = (status?: string | null) =>
  status?.trim().toUpperCase().replace(/[\s-]+/g, "_") ?? "";

const getOrderStatusKey = (order: Pick<Order, "status" | "rawStatus">) =>
  normalizeStatusKey(order.rawStatus || order.status);

const getOrderDisplayStatus = (order: Pick<Order, "status" | "rawStatus">) => {
  const statusKey = getOrderStatusKey(order);
  return STATUS_VI[statusKey] ?? STATUS_VI[order.status] ?? order.status;
};

export function SellerOrdersPage({ onNavigate: _onNavigate }: SellerOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({ total: 0, pending: 0, shipped: 0, delivered: 0, returns: 0 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

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
      toast.error(err.message || 'Không thể tải đơn hàng');
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
      toast.success(`Đã cập nhật trạng thái đơn hàng ${orderId}`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApproveCancel = async (orderId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setUpdatingId(orderId);
      await put(`/api/v1/seller/orders/${orderId}/handle-cancel`, { action });
      await fetchOrders();
      toast.success(action === 'APPROVE' ? 'Đã đồng ý hủy đơn hàng' : 'Đã từ chối hủy đơn');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi xử lý yêu cầu hủy');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmCodPayment = async (orderId: string) => {
    try {
      setUpdatingId(orderId);
      await put(`/api/v1/seller/orders/${orderId}/confirm-cod-payment`, {});
      await fetchOrders();
      toast.success('Đã ghi nhận tiền COD và cộng doanh thu vào ví shop.');
    } catch (err: any) {
      toast.error(err.message || 'Không thể xác nhận tiền COD');
    } finally {
      setUpdatingId(null);
    }
  };


  const OrderTable = ({ rows, showStatus = true }: { rows: Order[]; showStatus?: boolean }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 hover:bg-gray-50">
            <TableHead className="text-gray-600">Mã đơn hàng</TableHead>
            <TableHead className="text-gray-600">Ngày</TableHead>
            <TableHead className="text-gray-600">Khách hàng</TableHead>
            <TableHead className="text-gray-600">Sản phẩm</TableHead>
            <TableHead className="text-gray-600">Tổng (Shop)</TableHead>
            {showStatus && <TableHead className="text-gray-600">Trạng thái</TableHead>}
            <TableHead className="text-gray-600 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((order) => (
              <TableRow key={order.id} className="border-gray-200 hover:bg-gray-50">
                <TableCell className="text-gray-900">{order.id}</TableCell>
                <TableCell className="text-gray-600">{order.date}</TableCell>
                <TableCell className="text-gray-600">{order.customer.name}</TableCell>
                <TableCell className="text-gray-600">{order.items.length} sản phẩm</TableCell>
                <TableCell className="text-gray-900">
                  <div>{formatCurrency(order.total)}</div>
                  {order.revenueStatus === 'PENDING' && (
                    <div className="text-[10px] text-yellow-600 font-medium bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100 inline-block mt-1">
                      Chờ quyết toán
                    </div>
                  )}
                  {order.revenueStatus === 'UNPAID' && (
                    <div className="text-[10px] text-gray-600 font-medium bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 inline-block mt-1">
                      {order.paymentMethod === 'cod' ? 'Chờ thu COD' : 'Chưa thanh toán'}
                    </div>
                  )}
                  {order.revenueStatus === 'RELEASED' && (
                    <div className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded border border-green-100 inline-block mt-1">
                      Đã về ví
                    </div>
                  )}
                </TableCell>
                {showStatus && (
                  <TableCell>
                    <Badge
                      className={
                        order.status === "Delivered"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : order.status === "Shipped"
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : getOrderStatusKey(order) === "RETURN_REQUESTED"
                          ? "bg-blue-50 text-blue-700 border-blue-300 animate-pulse"
                          : getOrderStatusKey(order) === "RETURNED"
                          ? "bg-blue-100 text-blue-800 border-blue-400"
                          : order.status === "Refunded"
                          ? "bg-orange-50 text-orange-600 border-orange-200"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }
                    >
                      {getOrderDisplayStatus(order)}
                    </Badge>
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Xem chi tiết
                    </Button>
                    {(order.status === "Pending" || order.status === "Confirmed") && (
                      <Button
                        size="sm"
                        disabled={updatingId === order.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleUpdateStatus(order.id, "Processing")}
                      >
                        {updatingId === order.id ? "Đang cập nhật..." : "Chuẩn bị hàng"}
                      </Button>
                    )}
                    {(order.status === "Processing" || order.status === "Shipped") && (
                      <Button
                        size="sm"
                        disabled={updatingId === order.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() =>
                          handleUpdateStatus(
                            order.id,
                            order.status === "Processing" ? "Shipped" : "Delivered"
                          )
                        }
                      >
                        {updatingId === order.id
                          ? "Đang cập nhật..."
                          : order.status === "Processing"
                          ? "Xác nhận giao hàng"
                          : "Xác nhận đã giao"}
                      </Button>
                    )}
                    {order.status === "Delivered" && order.paymentMethod === "cod" && order.revenueStatus === "UNPAID" && (
                      <Button
                        size="sm"
                        disabled={updatingId === order.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleConfirmCodPayment(order.id)}
                      >
                        {updatingId === order.id ? "Đang cập nhật..." : "Đã nhận tiền COD"}
                      </Button>
                    )}
                    {getOrderStatusKey(order) === "CANCEL_REQUESTED" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingId === order.id}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleApproveCancel(order.id, 'APPROVE')}
                        >
                          Đồng ý Hủy
                        </Button>
                        <Button
                          size="sm"
                          disabled={updatingId === order.id}
                          className="bg-gray-800 hover:bg-gray-900 text-white"
                          onClick={() => handleApproveCancel(order.id, 'REJECT')}
                        >
                          Từ chối
                        </Button>
                      </>
                    )}
                    {getOrderStatusKey(order) === "RETURN_REQUESTED" && (
                       <Button
                         size="sm"
                         className="bg-blue-600 hover:bg-blue-700 text-white"
                         onClick={() => {
                           setSelectedRequestId(order.returnRequest?.id || null);
                           setIsReturnModalOpen(true);
                         }}
                       >
                         Quản lý đổi / trả
                       </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={showStatus ? 7 : 6} className="text-center text-gray-500 py-8">
                Không tìm thấy đơn hàng
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
        <h1 className="text-4xl text-gray-900 mb-2">Quản lý đơn hàng</h1>
        <p className="text-gray-500">Theo dõi và quản lý đơn hàng khách hàng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-5 w-5 text-blue-400" />
            <p className="text-sm text-gray-500">Tổng đơn hàng</p>
          </div>
          <p className="text-3xl text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-yellow-400" />
            <p className="text-sm text-gray-500">Chờ xử lý</p>
          </div>
          <p className="text-3xl text-gray-900">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-gray-500">Đang giao</p>
          </div>
          <p className="text-3xl text-gray-900">{stats.shipped}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="text-sm text-gray-500">Đã giao</p>
          </div>
          <p className="text-3xl text-gray-900">{stats.delivered}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <RotateCcw className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-gray-500">Đổi hàng / Hoàn tiền</p>
          </div>
          <p className="text-3xl text-gray-900">{stats.returns}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl text-gray-900">Tất cả đơn hàng</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm đơn hàng..."
                  className="pl-10 bg-gray-50 border-gray-200 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px] bg-gray-50 border-gray-200 text-gray-900">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Processing">Đang xử lý</SelectItem>
                  <SelectItem value="Shipped">Đang giao</SelectItem>
                  <SelectItem value="Delivered">Đã giao</SelectItem>
                  <SelectItem value="RETURN_REQUESTED">Đổi / Trả hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Đang tải đơn hàng...</div>
        ) : (
          <Tabs
            value={statusFilter === "all" ? "all" : statusFilter === "Processing" ? "pending" : statusFilter === "Shipped" ? "shipped" : statusFilter === "Delivered" ? "delivered" : "returns"}
            onValueChange={(tab: string) => {
              if (tab === "all") setStatusFilter("all");
              else if (tab === "pending") setStatusFilter("Processing");
              else if (tab === "shipped") setStatusFilter("Shipped");
              else if (tab === "delivered") setStatusFilter("Delivered");
              else if (tab === "returns") setStatusFilter("RETURN_REQUESTED");
            }}
            className="w-full"
          >
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="all">Tất cả ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Chờ xử lý ({stats.pending})</TabsTrigger>
              <TabsTrigger value="shipped">Đang giao ({stats.shipped})</TabsTrigger>
              <TabsTrigger value="delivered">Đã giao ({stats.delivered})</TabsTrigger>
              <TabsTrigger value="returns">Đổi / Trả ({stats.returns})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="m-0">
              <OrderTable rows={orders} showStatus={true} />
            </TabsContent>

            <TabsContent value="pending" className="m-0">
              <OrderTable rows={orders} showStatus={false} />
            </TabsContent>

            <TabsContent value="shipped" className="m-0">
              <OrderTable rows={orders} showStatus={false} />
            </TabsContent>

            <TabsContent value="delivered" className="m-0">
              <OrderTable rows={orders} showStatus={false} />
            </TabsContent>
            
            <TabsContent value="returns" className="m-0">
              <OrderTable
                rows={orders.filter(o => {
                  const statusKey = getOrderStatusKey(o);
                  return statusKey === "RETURN_REQUESTED" || statusKey === "RETURNED" || statusKey === "REFUNDED";
                })}
                showStatus={true}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Chi tiết đơn hàng — {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-2">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Khách hàng</p>
                  <p className="text-gray-900">{selectedOrder.customer.name}</p>
                  <p className="text-gray-500">{selectedOrder.customer.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Thông tin đơn hàng</p>
                  <p className="text-gray-900">Ngày: {selectedOrder.date}</p>
                  <p className="text-gray-900">
                    Trạng thái:{" "}
                    <span className={
                      selectedOrder.status === "Delivered"
                        ? "text-green-400"
                        : selectedOrder.status === "Shipped"
                        ? "text-blue-600"
                        : "text-yellow-400"
                    }>
                      {getOrderDisplayStatus(selectedOrder)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-gray-400 text-sm mb-3">Sản phẩm ({selectedOrder.items.length})</p>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm truncate">{item.productName}</p>
                        <p className="text-gray-400 text-xs">
                          {item.selectedColor ? `Màu: ${item.selectedColor}` : ""}
                          {item.selectedColor && item.selectedSize ? " · " : ""}
                          {item.selectedSize ? `Kích cỡ: ${item.selectedSize}` : ""}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">SL: {item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                      <p className="text-gray-900 text-sm font-medium flex-shrink-0">
                        {formatCurrency(item.quantity * item.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                <span className="text-gray-500">Tổng cộng (Shop)</span>
                <span className="text-gray-900 text-lg">{formatCurrency(selectedOrder.total)}</span>
              </div>

              {/* Update Status */}
              {(selectedOrder.status === "Processing" || selectedOrder.status === "Shipped") && (
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    disabled={updatingId === selectedOrder.id}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={async () => {
                      await handleUpdateStatus(
                        selectedOrder.id,
                        selectedOrder.status === "Processing" ? "Shipped" : "Delivered"
                      );
                      setSelectedOrder(null);
                    }}
                  >
                    {updatingId === selectedOrder.id
                      ? "Đang cập nhật..."
                      : selectedOrder.status === "Processing"
                      ? "Xác nhận giao hàng"
                      : "Xác nhận đã giao"}
                  </Button>
                </div>
              )}
              {selectedOrder.status === "Delivered" && selectedOrder.paymentMethod === "cod" && selectedOrder.revenueStatus === "UNPAID" && (
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    disabled={updatingId === selectedOrder.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={async () => {
                      await handleConfirmCodPayment(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                  >
                    {updatingId === selectedOrder.id ? "Đang cập nhật..." : "Đã nhận tiền COD"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SellerReturnRequestModal
        isOpen={isReturnModalOpen}
        onOpenChange={setIsReturnModalOpen}
        requestId={selectedRequestId || ""}
        onSuccess={() => fetchOrders()}
      />
    </div>
  );
}
