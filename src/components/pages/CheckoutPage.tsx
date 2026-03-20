import { useState, useEffect } from "react";
import { CreditCard, MapPin, Package, Check, Wallet, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { CartItem } from "../../types";
import { toast } from "sonner";
import { get, post } from "../../lib/api";
import { walletService, WalletInfo } from "../../services/wallet.service";
import { formatCurrency } from "../../lib/currency";

interface CheckoutPageProps {
  onNavigate: (page: string, data?: any) => void;
  cartItems?: CartItem[];
  onOrderPlaced?: () => void;
  user?: any;
}

export function CheckoutPage({ onNavigate, cartItems = [], onOrderPlaced, user }: CheckoutPageProps) {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponSellerName, setCouponSellerName] = useState<string | null>(null);

  // Shipping form state — pre-seeded from user prop synchronously
  const getInitialName = (part: "first" | "last") => {
    if (!user?.name) return "";
    const parts = user.name.trim().split(" ");
    if (part === "first") return parts[0] || "";
    return parts.slice(1).join(" ") || "";
  };

  const [firstName, setFirstName] = useState(() => getInitialName("first"));
  const [lastName, setLastName] = useState(() => getInitialName("last"));
  const [email, setEmail] = useState(() => user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  // Fetch wallet balance
  useEffect(() => {
    walletService.getWallet().then(setWalletInfo).catch(() => {});
  }, []);

  // Enhance pre-fill from full profile API + saved addresses
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
          setSavedAddresses(addrs);
          if (addrs.length === 1) {
            // Single address: auto-fill
            const addr = addrs[0];
            setAddress((v) => v || addr.street || "");
            setCity((v) => v || addr.city || "");
            setState((v) => v || addr.state || "");
            setZip((v) => v || addr.zip || addr.zipCode || "");
          } else if (addrs.length > 1) {
            // Multiple addresses: pre-select default
            const defaultAddr = addrs.find((a: any) => a.isDefault) ?? addrs[0];
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          }
        }
      } catch {
        // silently ignore — form can be filled manually
      }
    };
    prefill();
  }, []);

  // Load coupon applied in CartPage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("applied_coupon");
      if (saved) {
        const { code, discount, sellerName } = JSON.parse(saved);
        setCouponCode(code ?? "");
        setCouponDiscount(discount ?? 0);
        setCouponSellerName(sellerName ?? null);
      }
    } catch {}
  }, []);

  const validateShipping = (): boolean => {
    if (!firstName.trim()) { toast.error("Vui lòng nhập họ"); return false; }
    if (!lastName.trim()) { toast.error("Vui lòng nhập tên"); return false; }
    if (!email.trim()) { toast.error("Vui lòng nhập email"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { toast.error("Vui lòng nhập địa chỉ email hợp lệ"); return false; }
    if (!address.trim()) { toast.error("Vui lòng nhập địa chỉ"); return false; }
    if (!city.trim()) { toast.error("Vui lòng nhập thành phố"); return false; }
    if (!state.trim()) { toast.error("Vui lòng nhập tỉnh/thành"); return false; }
    if (!zip.trim()) { toast.error("Vui lòng nhập mã bưu chính"); return false; }
    return true;
  };

  const applyAddress = (addr: any) => {
    setAddress(addr.street || "");
    setCity(addr.city || "");
    setState(addr.state || "");
    setZip(addr.zip || addr.zipCode || "");
    setSelectedAddressId(addr.id);
  };

  const steps = [
    { number: 1, title: "Vận chuyển", icon: MapPin },
    { number: 2, title: "Thanh toán", icon: CreditCard },
    { number: 3, title: "Xác nhận", icon: Package },
  ];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = Math.max(0, subtotal - couponDiscount) + shipping + tax;

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
        ...(couponCode ? { couponCode } : {}),
      });
      try { sessionStorage.removeItem("applied_coupon"); } catch {}
      toast.success("Đặt hàng thành công!");
      if (onOrderPlaced) {
        onOrderPlaced();
      }
      onNavigate("orders", { orderId: order?.id ?? order?.order?.id });
    } catch (err: any) {
      toast.error(err.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-foreground mb-8">Thanh toán</h1>

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
                      : "border-border bg-foreground/5"
                  }`}
                >
                  {step > s.number ? (
                    <Check className="h-6 w-6 text-foreground" />
                  ) : (
                    <s.icon className="h-5 w-5 text-foreground" />
                  )}
                </div>
                <span
                  className={`mt-2 text-sm ${
                    step >= s.number ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${
                    step > s.number ? "bg-purple-500" : "bg-foreground/10"
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
          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-foreground mb-6">Thông tin vận chuyển</h2>

                {/* Saved Address Selector (only when user has multiple saved addresses) */}
                {savedAddresses.length > 1 && (
                  <div className="bg-foreground/5 border border-border rounded-xl p-4">
                    <p className="text-foreground text-sm mb-3">Chọn địa chỉ đã lưu:</p>
                    <div className="space-y-2">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => applyAddress(addr)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? "border-purple-500 bg-purple-500/10"
                              : "border-border bg-foreground/5 hover:border-border"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-foreground text-sm">
                                {addr.street}, {addr.city}
                                {addr.state ? `, ${addr.state}` : ""} {addr.zip || addr.zipCode}
                              </p>
                              {addr.label && (
                                <p className="text-muted-foreground text-xs mt-0.5">{addr.label}</p>
                              )}
                            </div>
                            {addr.isDefault && (
                              <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                                Mặc định
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted-foreground text-xs mt-3">
                      Hoặc điền địa chỉ khác bên dưới:
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Họ <span className="text-red-400">*</span></Label>
                    <Input
                      id="firstName"
                      className="bg-foreground/5 border-border"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Tên <span className="text-red-400">*</span></Label>
                    <Input
                      id="lastName"
                      className="bg-foreground/5 border-border"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email <span className="text-red-400">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-foreground/5 border-border"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="bg-foreground/5 border-border"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Địa chỉ <span className="text-red-400">*</span></Label>
                  <Input
                    id="address"
                    className="bg-foreground/5 border-border"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Thành phố <span className="text-red-400">*</span></Label>
                    <Input
                      id="city"
                      className="bg-foreground/5 border-border"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Tỉnh/Thành <span className="text-red-400">*</span></Label>
                    <Input
                      id="state"
                      className="bg-foreground/5 border-border"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">Mã bưu chính <span className="text-red-400">*</span></Label>
                    <Input
                      id="zip"
                      className="bg-foreground/5 border-border"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => { if (validateShipping()) setStep(2); }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  Tiếp tục thanh toán
                </Button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-foreground mb-6">Phương thức thanh toán</h2>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {/* Shop Wallet */}
                    <div
                      className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer ${
                        paymentMethod === "wallet"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-border bg-foreground/5"
                      }`}
                    >
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-purple-400" />
                            <span className="text-foreground">Shop Wallet</span>
                          </div>
                          <div className="text-right">
                            <span className="text-muted-foreground text-sm">
                              Số dư: <span className="text-purple-300 font-medium">
                                {formatCurrency(walletInfo?.balance ?? 0)}
                              </span>
                            </span>
                            {walletInfo && walletInfo.balance < total && (
                              <div className="flex items-center gap-1 text-yellow-400 text-xs mt-0.5">
                                <AlertCircle className="h-3 w-3" />
                                Số dư không đủ
                              </div>
                            )}
                          </div>
                        </div>
                        {walletInfo && walletInfo.balance < total && paymentMethod === "wallet" && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); onNavigate("wallet"); }}
                            className="text-xs text-purple-400 hover:text-purple-300 mt-1 underline"
                          >
                            → Nạp thêm tiền vào ví
                          </button>
                        )}
                      </Label>
                    </div>

                    {/* VNPAY */}
                    <div
                      className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer ${
                        paymentMethod === "vnpay"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-border bg-foreground/5"
                      }`}
                    >
                      <RadioGroupItem value="vnpay" id="vnpay" />
                      <Label htmlFor="vnpay" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground">VNPAY</span>
                          <span className="text-2xl">🏦</span>
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5">Internet Banking / ATM / QR Code</p>
                      </Label>
                    </div>

                    {/* MoMo */}
                    <div
                      className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer ${
                        paymentMethod === "momo"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-border bg-foreground/5"
                      }`}
                    >
                      <RadioGroupItem value="momo" id="momo" />
                      <Label htmlFor="momo" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground">MoMo</span>
                          <span className="text-2xl">📱</span>
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5">Ví điện tử MoMo</p>
                      </Label>
                    </div>

                    {/* Card */}
                    <div
                      className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer ${
                        paymentMethod === "card"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-border bg-foreground/5"
                      }`}
                    >
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground">Thẻ tín dụng/ghi nợ</span>
                          <span className="text-2xl">💳</span>
                        </div>
                      </Label>
                    </div>

                    {/* COD */}
                    <div
                      className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer ${
                        paymentMethod === "cod"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-border bg-foreground/5"
                      }`}
                    >
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground">Thanh toán khi nhận hàng (COD)</span>
                          <span className="text-2xl">💵</span>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="cardNumber">Số thẻ</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="bg-foreground/5 border-border"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Ngày hết hạn</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          className="bg-foreground/5 border-border"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          className="bg-foreground/5 border-border"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cardName">Tên chủ thẻ</Label>
                      <Input
                        id="cardName"
                        placeholder="Nguyễn Văn A"
                        className="bg-foreground/5 border-border"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Quay lại
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => setStep(3)}
                    disabled={paymentMethod === "wallet" && walletInfo !== null && walletInfo.balance < total}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 disabled:opacity-40"
                  >
                    Xem lại đơn hàng
                  </Button>
                </div>
                {paymentMethod === "wallet" && walletInfo !== null && walletInfo.balance < total && (
                  <p className="text-center text-yellow-400/80 text-sm flex items-center justify-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Số dư ví ({formatCurrency(walletInfo.balance)}) không đủ để thanh toán ({formatCurrency(total)}).
                    {" "}
                    <button
                      type="button"
                      onClick={() => onNavigate("wallet")}
                      className="underline hover:text-yellow-300"
                    >
                      Nạp thêm tiền
                    </button>
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-foreground mb-6">Xem lại đơn hàng</h2>

                <div className="space-y-4">
                  <div className="bg-foreground/5 rounded-lg p-4">
                    <h3 className="text-foreground mb-2">Địa chỉ giao hàng</h3>
                    <p className="text-muted-foreground text-sm">
                      {firstName} {lastName}<br />
                      {address}<br />
                      {city}{city && state ? ", " : ""}{state} {zip}<br />
                      {phone}
                    </p>
                  </div>

                  <div className="bg-foreground/5 rounded-lg p-4">
                    <h3 className="text-foreground mb-2">Phương thức thanh toán</h3>
                    <p className="text-muted-foreground text-sm">
                      {paymentMethod === "wallet" && `Shop Wallet (Số dư: ${formatCurrency(walletInfo?.balance ?? 0)})`}
                      {paymentMethod === "vnpay" && "VNPAY"}
                      {paymentMethod === "momo" && "Ví MoMo"}
                      {paymentMethod === "card" && "Thẻ tín dụng/ghi nợ"}
                      {paymentMethod === "cod" && "Thanh toán khi nhận hàng"}
                      {paymentMethod === "paypal" && "PayPal"}
                      {paymentMethod === "crypto" && "Tiền điện tử (Bitcoin)"}
                    </p>
                  </div>

                  {/* Items review */}
                  <div className="bg-foreground/5 rounded-lg p-4">
                    <h3 className="text-foreground mb-3">Sản phẩm ({cartItems.length})</h3>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-foreground/5 overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={item.product?.image}
                              alt={item.product?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground text-sm truncate">{item.product?.name}</p>
                            <p className="text-muted-foreground text-xs">
                              SL: {item.quantity}
                              {item.selectedColor && ` · ${item.selectedColor}`}
                              {item.selectedSize && ` · ${item.selectedSize}`}
                            </p>
                          </div>
                          <p className="text-foreground text-sm font-medium flex-shrink-0">
                            {formatCurrency(item.product?.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Quay lại
                  </Button>
                  <Button
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {isPlacingOrder ? "Đang đặt hàng..." : "Đặt hàng"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-foreground/5 border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-xl text-foreground">Tóm tắt đơn hàng</h2>

            <Separator className="bg-foreground/10" />

            {/* Cart items list */}
            {cartItems.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-lg bg-foreground/5 overflow-hidden">
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
                      <p className="text-foreground text-sm line-clamp-2">{item.product?.name}</p>
                      {(item.selectedColor || item.selectedSize) && (
                        <p className="text-muted-foreground text-xs">
                          {[item.selectedColor, item.selectedSize].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <p className="text-foreground text-sm font-medium flex-shrink-0">
                      {formatCurrency(item.product?.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {cartItems.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">Không có sản phẩm trong giỏ</p>
            )}

            <Separator className="bg-foreground/10" />

            <div className="space-y-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính ({cartItems.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span className="flex flex-col">
                    <span>Giảm giá ({couponCode})</span>
                    {couponSellerName && <span className="text-xs text-green-400/60">Shop: {couponSellerName}</span>}
                  </span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Vận chuyển</span>
                {shipping === 0 ? (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">MIỄN PHÍ</Badge>
                ) : (
                  <span>{formatCurrency(shipping)}</span>
                )}
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Thuế (10%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            </div>

            <Separator className="bg-foreground/10" />

            <div className="flex justify-between items-center">
              <span className="text-xl text-foreground">Tổng cộng</span>
              <span className="text-3xl text-foreground">
                {formatCurrency(total)}
              </span>
            </div>

            {shipping === 0 && subtotal > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-sm text-green-400">
                  Miễn phí vận chuyển cho đơn hàng trên 50!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
