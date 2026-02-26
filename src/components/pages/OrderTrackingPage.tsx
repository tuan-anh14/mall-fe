import { Check, Package, Truck, MapPin, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { orders, products } from "../../lib/mock-data";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface OrderTrackingPageProps {
  onNavigate: (page: string) => void;
}

export function OrderTrackingPage({ onNavigate }: OrderTrackingPageProps) {
  const currentOrder = orders[1]; // Out for Delivery order

  const getOrderItems = () => {
    return currentOrder.items.map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId)!,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => onNavigate("profile")}>
            ← Back to Orders
          </Button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl text-white mb-2">Order Tracking</h1>
              <p className="text-white/60">Order ID: {currentOrder.id}</p>
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
              {currentOrder.status}
            </Badge>
          </div>

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-white/60 mb-1">Order Date</p>
              <p className="text-white">{currentOrder.date}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-white/60 mb-1">Estimated Delivery</p>
              <p className="text-white">Today by 6:00 PM</p>
            </div>
          </div>

          <Separator className="bg-white/10 mb-8" />

          {/* Tracking Steps */}
          <div className="space-y-6">
            {currentOrder.tracking.steps.map((step, index) => {
              const isCompleted = step.completed;
              const isCurrent = currentOrder.tracking.current === step.status;

              const icons = {
                ordered: Package,
                confirmed: Check,
                shipped: Truck,
                out_for_delivery: MapPin,
                delivered: CheckCircle,
              };

              const Icon = icons[step.status as keyof typeof icons];

              return (
                <div key={step.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500"
                          : isCurrent
                          ? "border-purple-500 bg-purple-500/20 animate-pulse"
                          : "border-white/20 bg-white/5"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          isCompleted || isCurrent ? "text-white" : "text-white/30"
                        }`}
                      />
                    </div>
                    {index < currentOrder.tracking.steps.length - 1 && (
                      <div
                        className={`w-0.5 h-16 ${
                          isCompleted ? "bg-purple-500" : "bg-white/10"
                        }`}
                      />
                    )}
                  </div>

                  <div className="flex-1 pb-8">
                    <h3
                      className={`text-lg mb-1 ${
                        isCompleted || isCurrent ? "text-white" : "text-white/50"
                      }`}
                    >
                      {step.label}
                    </h3>
                    <p className="text-sm text-white/60">{step.date}</p>
                    {isCurrent && (
                      <Badge className="mt-2 bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Current Status
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery Map Placeholder */}
          <div className="mt-8 bg-white/5 rounded-xl p-8 text-center border-2 border-dashed border-white/10">
            <MapPin className="h-12 w-12 text-purple-400 mx-auto mb-3" />
            <h3 className="text-xl text-white mb-2">Track on Map</h3>
            <p className="text-white/60 mb-4">
              Your package is on its way! Track the delivery driver in real-time.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              View Live Tracking
            </Button>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl text-white mb-6">Order Items</h2>

          <div className="space-y-4">
            {getOrderItems().map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 bg-white/5 rounded-xl p-4"
              >
                <div className="w-20 h-20 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-white mb-1">{item.product.name}</h3>
                  <p className="text-sm text-white/60">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="bg-white/10 my-6" />

          <div className="space-y-2">
            <div className="flex justify-between text-white/70">
              <span>Subtotal</span>
              <span>${currentOrder.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Shipping</span>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                FREE
              </Badge>
            </div>
            <Separator className="bg-white/10" />
            <div className="flex justify-between items-center">
              <span className="text-xl text-white">Total</span>
              <span className="text-2xl text-white">
                ${currentOrder.total.toFixed(2)}
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
            Contact Support
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
            onClick={() => onNavigate("shop")}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
