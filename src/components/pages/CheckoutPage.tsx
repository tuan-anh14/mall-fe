import { useState } from "react";
import { CreditCard, MapPin, Package, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { CartItem } from "../../App";

interface CheckoutPageProps {
  onNavigate: (page: string, data?: any) => void;
  cartItems?: CartItem[];
}

export function CheckoutPage({ onNavigate, cartItems = [] }: CheckoutPageProps) {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");

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

  const orderSummary = {
    items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    shipping,
    tax,
    total,
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
                    <Input id="firstName" className="bg-white/5 border-white/10" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" className="bg-white/5 border-white/10" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" className="bg-white/5 border-white/10" />
                </div>

                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" className="bg-white/5 border-white/10" />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" className="bg-white/5 border-white/10" />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" className="bg-white/5 border-white/10" />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" className="bg-white/5 border-white/10" />
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
                      John Doe<br />
                      123 Main Street<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white mb-2">Payment Method</h3>
                    <p className="text-white/70 text-sm">
                      {paymentMethod === "card" && "Credit/Debit Card ending in 3456"}
                      {paymentMethod === "paypal" && "PayPal"}
                      {paymentMethod === "crypto" && "Cryptocurrency (Bitcoin)"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => onNavigate("orders")}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    Place Order
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

            <div className="space-y-3">
              <div className="flex justify-between text-white/70">
                <span>Subtotal ({orderSummary.items} items)</span>
                <span>${orderSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Shipping</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  FREE
                </Badge>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Tax</span>
                <span>${orderSummary.tax.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div className="flex justify-between items-center">
              <span className="text-xl text-white">Total</span>
              <span className="text-3xl text-white">
                ${orderSummary.total.toFixed(2)}
              </span>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <p className="text-sm text-purple-400">
                🎉 You're saving $50.00 on this order!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
