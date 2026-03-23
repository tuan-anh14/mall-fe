import { useState, useEffect } from "react";
import { Check, Package, Truck, MapPin, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { get } from "../../lib/api";
import { formatCurrency } from "../../lib/currency";

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
  product?: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
}

interface Order {
  id: string;
  date: string;
  status: string;
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  total: number;
  couponCode?: string;
  couponDiscount?: number | null;
  items: OrderItem[];
  tracking: OrderTracking;
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
}

const STATUS_LABEL_VI: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao hàng",
  OUT_FOR_DELIVERY: "Đang giao tới bạn",
  DELIVERED: "Đã giao thành công",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
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
};

function getTrackingIcon(status: string): React.ElementType {
  return STATUS_ICON_MAP[status] || Package;
}

export function OrderTrackingPage({ onNavigate, orderId }: OrderTrackingPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchOrders();
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
                  className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                    selectedOrder?.id === order.id
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
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Ngày đặt hàng</p>
                  <p className="text-gray-900">
                    {currentOrder.date
                      ? new Date(currentOrder.date).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Dự kiến giao hàng</p>
                  <p className="text-gray-900">Hôm nay trước 18:00</p>
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
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                              isCompleted
                                ? "bg-blue-600 border-blue-600"
                                : isCurrent
                                ? "border-blue-600 bg-blue-50 animate-pulse"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <Icon
                              className={`h-6 w-6 ${
                                isCompleted || isCurrent ? "text-white" : "text-gray-300"
                              }`}
                            />
                          </div>
                          {index < currentOrder.tracking.steps.length - 1 && (
                            <div
                              className={`w-0.5 h-16 ${
                                isCompleted ? "bg-blue-600" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>

                        <div className="flex-1 pb-8">
                          <h3
                            className={`text-lg mb-1 ${
                              isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {step.label}
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

              {/* Delivery Map Placeholder */}
              <div className="mt-8 bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
                <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-xl text-gray-900 mb-2">Theo dõi trên bản đồ</h3>
                <p className="text-gray-500 mb-4">
                  Gói hàng của bạn đang trên đường! Theo dõi người giao hàng theo thời gian thực.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Xem theo dõi trực tiếp
                </Button>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h2 className="text-2xl text-gray-900 mb-6">Sản phẩm trong đơn</h2>

              <div className="space-y-4">
                {currentOrder.items.map((item) => {
                  const name = item.productName ?? item.product?.name ?? "Sản phẩm";
                  const image = item.productImage ?? item.product?.image;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 bg-gray-50 rounded-xl p-4"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={image}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-1">{name}</h3>
                        <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                        {item.selectedColor && (
                          <p className="text-sm text-gray-500">Màu: {item.selectedColor}</p>
                        )}
                        {item.selectedSize && (
                          <p className="text-sm text-gray-500">Kích cỡ: {item.selectedSize}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="bg-gray-200 my-6" />

              <div className="space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(currentOrder.subtotal ?? currentOrder.total)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Vận chuyển</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    MIỄN PHÍ
                  </Badge>
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
            <div className="mt-8 flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onNavigate("help")}
              >
                Liên hệ hỗ trợ
              </Button>
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
    </div>
  );
}
