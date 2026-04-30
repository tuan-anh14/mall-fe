import { useState, useEffect } from "react";
import { Check, Package, Truck, MapPin, CheckCircle, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { get, put } from "../../lib/api";
import { formatCurrency } from "../../lib/currency";
import { toast } from "sonner";
import { walletService } from "../../services/wallet.service";
import { ReturnRequestModal } from "../ReturnRequestModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";

interface TrackingStep {
  status: string;
  label: string;
  description?: string;
  date?: string;
  completed: boolean;
}

interface OrderTracking {
  current: string;
  steps: TrackingStep[];
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  productName?: string;
  productImage?: string;
  selectedColor?: string;
  selectedSize?: string;
  sellerOrderId?: string; // Link tới SellerOrder
  sellerId?: string;      // SellerProfile.id
  sellerName?: string;    // Tên Shop
  product?: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
}

interface SellerOrderTracking {
  current: string;
  steps: TrackingStep[];
}

interface SellerOrder {
  id: string;           // SellerOrder.id
  sellerId: string;
  sellerName: string;
  status: string;       // Status riêng của seller này
  tracking: SellerOrderTracking;
  items: OrderItem[];
}

interface Order {
  id: string;
  date: string;
  status: string;       // Status tổng hợp của toàn đơn
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  total: number;
  couponCode?: string;
  couponDiscount?: number | null;
  paymentMethod?: string;
  paymentRef?: string;
  items: OrderItem[];   // Tất cả items (flat list cho backward-compat)
  tracking: OrderTracking; // Legacy tracking
  sellerOrders?: SellerOrder[]; // Sub-orders per seller (Multi-vendor)
  shippingAddress?: {
    fullName?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

interface OrderTrackingPageProps {
  onNavigate: (page: string, data?: any) => void;
  orderId?: string;
  onCartRefresh?: () => Promise<void>;
}

const STATUS_LABEL_VI: Record<string, string> = {
  ORDERED: "Đã đặt hàng",
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang vận chuyển",
  OUT_FOR_DELIVERY: "Đang giao hàng",
  DELIVERED: "Đã giao hàng thành công",
  CANCELLED: "Đã hủy",
  CANCEL_REQUESTED: "Đang chờ duyệt hủy...",
  REFUNDED: "Đã hoàn tiền",
  RETURN_REQUESTED: "Yêu cầu trả hàng",
  RETURN_APPROVED: "Đã chấp nhận yêu cầu",
  RETURNED: "Hoàn trả hàng thành công",
};

const STATUS_ICON_MAP: Record<string, React.ElementType> = {
  ORDERED: Package,
  ordered: Package,
  PENDING: Package,
  pending: Package,
  CONFIRMED: Check,
  confirmed: Check,
  PROCESSING: Check,
  processing: Check,
  SHIPPED: Truck,
  shipped: Truck,
  OUT_FOR_DELIVERY: MapPin,
  out_for_delivery: MapPin,
  DELIVERED: CheckCircle,
  delivered: CheckCircle,
  CANCEL_REQUESTED: AlertCircle,
  RETURN_REQUESTED: RotateCcw,
  RETURNED: CheckCircle,
  CANCELLED: AlertCircle,
};

const RETURN_WINDOW_DAYS = 7;

function getTrackingIcon(status: string): React.ElementType {
  return STATUS_ICON_MAP[status] || Package;
}

function getDeliveredAt(order: Order) {
  const deliveredStep = order.tracking?.steps?.find(
    (step) => step.status?.toUpperCase() === "DELIVERED" && step.date,
  );
  return deliveredStep?.date ?? null;
}

function canRequestReturn(order: Order) {
  if (order.status !== "DELIVERED") return false;
  const deliveredAt = getDeliveredAt(order);
  if (!deliveredAt) return false;
  const expiresAt = new Date(deliveredAt);
  expiresAt.setDate(expiresAt.getDate() + RETURN_WINDOW_DAYS);
  return new Date() <= expiresAt;
}

function getPaymentStatus(order: Order) {
  if (order.status === "CANCELLED") {
    return { label: "Đã hủy đơn", color: "text-red-600" };
  }
  if (order.status === "CANCEL_REQUESTED") {
    return { label: "Chờ hoàn tiền", color: "text-amber-600" };
  }
  if (order.status === "REFUNDED" || order.status === "RETURNED") {
    return { label: "Đã hoàn tiền", color: "text-blue-600" };
  }
  if (order.paymentMethod === "cod") {
    if (order.status === "DELIVERED") return { label: "Đã thanh toán", color: "text-green-600" };
    return { label: "Thanh toán lúc nhận", color: "text-amber-600" };
  }
  if (order.status !== "PENDING") {
    return { label: "Đã thanh toán", color: "text-green-600" };
  }
  return { label: "Chưa thanh toán", color: "text-amber-600" };
}

export function OrderTrackingPage({ onNavigate, orderId, onCartRefresh }: OrderTrackingPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await get<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number }>(
        "/api/v1/orders?page=1&limit=20"
      );
      const fetchedOrders = res.orders ?? [];
      setOrders(fetchedOrders);

      if (fetchedOrders.length > 0) {
        if (orderId) {
          const found = fetchedOrders.find((o) => o.id === orderId);
          setSelectedOrder(found ?? fetchedOrders[0]);
        } else {
          setSelectedOrder(fetchedOrders[0]);
        }
      }
    } catch {
      // Failed to fetch orders; leave empty
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    if (!selectedOrder) return;
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedOrder) return;

    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy");
      return;
    }

    setCancelling(true);
    try {
      await put(`/api/v1/orders/${selectedOrder.id}/cancel`, {
        cancelReason: cancelReason
      });

      toast.success("Đã gửi yêu cầu hủy đơn hàng thành công");
      setIsCancelModalOpen(false);
      setCancelReason("");
      await fetchOrders();
    } catch (error: any) {
      toast.error(error.message || "Không thể hủy đơn hàng");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    const handleVnpayCallback = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const txnRef = searchParams.get("vnp_TxnRef");
      const responseCode = searchParams.get("vnp_ResponseCode");

      const isOrderPayment = txnRef?.startsWith("ORD-") || txnRef?.startsWith("ORDERPAY-");

      if (isOrderPayment && responseCode) {
        try {
          const result: any = await walletService.verifyVnpayCallback(window.location.search);
          if (responseCode === "00") {
            if (result?.orderId) {
              onNavigate("orders", { orderId: result.orderId });
            }
            toast.success("Thanh toán đơn hàng thành công!");
          } else if (responseCode === "24") {
            toast.error("Bạn đã hủy thanh toán. Đơn hàng đã bị hủy.");
            if (onCartRefresh) await onCartRefresh();
            onNavigate("checkout");
            return;
          } else {
            toast.error("Thanh toán đơn hàng thất bại.");
            if (onCartRefresh) await onCartRefresh();
            onNavigate("checkout");
            return;
          }
        } catch (error) {
          console.error("Failed to verify VNPay callback", error);
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
      fetchOrders();
    };

    handleVnpayCallback();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center py-32">
          <div className="text-gray-500 text-lg">Đang tải đơn hàng...</div>
        </div>
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => onNavigate("profile")}>
              ← Quay lại đơn hàng
            </Button>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-16 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl text-gray-900 mb-2">Chưa có đơn hàng</h2>
            <p className="text-gray-500 mb-6">Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => onNavigate("shop")}
            >
              Bắt đầu mua sắm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentOrder = selectedOrder;
  const showReturnButton = currentOrder ? canRequestReturn(currentOrder) : false;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => onNavigate("profile")}>
            ← Quay lại đơn hàng
          </Button>
        </div>

        {/* Order List */}
        {orders.length > 1 && (
          <div className="mb-6 space-y-2">
            <h2 className="text-gray-500 text-sm uppercase tracking-wider mb-3">Chọn đơn hàng</h2>
            <div className="flex flex-wrap gap-2">
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all ${selectedOrder?.id === order.id
                    ? "border-blue-600 bg-blue-50 text-gray-900"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-400"
                    }`}
                >
                  {order.id}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentOrder && (
          <>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-3xl text-gray-900 mb-2">Theo dõi đơn hàng</h1>
                  <p className="text-gray-500">Mã đơn hàng: {currentOrder.id}</p>
                </div>
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                  {STATUS_LABEL_VI[currentOrder.status] ?? currentOrder.status}
                </Badge>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Ngày đặt hàng</p>
                  <p className="text-gray-900 font-medium">
                    {currentOrder.date
                      ? new Date(currentOrder.date).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                      : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Dự kiến giao</p>
                  <p className="text-gray-900 font-medium">Hôm nay trước 18:00</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Phương thức</p>
                  <p className="text-gray-900 font-medium capitalize">
                    {currentOrder.paymentMethod === "vnpay"
                      ? "VNPAY"
                      : currentOrder.paymentMethod === "wallet"
                        ? "Shop Wallet"
                        : currentOrder.paymentMethod === "cod"
                          ? "COD"
                          : currentOrder.paymentMethod === "card"
                            ? "Thẻ"
                            : currentOrder.paymentMethod || "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Thanh toán</p>
                  <p className={`font-medium ${getPaymentStatus(currentOrder).color}`}>
                    {getPaymentStatus(currentOrder).label}
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-200 mb-8" />

              {/* Tracking Steps */}
              {currentOrder.tracking?.steps && currentOrder.tracking.steps.length > 0 ? (
                <div className="space-y-6">
                  {currentOrder.tracking.steps.map((step, index) => {
                    const isCompleted = step.completed;
                    const isCurrent = currentOrder.tracking.current === step.status;
                    const Icon = getTrackingIcon(step.status);

                    return (
                      <div key={`${step.status}-${index}`} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${step.status === "CANCELLED"
                              ? "bg-red-100 border-red-600"
                              : step.status === "CANCEL_REQUESTED"
                                ? "bg-amber-100 border-amber-600 animate-pulse"
                                : isCompleted || step.status === "RETURNED"
                                  ? "bg-blue-600 border-blue-600"
                                  : isCurrent || step.status === "RETURN_REQUESTED"
                                    ? "border-blue-600 bg-blue-50 animate-pulse"
                                    : "border-gray-200 bg-gray-50"
                              }`}
                          >
                            <Icon
                              className={`h-6 w-6 ${isCompleted || isCurrent ? "text-white" : "text-gray-300"
                                }`}
                            />
                          </div>
                          {index < currentOrder.tracking.steps.length - 1 && (
                            <div
                              className={`w-0.5 h-16 ${isCompleted ? "bg-blue-600" : "bg-gray-200"
                                }`}
                            />
                          )}
                        </div>

                        <div className="flex-1 pb-8">
                          <h3
                            className={`text-lg mb-1 ${isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                              }`}
                          >
                            {STATUS_LABEL_VI[step.status.toUpperCase()] || step.label}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {step.date
                              ? new Date(step.date).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              : ""}
                          </p>
                          {step.description && (
                            <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                          )}
                          {isCurrent && (
                            <Badge className="mt-2 bg-blue-50 text-blue-600 border-blue-200">
                              Trạng thái hiện tại
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-400 text-sm py-4">Không có thông tin theo dõi.</div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h2 className="text-2xl text-gray-900 mb-6">Sản phẩm trong đơn</h2>

              <div className="space-y-4">
                {/* Hiển thị danh sách sản phẩm của Đơn Hàng (Đã được tách riêng rẽ theo Shop từ backend) */}
                <div className="space-y-3">
                  <div className="bg-blue-50 px-4 py-2.5 flex items-center gap-2 border-b border-blue-100 rounded-t-xl">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold text-blue-700">{currentOrder.items[0]?.sellerName ?? 'Shop'}</span>
                    <span className="text-xs text-blue-400 ml-auto">{currentOrder.items.length} sản phẩm</span>
                  </div>
                  <div className="p-4 border border-t-0 border-blue-100 rounded-b-xl space-y-3">
                    {currentOrder.items.map((item) => {
                      const name = item.productName ?? item.product?.name ?? 'Sản phẩm';
                      const image = item.productImage ?? item.product?.image;
                      return (
                        <div key={item.id} className="flex gap-4 bg-gray-50 rounded-xl p-4">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <ImageWithFallback src={image} alt={name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-gray-900 mb-1">{name}</h3>
                            <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                            {item.selectedColor && <p className="text-sm text-gray-500">Màu: {item.selectedColor}</p>}
                            {item.selectedSize && <p className="text-sm text-gray-500">Kích cỡ: {item.selectedSize}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-xl text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-200 my-6" />

              <div className="space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(currentOrder.subtotal ?? currentOrder.total)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Vận chuyển</span>
                  {Number(currentOrder.shippingCost) > 0 ? (
                    <span>{formatCurrency(Number(currentOrder.shippingCost))}</span>
                  ) : (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      MIỄN PHÍ
                    </Badge>
                  )}
                </div>
                {currentOrder.couponDiscount != null && currentOrder.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Giảm giá {currentOrder.couponCode ? `(${currentOrder.couponCode})` : ""}</span>
                    <span>-{formatCurrency(Number(currentOrder.couponDiscount))}</span>
                  </div>
                )}
                {currentOrder.tax != null && currentOrder.tax > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Thuế</span>
                    <span>{formatCurrency(Number(currentOrder.tax))}</span>
                  </div>
                )}
                <Separator className="bg-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-xl text-gray-900">Tổng cộng</span>
                  <span className="text-2xl text-gray-900">
                    {formatCurrency(Number(currentOrder.total))}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                variant="outline"
                className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Liên hệ hỗ trợ
              </Button>

              {currentOrder && ["PENDING", "CONFIRMED", "PROCESSING"].includes(currentOrder.status) && (
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? "Đang xử lý..." : "Hủy đơn hàng"}
                </Button>
              )}

              {currentOrder && currentOrder.status === "CANCEL_REQUESTED" && (
                <Button
                  variant="outline"
                  className="flex-1 bg-amber-50 text-amber-600 border-amber-200"
                  disabled
                >
                  Đang chờ hủy...
                </Button>
              )}

              {showReturnButton && (
                <Button
                  variant="outline"
                  className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsReturnModalOpen(true)}
                >
                  Yêu cầu trả hàng
                </Button>
              )}

              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => onNavigate("shop")}
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          </>
        )}
      </div>

      {currentOrder && (
        <ReturnRequestModal
          isOpen={isReturnModalOpen}
          onOpenChange={setIsReturnModalOpen}
          orderId={currentOrder.id}
          onSuccess={() => {
            // Re-fetch orders to show updated status if needed
            window.location.reload();
          }}
        />
      )}

      {/* Cancel Order Modal - Tương tự Modal đăng ký người bán ở Header */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-xl font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Hủy đơn hàng
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng <span className="font-semibold text-red-600">{currentOrder?.id}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Lý do hủy đơn <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ví dụ: Tôi muốn đổi địa chỉ, Đặt nhầm sản phẩm,..."
                rows={4}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                className="flex-1 rounded-xl hover:bg-gray-100"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={cancelling}
              >
                Đóng
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-100"
                onClick={confirmCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận hủy"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
