import React, { useState, useEffect } from "react";
import {
  Settings,
  User,
  Bell,
  Lock,
  CreditCard,
  Globe,
  Moon,
  Shield,
  Smartphone,
  Mail,
  Eye,
  MapPin,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { motion } from "motion/react";
import { toast } from "sonner";
import { get, put, post, del } from "../../lib/api";

interface SettingsPageProps {
  onNavigate: (page: string, data?: any) => void;
  onLogout?: () => void;
}

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  twoFactorAuth: boolean;
  loginAlerts: boolean;
}

interface AddressFormState {
  firstName: string;
  lastName: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const defaultAddressForm: AddressFormState = {
  firstName: "",
  lastName: "",
  label: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "Việt Nam",
};

export function SettingsPage({ onNavigate, onLogout }: SettingsPageProps) {
  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormState>(defaultAddressForm);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Notification settings state
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    emailNotifications: false,
    orderUpdates: false,
    promotions: false,
    newsletter: false,
    twoFactorAuth: false,
    loginAlerts: false,
  });
  const [isSavingNotif, setIsSavingNotif] = useState(false);

  // Payment dialog state (UI only — no real payment API)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
    loadAddresses();
    loadNotifSettings();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await get<{
        user: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          phone?: string;
          avatar?: string;
        };
      }>("/api/v1/users/me");
      setFirstName(res.user.firstName ?? "");
      setLastName(res.user.lastName ?? "");
      setEmail(res.user.email ?? "");
      setPhone(res.user.phone ?? "");
    } catch (err: any) {
      toast.error(err.message || "Không thể tải hồ sơ");
    }
  };

  const loadAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const res = await get<{ addresses: Address[] }>("/api/v1/users/me/addresses");
      setAddresses(res.addresses ?? []);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải địa chỉ");
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const loadNotifSettings = async () => {
    try {
      const res = await get<{ settings: any }>("/api/v1/users/me/settings");
      const s = res.settings ?? {};
      setNotifSettings({
        emailNotifications: s.emailNotifications ?? false,
        orderUpdates: s.orderUpdates ?? false,
        promotions: s.promotionalEmails ?? false,
        newsletter: s.priceDropAlerts ?? false,
        twoFactorAuth: s.twoFactorEnabled ?? false,
        loginAlerts: false,
      });
    } catch (err: any) {
      toast.error(err.message || "Không thể tải cài đặt thông báo");
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await put("/api/v1/users/me", { firstName, lastName, phone });
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err: any) {
      toast.error(err.message || "Không thể lưu hồ sơ");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm(defaultAddressForm);
    setAddressDialogOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      firstName: address.firstName ?? "",
      lastName: address.lastName ?? "",
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
    });
    setAddressDialogOpen(true);
  };

  const handleSaveAddress = async () => {
    if (!addressForm.firstName || !addressForm.lastName) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zip) {
      toast.error("Vui lòng điền đầy đủ các trường địa chỉ bắt buộc");
      return;
    }
    setIsSavingAddress(true);
    try {
      if (editingAddress) {
        const result = await put<{ address: Address }>(
          `/api/v1/users/me/addresses/${editingAddress.id}`,
          addressForm
        );
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingAddress.id ? result.address : a))
        );
        toast.success("Đã cập nhật địa chỉ!");
      } else {
        const result = await post<{ address: Address }>("/api/v1/users/me/addresses", addressForm);
        setAddresses((prev) => [...prev, result.address]);
        toast.success("Đã thêm địa chỉ!");
      }
      setAddressDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Không thể lưu địa chỉ");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await del(`/api/v1/users/me/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Đã xóa địa chỉ thành công!");
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa địa chỉ");
    }
  };

  const handleSaveNotifSettings = async () => {
    setIsSavingNotif(true);
    try {
      await put("/api/v1/users/me/settings", {
        emailNotifications: notifSettings.emailNotifications,
        orderUpdates: notifSettings.orderUpdates,
        promotionalEmails: notifSettings.promotions,
        priceDropAlerts: notifSettings.newsletter,
        twoFactorEnabled: notifSettings.twoFactorAuth,
      });
      toast.success("Đã lưu tùy chọn thông báo!");
    } catch (err: any) {
      toast.error(err.message || "Không thể lưu cài đặt thông báo");
    } finally {
      setIsSavingNotif(false);
    }
  };

  const handleAddPayment = () => {
    setEditingPayment(null);
    setPaymentDialogOpen(true);
  };

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setPaymentDialogOpen(true);
  };

  const handleSavePayment = () => {
    toast.success(editingPayment ? "Đã cập nhật phương thức thanh toán!" : "Đã thêm phương thức thanh toán!");
    setPaymentDialogOpen(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ các trường mật khẩu");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    setIsChangingPassword(true);
    try {
      await put("/api/v1/users/me/password", { currentPassword, newPassword });
      toast.success("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Không thể đổi mật khẩu");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await del("/api/v1/users/me");
      toast.success("Đã xóa tài khoản thành công");
      setDeleteDialogOpen(false);
      // Call logout to clear session cookie + update app state
      if (onLogout) {
        onLogout();
      } else {
        onNavigate("home");
      }
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa tài khoản");
    } finally {
      setIsDeleting(false);
    }
  };

  const updateAddressForm = (field: keyof AddressFormState, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleNotif = (field: keyof NotificationSettings) => {
    setNotifSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-white">Cài đặt</h1>
              <p className="text-sm text-white/60">Quản lý tùy chọn tài khoản</p>
            </div>
          </div>
        </motion.div>

        {/* Settings Tabs */}
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8 bg-white/5">
            <TabsTrigger value="account">Tài khoản</TabsTrigger>
            <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
            <TabsTrigger value="preferences">Tùy chọn</TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Personal Information */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Thông tin cá nhân
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Cập nhật thông tin cá nhân và liên hệ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white/80">Họ</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white/80">Tên</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80">Địa chỉ email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      readOnly
                      className="bg-white/5 border-white/10 text-white opacity-70 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white/80">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Phương thức thanh toán
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Quản lý phương thức thanh toán đã lưu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white">Visa kết thúc bằng 4242</p>
                          <p className="text-sm text-white/60">Hết hạn 12/25</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPayment({ type: "Visa", last4: "4242", expiry: "12/25" })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-white/10 text-white hover:bg-white/5"
                      onClick={handleAddPayment}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm phương thức thanh toán
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Addresses */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Địa chỉ giao hàng
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Quản lý địa chỉ giao hàng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingAddresses ? (
                      <div className="text-center py-4 text-white/40 text-sm">
                        Đang tải địa chỉ...
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-4 text-white/40 text-sm">
                        Chưa có địa chỉ nào được lưu
                      </div>
                    ) : (
                      addresses.map((address) => (
                        <div
                          key={address.id}
                          className="flex items-start justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-white">{address.label}</p>
                                {address.isDefault && (
                                  <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-white/80">{address.street}</p>
                              <p className="text-sm text-white/60">
                                {address.city}, {address.state} {address.zip}
                              </p>
                              <p className="text-sm text-white/60">{address.country}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAddress(address)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!address.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDeleteAddress(address.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    <Button
                      variant="outline"
                      className="w-full border-white/10 text-white hover:bg-white/5"
                      onClick={handleAddAddress}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm địa chỉ mới
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Tùy chọn thông báo
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Chọn loại thông báo bạn muốn nhận
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Thông báo email</Label>
                      <p className="text-sm text-white/60">Nhận thông báo qua email</p>
                    </div>
                    <Switch
                      checked={notifSettings.emailNotifications}
                      onCheckedChange={() => toggleNotif("emailNotifications")}
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Cập nhật đơn hàng</Label>
                      <p className="text-sm text-white/60">Nhận cập nhật về đơn hàng</p>
                    </div>
                    <Switch
                      checked={notifSettings.orderUpdates}
                      onCheckedChange={() => toggleNotif("orderUpdates")}
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Email khuyến mãi</Label>
                      <p className="text-sm text-white/60">Nhận ưu đãi đặc biệt và khuyến mãi</p>
                    </div>
                    <Switch
                      checked={notifSettings.promotions}
                      onCheckedChange={() => toggleNotif("promotions")}
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Thông báo giảm giá</Label>
                      <p className="text-sm text-white/60">Nhận thông báo khi sản phẩm yêu thích giảm giá</p>
                    </div>
                    <Switch
                      checked={notifSettings.newsletter}
                      onCheckedChange={() => toggleNotif("newsletter")}
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Cảnh báo đăng nhập</Label>
                      <p className="text-sm text-white/60">Nhận thông báo về hoạt động đăng nhập mới</p>
                    </div>
                    <Switch
                      checked={notifSettings.loginAlerts}
                      onCheckedChange={() => toggleNotif("loginAlerts")}
                    />
                  </div>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={handleSaveNotifSettings}
                    disabled={isSavingNotif}
                  >
                    {isSavingNotif ? "Đang lưu..." : "Lưu tùy chọn"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Đổi mật khẩu
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Cập nhật mật khẩu để giữ tài khoản an toàn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-white/80">Mật khẩu hiện tại</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-white/80">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white/80">Xác nhận mật khẩu mới</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Xác thực hai yếu tố
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Thêm lớp bảo mật bổ sung cho tài khoản
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-white/60" />
                      <div>
                        <p className="text-white">Ứng dụng xác thực</p>
                        <p className="text-sm text-white/60">
                          {notifSettings.twoFactorAuth ? "Đã bật" : "Chưa bật"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5"
                      onClick={() => toggleNotif("twoFactorAuth")}
                    >
                      {notifSettings.twoFactorAuth ? "Tắt" : "Bật"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-white/60" />
                      <div>
                        <p className="text-white">Xác minh email</p>
                        <p className="text-sm text-white/60">Đã bật</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                      Tắt
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Phiên đăng nhập
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Quản lý phiên đăng nhập đang hoạt động
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <p className="text-white">Chrome trên Windows</p>
                      <p className="text-sm text-white/60">Hoạt động gần nhất: 2 phút trước</p>
                    </div>
                    <Button variant="ghost" size="sm">Thu hồi</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <p className="text-white">Safari trên iPhone</p>
                      <p className="text-sm text-white/60">Hoạt động gần nhất: 2 ngày trước</p>
                    </div>
                    <Button variant="ghost" size="sm">Thu hồi</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Preferences Settings */}
          <TabsContent value="preferences">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Tùy chọn chung
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Tùy chỉnh trải nghiệm mua sắm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white/80">Ngôn ngữ</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10">
                        <SelectItem value="en">Tiếng Anh</SelectItem>
                        <SelectItem value="es">Tiếng Tây Ban Nha</SelectItem>
                        <SelectItem value="fr">Tiếng Pháp</SelectItem>
                        <SelectItem value="de">Tiếng Đức</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="space-y-2">
                    <Label className="text-white/80">Tiền tệ</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10">
                        <SelectItem value="usd">USD - US Dollar</SelectItem>
                        <SelectItem value="eur">EUR - Euro</SelectItem>
                        <SelectItem value="gbp">GBP - British Pound</SelectItem>
                        <SelectItem value="jpy">JPY - Japanese Yen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Chế độ tối
                      </Label>
                      <p className="text-sm text-white/60">Sử dụng giao diện tối trên toàn trang</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Hiển thị gợi ý sản phẩm</Label>
                      <p className="text-sm text-white/60">Nhận gợi ý sản phẩm cá nhân hóa</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => toast.success("Đã lưu tùy chọn!")}
                  >
                    Lưu tùy chọn
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Card className="bg-red-500/10 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400">Vùng nguy hiểm</CardTitle>
              <CardDescription className="text-white/60">
                Hành động không thể hoàn tác - hãy cẩn thận
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Xóa tài khoản</p>
                  <p className="text-sm text-white/60">
                    Xóa vĩnh viễn tài khoản và tất cả dữ liệu
                  </p>
                </div>
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>Xóa tài khoản</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-black border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản? Tất cả dữ liệu, đơn hàng và cài đặt sẽ bị xóa. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Đang xóa..." : "Xóa tài khoản"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="bg-black border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{editingPayment ? "Chỉnh sửa phương thức thanh toán" : "Thêm phương thức thanh toán"}</DialogTitle>
            <DialogDescription className="text-white/60">
              {editingPayment
                ? "Cập nhật thông tin phương thức thanh toán"
                : "Thêm phương thức thanh toán mới vào tài khoản"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-white/80">Số thẻ</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                defaultValue={editingPayment ? `**** **** **** ${editingPayment.last4}` : ""}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry" className="text-white/80">Ngày hết hạn</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  defaultValue={editingPayment?.expiry || ""}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-white/80">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  type="password"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName" className="text-white/80">Tên chủ thẻ</Label>
              <Input
                id="cardName"
                placeholder="Nguyễn Văn A"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSavePayment}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {editingPayment ? "Cập nhật" : "Thêm"} phương thức thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="bg-black border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Chỉnh sửa địa chỉ giao hàng" : "Thêm địa chỉ giao hàng"}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {editingAddress
                ? "Cập nhật thông tin địa chỉ giao hàng"
                : "Thêm địa chỉ giao hàng mới vào tài khoản"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addrFirstName" className="text-white/80">Họ <span className="text-red-400">*</span></Label>
                <Input
                  id="addrFirstName"
                  placeholder="Nguyễn"
                  value={addressForm.firstName}
                  onChange={(e) => updateAddressForm("firstName", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addrLastName" className="text-white/80">Tên <span className="text-red-400">*</span></Label>
                <Input
                  id="addrLastName"
                  placeholder="Văn A"
                  value={addressForm.lastName}
                  onChange={(e) => updateAddressForm("lastName", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLabel" className="text-white/80">Nhãn địa chỉ</Label>
              <Input
                id="addressLabel"
                placeholder="Nhà, Văn phòng, v.v."
                value={addressForm.label}
                onChange={(e) => updateAddressForm("label", e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street" className="text-white/80">Địa chỉ</Label>
              <Input
                id="street"
                placeholder="123 Nguyễn Huệ"
                value={addressForm.street}
                onChange={(e) => updateAddressForm("street", e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-white/80">Thành phố</Label>
                <Input
                  id="city"
                  placeholder="Hồ Chí Minh"
                  value={addressForm.city}
                  onChange={(e) => updateAddressForm("city", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-white/80">Tỉnh/Thành</Label>
                <Input
                  id="state"
                  placeholder="HCM"
                  value={addressForm.state}
                  onChange={(e) => updateAddressForm("state", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zip" className="text-white/80">Mã bưu chính</Label>
                <Input
                  id="zip"
                  placeholder="10001"
                  value={addressForm.zip}
                  onChange={(e) => updateAddressForm("zip", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-white/80">Quốc gia</Label>
                <Input
                  id="country"
                  placeholder="Việt Nam"
                  value={addressForm.country}
                  onChange={(e) => updateAddressForm("country", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddressDialogOpen(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveAddress}
              disabled={isSavingAddress}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {isSavingAddress ? "Đang lưu..." : editingAddress ? "Cập nhật" : "Thêm"} địa chỉ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
