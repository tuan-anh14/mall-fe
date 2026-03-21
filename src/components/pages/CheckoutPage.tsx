import { useState, useEffect } from "react";
import { CreditCard, MapPin, Package, Check, Wallet, AlertCircle, Shield, Truck, ChevronRight } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 lg:py-10">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Thanh toán</h1>
        <p className="text-gray-500 text-sm mt-1">Hoàn tất đơn hàng của bạn</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-10">
        <div className="flex items-center max-w-xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    step > s.number
                      ? "bg-blue-600 shadow-md shadow-blue-600/20"
                      : step === s.number
                      ? "bg-blue-600 shadow-md shadow-blue-600/20"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {step > s.number ? (
                    <Check className="h-4.5 w-4.5 text-white" />
                  ) : (
                    <s.icon className={`h-4.5 w-4.5 ${step === s.number ? "text-white" : "text-gray-400"}`} />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    step >= s.number ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px relative mx-1 -mt-5">
                  <div className="absolute inset-0 bg-gray-200 rounded-full" />
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: step > s.number ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="p-6 lg:p-8 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MapPin className="h-[18px] w-[18px] text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Thông tin vận chuyển</h2>
                    <p className="text-gray-400 text-xs">Nhập địa chỉ nhận hàng của bạn</p>
                  </div>
                </div>

                {/* Saved Address Selector */}
                {savedAddresses.length > 1 && (
                  <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4">
                    <p className="text-gray-700 text-sm font-medium mb-3">Địa chỉ đã lưu</p>
                    <div className="space-y-2">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => applyAddress(addr)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            selectedAddressId === addr.id
                              ? "border-blue-500 bg-blue-50/80 shadow-sm shadow-blue-500/10"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-gray-900 text-sm font-medium">
                                {addr.street}, {addr.city}
                                {addr.state ? `, ${addr.state}` : ""} {addr.zip || addr.zipCode}
                              </p>
                              {addr.label && (
                                <p className="text-gray-400 text-xs mt-0.5">{addr.label}</p>
                              )}
                            </div>
                            {addr.isDefault && (
                              <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-200 text-xs flex-shrink-0">
                                Mặc định
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-400 text-xs mt-3">
                      Hoặc điền địa chỉ mới bên dưới
                    </p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-sm font-medium">Họ <span className="text-red-500">*</span></Label>
                    <Input
                      id="firstName"
                      className="bg-gray-50/50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-sm font-medium">Tên <span className="text-red-500">*</span></Label>
                    <Input
                      id="lastName"
                      className="bg-gray-50/50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      className="bg-gray-50/50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      className="bg-gray-50/50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-sm font-medium">Địa chỉ <span className="text-red-500">*</span></Label>
                  <Input
                    id="address"
                    className="bg-gray-50/50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-sm font-medium">Thành phố <span className="text-red-500">*</span></Label>
                    <Input
                      id="city"
                      className="bg-gray-50/50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-sm font-medium">Tỉnh/Thành <span className="text-red-500">*</span></Label>
                    <Input
                      id="state"
                      className="bg-gray-50/50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="zip" className="text-sm font-medium">Mã bưu chính <span className="text-red-500">*</span></Label>
                    <Input
                      id="zip"
                      className="bg-gray-50/50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => { if (validateShipping()) setStep(2); }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-base font-semibold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all mt-2"
                >
                  Tiếp tục thanh toán
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="p-6 lg:p-8 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <CreditCard className="h-[18px] w-[18px] text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Phương thức thanh toán</h2>
                    <p className="text-gray-400 text-xs">Chọn phương thức thanh toán phù hợp</p>
                  </div>
                </div>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-2.5">
                    {/* Shop Wallet */}
                    <div
                      className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        paymentMethod === "wallet"
                          ? "border-blue-500 bg-blue-50/80 shadow-sm shadow-blue-500/10"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Wallet className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-gray-900 font-medium text-sm">Shop Wallet</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-600 text-sm">
                              Số dư: <span className="text-blue-600 font-semibold tabular-nums">
                                {formatCurrency(walletInfo?.balance ?? 0)}
                              </span>
                            </span>
                            {walletInfo && walletInfo.balance < total && (
                              <div className="flex items-center gap-1 text-amber-600 text-xs mt-0.5">
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
                            className="text-xs text-blue-600 hover:text-blue-700 mt-1.5 font-medium"
                          >
                            Nạp thêm tiền vào ví →
                          </button>
                        )}
                      </Label>
                    </div>

                    {/* VNPAY */}
                    <div
                      className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        paymentMethod === "vnpay"
                          ? "border-blue-500 bg-blue-50/80 shadow-sm shadow-blue-500/10"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value="vnpay" id="vnpay" />
                      <Label htmlFor="vnpay" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center text-base">🏦</div>
                            <div>
                              <span className="text-gray-900 font-medium text-sm">VNPAY</span>
                              <p className="text-gray-400 text-xs">Internet Banking / ATM / QR Code</p>
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* MoMo */}
                    <div
                      className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        paymentMethod === "momo"
                          ? "border-blue-500 bg-blue-50/80 shadow-sm shadow-blue-500/10"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value="momo" id="momo" />
                      <Label htmlFor="momo" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-pink-50 flex items-center justify-center text-base">📱</div>
                            <div>
                              <span className="text-gray-900 font-medium text-sm">MoMo</span>
                              <p className="text-gray-400 text-xs">Ví điện tử MoMo</p>
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Card */}
                    <div
                      className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        paymentMethod === "card"
                          ? "border-blue-500 bg-blue-50/80 shadow-sm shadow-blue-500/10"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center text-base">💳</div>
                          <span className="text-gray-900 font-medium text-sm">Thẻ tín dụng/ghi nợ</span>
                        </div>
                      </Label>
                    </div>

                    {/* COD */}
                    <div
                      className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        paymentMethod === "cod"
                          ? "border-blue-500 bg-blue-50/80 shadow-sm shadow-blue-500/10"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-base">💵</div>
                          <span className="text-gray-900 font-medium text-sm">Thanh toán khi nhận hàng (COD)</span>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <div className="space-y-1.5 pt-4">
                      <Label htmlFor="cardNumber" className="text-sm font-medium">Số thẻ</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="bg-gray-50/50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="expiry" className="text-sm font-medium">Ngày hết hạn</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          className="bg-gray-50/50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          className="bg-gray-50/50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cardName" className="text-sm font-medium">Tên chủ thẻ</Label>
                      <Input
                        id="cardName"
                        placeholder="Nguyễn Văn A"
                        className="bg-gray-50/50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl h-11 font-medium">
                    Quay lại
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => setStep(3)}
                    disabled={paymentMethod === "wallet" && walletInfo !== null && walletInfo.balance < total}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold shadow-lg shadow-blue-600/20 disabled:opacity-40 disabled:shadow-none transition-all"
                  >
                    Xem lại đơn hàng
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                {paymentMethod === "wallet" && walletInfo !== null && walletInfo.balance < total && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <p className="text-amber-700 text-sm">
                      Số dư ví ({formatCurrency(walletInfo.balance)}) không đủ để thanh toán ({formatCurrency(total)}).
                      {" "}
                      <button
                        type="button"
                        onClick={() => onNavigate("wallet")}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Nạp thêm tiền →
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="p-6 lg:p-8 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Package className="h-[18px] w-[18px] text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Xem lại đơn hàng</h2>
                    <p className="text-gray-400 text-xs">Kiểm tra thông tin trước khi đặt hàng</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <h3 className="text-gray-900 text-sm font-semibold">Địa chỉ giao hàng</h3>
                      <button onClick={() => setStep(1)} className="text-blue-600 text-xs font-medium ml-auto hover:text-blue-700">Sửa</button>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {firstName} {lastName}<br />
                      {address}<br />
                      {city}{city && state ? ", " : ""}{state} {zip}<br />
                      {phone}
                    </p>
                  </div>

                  <div className="bg-gray-50/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <h3 className="text-gray-900 text-sm font-semibold">Phương thức thanh toán</h3>
                      <button onClick={() => setStep(2)} className="text-blue-600 text-xs font-medium ml-auto hover:text-blue-700">Sửa</button>
                    </div>
                    <p className="text-gray-600 text-sm">
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
                  <div className="bg-gray-50/80 rounded-xl p-4">
                    <h3 className="text-gray-900 text-sm font-semibold mb-3">Sản phẩm ({cartItems.length})</h3>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={item.product?.image}
                              alt={item.product?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 text-sm font-medium truncate">{item.product?.name}</p>
                            <p className="text-gray-400 text-xs">
                              SL: {item.quantity}
                              {item.selectedColor && ` · ${item.selectedColor}`}
                              {item.selectedSize && ` · ${item.selectedSize}`}
                            </p>
                          </div>
                          <p className="text-gray-900 text-sm font-semibold flex-shrink-0 tabular-nums">
                            {formatCurrency(item.product?.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl h-11 font-medium">
                    Quay lại
                  </Button>
                  <Button
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-base font-semibold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all disabled:opacity-50 disabled:shadow-none"
                  >
                    {isPlacingOrder ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang đặt hàng...
                      </span>
                    ) : "Đặt hàng"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-5 space-y-4">
              <h2 className="text-base font-bold text-gray-900">Tóm tắt đơn hàng</h2>

              <Separator className="bg-gray-100" />

              {/* Cart items list */}
              {cartItems.length > 0 && (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1 -mr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
                          <ImageWithFallback
                            src={item.product?.image}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-medium line-clamp-1">{item.product?.name}</p>
                        {(item.selectedColor || item.selectedSize) && (
                          <p className="text-gray-400 text-xs">
                            {[item.selectedColor, item.selectedSize].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      <p className="text-gray-900 text-sm font-semibold flex-shrink-0 tabular-nums">
                        {formatCurrency(item.product?.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {cartItems.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">Không có sản phẩm trong giỏ</p>
              )}

              <Separator className="bg-gray-100" />

              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tạm tính ({cartItems.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
                  <span className="text-gray-700 font-medium tabular-nums">{formatCurrency(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 flex flex-col">
                      <span>Giảm giá ({couponCode})</span>
                      {couponSellerName && <span className="text-xs text-emerald-500">Shop: {couponSellerName}</span>}
                    </span>
                    <span className="text-emerald-600 font-semibold tabular-nums">-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vận chuyển</span>
                  {shipping === 0 ? (
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs font-semibold">MIỄN PHÍ</Badge>
                  ) : (
                    <span className="text-gray-700 font-medium tabular-nums">{formatCurrency(shipping)}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Thuế (10%)</span>
                  <span className="text-gray-700 font-medium tabular-nums">{formatCurrency(tax)}</span>
                </div>
              </div>

              <Separator className="bg-gray-100" />

              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-gray-900">Tổng cộng</span>
                <span className="text-2xl font-bold text-blue-700 tabular-nums">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-4">
                {[
                  { icon: Shield, label: "Bảo mật", color: "text-emerald-600 bg-emerald-50" },
                  { icon: Truck, label: "Giao nhanh", color: "text-blue-600 bg-blue-50" },
                  { icon: Package, label: "Đổi trả", color: "text-orange-600 bg-orange-50" },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-gray-500 text-xs font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {shipping === 0 && subtotal > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">
                  Miễn phí vận chuyển cho đơn hàng trên 500K!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
