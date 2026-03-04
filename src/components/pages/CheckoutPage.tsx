import { useState, useEffect } from "react";
import { CreditCard, MapPin, Package, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { CartItem } from "../../App";
import { toast } from "sonner@2.0.3";
import { get, post } from "../../lib/api";

interface CheckoutPageProps {
  onNavigate: (page: string, data?: any) => void;
  cartItems?: CartItem[];
  onOrderPlaced?: () => void;
  user?: any;
}

export function CheckoutPage({ onNavigate, cartItems = [], onOrderPlaced, user }: CheckoutPageProps) {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Shipping form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  // Pre-fill from user profile + saved addresses
  useEffect(() => {
    const prefill = async () => {
      try {
        const [profileRes, addrRes] = await Promise.allSettled([
          get<{ user: any }>("/api/v1/users/me"),
          get<{ addresses: any[] }>("/api/v1/users/me/addresses"),
        ]);

        if (profileRes.status === "fulfilled") {
          const u = profileRes.value.user;
          setFirstName((v) => v || u.firstName || "");
          setLastName((v) => v || u.lastName || "");
          setEmail((v) => v || u.email || "");
          setPhone((v) => v || u.phone || "");
        }

        if (addrRes.status === "fulfilled") {
          const addrs = addrRes.value.addresses ?? [];
          const defaultAddr = addrs.find((a: any) => a.isDefault) ?? addrs[0];
          if (defaultAddr) {
            setAddress((v) => v || defaultAddr.street || "");
            setCity((v) => v || defaultAddr.city || "");
            setState((v) => v || defaultAddr.state || "");
            setZip((v) => v || defaultAddr.zip || defaultAddr.zipCode || "");
          }
        }
      } catch {
        // silently ignore — form can be filled manually
      }
    };
    prefill();
  }, []);

  const steps = [
    { number: 1, title: "Shipping", icon: MapPin },
    { number: 2, title: "Payment", icon: CreditCard },
    { number: 3, title: "Review", icon: Package },
  ];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const order = await post("/api/v1/orders", {
        shippingAddress: {
          firstName,
          lastName,
          email,
          phone,
          street: address,
          city,
          state,
          zip,
        },
        paymentMethod: paymentMethod as "card" | "paypal" | "crypto",
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        })),
      });
      toast.success("Order placed successfully!");
      if (onOrderPlaced) {
        onOrderPlaced();
      }
      onNavigate("orders", { orderId: order?.id ?? order?.order?.id });
    } catch (err: any) {
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-white mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    step > s.number
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500"
                      : step === s.number
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-white/20 bg-white/5"
                  }`}
                >
                  {step > s.number ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <s.icon className="h-5 w-5 text-white" />
                  )}
                </div>
                <span
                  className={`mt-2 text-sm ${
                    step >= s.number ? "text-white" : "text-white/50"
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${
                    step > s.number ? "bg-purple-500" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-white mb-6">Shipping Information</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      className="bg-white/5 border-white/10"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      className="bg-white/5 border-white/10"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-white/5 border-white/10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="bg-white/5 border-white/10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    className="bg-white/5 border-white/10"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      className="bg-white/5 border-white/10"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      className="bg-white/5 border-white/10"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      className="bg-white/5 border-white/10"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => setStep(2)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  Continue to Payment
                </Button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-white mb-6">Payment Method</h2>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <div
                      className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer ${
                        paymentMethod === "card"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-white">Credit/Debit Card</span>
                          <div className="flex gap-2">
                            <span className="text-2xl">💳</span>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div
                      className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer ${
                        paymentMethod === "paypal"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-white">PayPal</span>
                          <span className="text-2xl">🅿️</span>
                        </div>
                      </Label>
                    </div>

                    <div
                      className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer ${
                        paymentMethod === "crypto"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <RadioGroupItem value="crypto" id="crypto" />
                      <Label htmlFor="crypto" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-white">Cryptocurrency</span>
                          <span className="text-2xl">₿</span>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="bg-white/5 border-white/10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    Review Order
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-white mb-6">Review Order</h2>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white mb-2">Shipping Address</h3>
                    <p className="text-white/70 text-sm">
                      {firstName} {lastName}<br />
                      {address}<br />
                      {city}{city && state ? ", " : ""}{state} {zip}<br />
                      {phone}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white mb-2">Payment Method</h3>
                    <p className="text-white/70 text-sm">
                      {paymentMethod === "card" && "Credit/Debit Card"}
                      {paymentMethod === "paypal" && "PayPal"}
                      {paymentMethod === "crypto" && "Cryptocurrency (Bitcoin)"}
                    </p>
                  </div>

                  {/* Items review */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white mb-3">Items ({cartItems.length})</h3>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={item.product?.image}
                              alt={item.product?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">{item.product?.name}</p>
                            <p className="text-white/50 text-xs">
                              Qty: {item.quantity}
                              {item.selectedColor && ` · ${item.selectedColor}`}
                              {item.selectedSize && ` · ${item.selectedSize}`}
                            </p>
                          </div>
                          <p className="text-white text-sm font-medium flex-shrink-0">
                            ${(item.product?.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {isPlacingOrder ? "Placing Order..." : "Place Order"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl text-white">Order Summary</h2>

            <Separator className="bg-white/10" />

            {/* Cart items list */}
            {cartItems.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-lg bg-white/5 overflow-hidden">
                        <ImageWithFallback
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm line-clamp-2">{item.product?.name}</p>
                      {(item.selectedColor || item.selectedSize) && (
                        <p className="text-white/40 text-xs">
                          {[item.selectedColor, item.selectedSize].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <p className="text-white text-sm font-medium flex-shrink-0">
                      ${(item.product?.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {cartItems.length === 0 && (
              <p className="text-white/40 text-sm text-center py-4">No items in cart</p>
            )}

            <Separator className="bg-white/10" />

            <div className="space-y-3">
              <div className="flex justify-between text-white/70">
                <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">FREE</Badge>
                ) : (
                  <span>${shipping.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between text-white/70">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div className="flex justify-between items-center">
              <span className="text-xl text-white">Total</span>
              <span className="text-3xl text-white">
                ${total.toFixed(2)}
              </span>
            </div>

            {shipping === 0 && subtotal > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-sm text-green-400">
                  Free shipping on orders over $50!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
