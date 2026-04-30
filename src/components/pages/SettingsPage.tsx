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
  Store,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
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
import { get, put, post, del, patch } from "../../lib/api";

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
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [userType, setUserType] = useState<string>("BUYER");
  const [isSuspended, setIsSuspended] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Store management state
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [closeStoreDialogOpen, setCloseStoreDialogOpen] = useState(false);
  const [isUpdatingStore, setIsUpdatingStore] = useState(false);

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
          userType: string;
          isSuspended: boolean;
          isClosed: boolean;
        };
      }>("/api/v1/users/me");
      setFirstName(res.user.firstName ?? "");
      setLastName(res.user.lastName ?? "");
      setEmail(res.user.email ?? "");
      setPhone(res.user.phone ?? "");
      setAvatarUrl(res.user.avatar ?? undefined);
      setUserType(res.user.userType ?? "BUYER");
      setIsSuspended(res.user.isSuspended ?? false);
      setIsClosed(res.user.isClosed ?? false);
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
      // Option: call checkAuth() to update global context if necessary
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await post<{ url: string }>("/api/v1/upload/avatar", formData);

      const newUrl = uploadRes.url;
      await put("/api/v1/users/me", { avatar: newUrl });

      setAvatarUrl(newUrl);
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (err: any) {
      toast.error(err.message || "Không thể tải lên ảnh đại diện");
    } finally {
      setIsUploadingAvatar(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleToggleSuspension = async () => {
    setIsUpdatingStore(true);
    try {
      const res = await patch<{ message: string; isSuspended: boolean }>("/api/v1/seller/profile/toggle-suspension");
      setIsSuspended(res.isSuspended);
      toast.success(res.message);
      setSuspendDialogOpen(false);
      // Optional: Refresh profile to ensure all states are synced
      loadProfile();
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật trạng thái cửa hàng");
    } finally {
      setIsUpdatingStore(false);
    }
  };

  const handleCloseStore = async () => {
    setIsUpdatingStore(true);
    try {
      const res = await del<{ message: string; isClosed: boolean }>("/api/v1/seller/profile/close");
      setIsClosed(res.isClosed);
      setUserType("BUYER");
      toast.success(res.message);
      setCloseStoreDialogOpen(false);
      // Re-trigger navigation to Home or Profile as they are no longer a seller
      onNavigate("profile");
    } catch (err: any) {
      toast.error(err.message || "Không thể đóng cửa hàng");
    } finally {
      setIsUpdatingStore(false);
    }
  };

  const inputClass =
    "bg-gray-50/50 border-gray-200 text-gray-900 rounded-xl h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";
  const cardClass = "bg-white border-gray-200/80 rounded-2xl shadow-sm overflow-hidden";

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 lg:py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Cài đặt</h1>
                <p className="text-sm text-gray-500 mt-0.5">Quản lý tài khoản, bảo mật</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings Tabs */}
        <div className={`${cardClass} mb-6`}>
          <Tabs defaultValue="account" variant="underline" className="w-full">
            <TabsList className="rounded-t-2xl px-1">
              <TabsTrigger value="account">
                <User className="h-4 w-4" />
                Tài khoản
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="h-4 w-4" />
                Bảo mật
              </TabsTrigger>
              {(userType === "SELLER" || userType === "ADMIN") && (
                <TabsTrigger value="store">
                  <Store className="h-4 w-4" />
                  Cửa hàng
                </TabsTrigger>
              )}
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account" className="p-5 lg:p-6 focus-visible:outline-none">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                {/* Personal Information */}
                <Card className={cardClass}>
                  <CardHeader className="border-b border-gray-100 bg-gray-50/40 pb-4">
                    <CardTitle className="text-gray-900 flex items-center gap-3 text-base font-bold">
                      <span className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
                        <User className="h-[18px] w-[18px] text-blue-600" />
                      </span>
                      Thông tin cá nhân
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-sm">
                      Cập nhật thông tin cá nhân và liên hệ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-5">
                    <div className="flex items-center gap-4 mb-2">
                      <Avatar className="h-16 w-16 border rounded-full bg-gray-50 flex items-center justify-center">
                        {isUploadingAvatar ? (
                          <div className="h-5 w-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                        ) : avatarUrl ? (
                          <AvatarImage src={avatarUrl} className="object-cover" />
                        ) : (
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xl">
                            {(firstName[0] || "U").toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <Button variant="outline" size="sm" onClick={() => document.getElementById("avatar-upload")?.click()} disabled={isUploadingAvatar} className="rounded-lg h-9 font-medium border-gray-200">
                          Đổi ảnh đại diện
                        </Button>
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/png, image/jpeg, image/webp"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                        <p className="text-[11px] text-gray-500 mt-1.5">JPG, PNG hoặc WEBP. Tối đa 5MB.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-gray-700 text-sm font-medium">Họ</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-gray-700 text-sm font-medium">Tên</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-gray-700 text-sm font-medium">Địa chỉ email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        readOnly
                        className={`${inputClass} opacity-70 cursor-not-allowed bg-gray-100/80`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-gray-700 text-sm font-medium">Số điện thoại</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold shadow-lg shadow-blue-600/20"
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Shipping Addresses */}
                <Card className={cardClass}>
                  <CardHeader className="border-b border-gray-100 bg-gray-50/40 pb-4">
                    <CardTitle className="text-gray-900 flex items-center gap-3 text-base font-bold">
                      <span className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center">
                        <MapPin className="h-[18px] w-[18px] text-orange-600" />
                      </span>
                      Địa chỉ giao hàng
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-sm">
                      Quản lý địa chỉ giao hàng
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="space-y-3">
                      {isLoadingAddresses ? (
                        <div className="flex flex-col items-center justify-center py-10">
                          <div className="h-8 w-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                          <p className="text-gray-400 text-sm mt-3">Đang tải địa chỉ...</p>
                        </div>
                      ) : addresses.length === 0 ? (
                        <div className="text-center py-10 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
                          <MapPin className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm font-medium">Chưa có địa chỉ nào</p>
                          <p className="text-gray-400 text-xs mt-1">Thêm địa chỉ để giao hàng nhanh hơn</p>
                        </div>
                      ) : (
                        addresses.map((address) => (
                          <div
                            key={address.id}
                            className="flex items-start justify-between gap-3 p-4 rounded-xl bg-gray-50/80 border border-gray-100 hover:border-gray-200 transition-colors"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
                                <MapPin className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <p className="text-gray-900 font-semibold text-sm">{address.label}</p>
                                  {address.isDefault && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                      Mặc định
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{address.street}</p>
                                <p className="text-sm text-gray-500">
                                  {address.city}, {address.state} {address.zip}
                                </p>
                                <p className="text-sm text-gray-500">{address.country}</p>
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-lg"
                                onClick={() => handleEditAddress(address)}
                              >
                                <Edit className="h-4 w-4 text-gray-500" />
                              </Button>
                              {!address.isDefault && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
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
                        className="w-full border-gray-200 text-gray-900 hover:bg-gray-50 rounded-xl h-11 font-medium"
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

            {/* Security Settings */}
            <TabsContent value="security" className="p-5 lg:p-6 focus-visible:outline-none">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                <Card className={cardClass}>
                  <CardHeader className="border-b border-gray-100 bg-gray-50/40 pb-4">
                    <CardTitle className="text-gray-900 flex items-center gap-3 text-base font-bold">
                      <span className="h-9 w-9 rounded-xl bg-sky-50 flex items-center justify-center">
                        <Lock className="h-[18px] w-[18px] text-sky-600" />
                      </span>
                      Đổi mật khẩu
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-sm">
                      Cập nhật mật khẩu để giữ tài khoản an toàn
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="currentPassword" className="text-gray-700 text-sm font-medium">Mật khẩu hiện tại</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="newPassword" className="text-gray-700 text-sm font-medium">Mật khẩu mới</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-gray-700 text-sm font-medium">Xác nhận mật khẩu mới</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold shadow-lg shadow-blue-600/20"
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Preferences Settings */}
            <TabsContent value="preferences" className="p-5 lg:p-6 focus-visible:outline-none">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className={cardClass}>
                  <CardHeader className="border-b border-gray-100 bg-gray-50/40 pb-4">
                    <CardTitle className="text-gray-900 flex items-center gap-3 text-base font-bold">
                      <span className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Globe className="h-[18px] w-[18px] text-indigo-600" />
                      </span>
                      Tùy chọn chung
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-sm">
                      Tùy chỉnh trải nghiệm mua sắm
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-0 pt-2">
                    <div className="space-y-2 py-4">
                      <Label className="text-gray-700 text-sm font-medium">Ngôn ngữ</Label>
                      <Select defaultValue="vi">
                        <SelectTrigger className={`${inputClass} h-11`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 rounded-xl">
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="en">Tiếng Anh</SelectItem>
                          <SelectItem value="es">Tiếng Tây Ban Nha</SelectItem>
                          <SelectItem value="fr">Tiếng Pháp</SelectItem>
                          <SelectItem value="de">Tiếng Đức</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator className="bg-gray-100" />
                    <div className="space-y-2 py-4">
                      <Label className="text-gray-700 text-sm font-medium">Tiền tệ</Label>
                      <Select defaultValue="vnd">
                        <SelectTrigger className={`${inputClass} h-11`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 rounded-xl">
                          <SelectItem value="vnd">VND - Việt Nam Đồng</SelectItem>
                          <SelectItem value="usd">USD - US Dollar</SelectItem>
                          <SelectItem value="eur">EUR - Euro</SelectItem>
                          <SelectItem value="gbp">GBP - British Pound</SelectItem>
                          <SelectItem value="jpy">JPY - Japanese Yen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator className="bg-gray-100" />
                    <div className="flex items-center justify-between gap-4 py-4 px-1 rounded-xl hover:bg-gray-50/80 transition-colors">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-gray-900 font-medium text-sm flex items-center gap-2">
                          <Moon className="h-4 w-4 text-gray-400" />
                          Chế độ tối
                        </Label>
                        <p className="text-xs text-gray-500">Giao diện tối trên toàn trang (sắp ra mắt)</p>
                      </div>
                      <Switch defaultChecked={false} className="data-[state=checked]:bg-blue-600 flex-shrink-0" />
                    </div>
                    <Separator className="bg-gray-100" />
                    <div className="flex items-center justify-between gap-4 py-4 px-1 rounded-xl hover:bg-gray-50/80 transition-colors">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-gray-900 font-medium text-sm">Gợi ý sản phẩm</Label>
                        <p className="text-xs text-gray-500">Gợi ý cá nhân hóa trên trang chủ</p>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-blue-600 flex-shrink-0" />
                    </div>
                    <div className="pt-4">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold shadow-lg shadow-blue-600/20"
                        onClick={() => toast.success("Đã lưu tùy chọn!")}
                      >
                        Lưu tùy chọn
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Store Settings */}
            {(userType === "SELLER" || userType === "ADMIN") && (
              <TabsContent value="store" className="p-5 lg:p-6 focus-visible:outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  <Card className={cardClass}>
                    <CardHeader className="border-b border-gray-100 bg-gray-50/40 pb-4">
                      <CardTitle className="text-gray-900 flex items-center gap-3 text-base font-bold">
                        <span className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Store className="h-[18px] w-[18px] text-blue-600" />
                        </span>
                        Trạng thái cửa hàng
                      </CardTitle>
                      <CardDescription className="text-gray-500 text-sm">
                        Quản lý hoạt động kinh doanh của bạn
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                        <div className="space-y-1">
                          <p className="text-gray-900 font-semibold text-sm">
                            {isSuspended ? "Cửa hàng đang tạm ngưng" : "Cửa hàng đang hoạt động"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {isSuspended
                              ? "Sản phẩm của bạn hiện đang bị ẩn và khách hàng không thể đặt hàng mới."
                              : "Sản phẩm của bạn đang hiển thị bình thường với khách hàng."}
                          </p>
                        </div>
                        <Button
                          variant={isSuspended ? "default" : "outline"}
                          className={isSuspended
                            ? "bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold px-6 h-10 shadow-lg shadow-blue-600/20"
                            : "border-gray-200 text-gray-900 hover:bg-white rounded-xl font-semibold px-6 h-10"}
                          onClick={() => setSuspendDialogOpen(true)}
                          disabled={isUpdatingStore}
                        >
                          {isSuspended ? "Mở lại cửa hàng" : "Tạm ngưng bán"}
                        </Button>
                      </div>

                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                        <div className="flex gap-3">
                          <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-amber-900 font-semibold text-sm">Lưu ý quan trọng</p>
                            <ul className="text-sm text-amber-800/80 space-y-1 list-disc list-inside">
                              <li>Bạn chỉ có thể tạm ngưng hoặc đóng cửa hàng khi KHÔNG có đơn hàng đang xử lý.</li>
                              <li>Khi tạm ngưng, tất cả sản phẩm đang hiển thị sẽ chuyển sang trạng thái "Ẩn".</li>
                              <li>Khi đóng cửa hàng, tài khoản của bạn sẽ trở về vai trò "Người mua" bình thường.</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-gray-100" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-100 bg-red-50/30">
                        <div className="space-y-1">
                          <p className="text-red-900 font-semibold text-sm">Đóng cửa hàng vĩnh viễn</p>
                          <p className="text-sm text-red-700/70">
                            Hành động này sẽ hủy tư cách Người bán của bạn. Bạn phải tạo yêu cầu mới nếu muốn bán lại.
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          className="rounded-xl font-semibold px-6 h-10"
                          onClick={() => setCloseStoreDialogOpen(true)}
                          disabled={isUpdatingStore}
                        >
                          Đóng cửa hàng
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6"
        >
          <Card className="bg-red-50/80 border-red-200 rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-red-100 bg-red-50/50 pb-4">
              <CardTitle className="text-red-700 text-base font-bold">Vùng nguy hiểm</CardTitle>
              <CardDescription className="text-red-600/70 text-sm">
                Hành động không thể hoàn tác — hãy cân nhắc kỹ
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-white border border-red-100">
                <div>
                  <p className="text-gray-900 font-semibold text-sm">Xóa tài khoản</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Xóa vĩnh viễn tài khoản và dữ liệu liên quan
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="rounded-xl font-semibold shadow-sm flex-shrink-0"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Xóa tài khoản
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-gray-200/80 rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 text-lg font-bold">Xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 text-sm leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản? Tất cả dữ liệu, đơn hàng và cài đặt sẽ bị xóa. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl border-gray-200 font-medium">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold"
            >
              {isDeleting ? "Đang xóa..." : "Xóa tài khoản"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Store Suspension Confirmation Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent className="bg-white border-gray-200/80 rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 text-lg font-bold">
              {isSuspended ? "Mở lại cửa hàng" : "Tạm ngưng bán"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 text-sm leading-relaxed">
              {isSuspended
                ? "Bạn có muốn mở lại cửa hàng? Các sản phẩm sẽ không tự động hiển thị lại, bạn cần kích hoạt thủ công."
                : "Tất cả sản phẩm đang bán sẽ bị chuyển sang trạng thái Ẩn. Bạn chỉ có thể thực hiện khi không có đơn hàng đang chờ xử lý."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl border-gray-200 font-medium">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleSuspension}
              disabled={isUpdatingStore}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
            >
              {isUpdatingStore ? "Đang xử lý..." : (isSuspended ? "Xác nhận mở lại" : "Xác nhận tạm ngưng")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close Store Confirmation Dialog */}
      <AlertDialog open={closeStoreDialogOpen} onOpenChange={setCloseStoreDialogOpen}>
        <AlertDialogContent className="bg-white border-gray-200/80 rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700 text-lg font-bold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Đóng cửa hàng vĩnh viễn
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-sm leading-relaxed">
              Hành động này sẽ **xóa vĩnh viễn** tư cách Người bán của bạn.
              <br /><br />
              - Bạn sẽ trở về vai trò Người mua.<br />
              - Tất cả sản phẩm sẽ bị ẩn vĩnh viễn.<br />
              - Bạn sẽ cần tạo yêu cầu mới nếu muốn bán hàng lại.<br /><br />
              Bạn có chắc chắn muốn tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl border-gray-200 font-medium">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseStore}
              disabled={isUpdatingStore}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold"
            >
              {isUpdatingStore ? "Đang xử lý..." : "Xác nhận đóng vĩnh viễn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="bg-white border-gray-200/80 text-gray-900 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{editingPayment ? "Chỉnh sửa phương thức thanh toán" : "Thêm phương thức thanh toán"}</DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              {editingPayment
                ? "Cập nhật thông tin phương thức thanh toán"
                : "Thêm phương thức thanh toán mới vào tài khoản"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cardNumber" className="text-gray-700 text-sm font-medium">Số thẻ</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                defaultValue={editingPayment ? `**** **** **** ${editingPayment.last4}` : ""}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="expiry" className="text-gray-700 text-sm font-medium">Ngày hết hạn</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  defaultValue={editingPayment?.expiry || ""}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cvv" className="text-gray-700 text-sm font-medium">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  type="password"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cardName" className="text-gray-700 text-sm font-medium">Tên chủ thẻ</Label>
              <Input
                id="cardName"
                placeholder="Nguyễn Văn A"
                className={inputClass}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
              className="border-gray-200 text-gray-900 hover:bg-gray-50 rounded-xl font-medium"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSavePayment}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20"
            >
              {editingPayment ? "Cập nhật" : "Thêm"} phương thức thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="bg-white border-gray-200/80 text-gray-900 max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingAddress ? "Chỉnh sửa địa chỉ giao hàng" : "Thêm địa chỉ giao hàng"}
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              {editingAddress
                ? "Cập nhật thông tin địa chỉ giao hàng"
                : "Thêm địa chỉ giao hàng mới vào tài khoản"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="addrFirstName" className="text-gray-700 text-sm font-medium">Họ <span className="text-red-500">*</span></Label>
                <Input
                  id="addrFirstName"
                  placeholder="Nguyễn"
                  value={addressForm.firstName}
                  onChange={(e) => updateAddressForm("firstName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addrLastName" className="text-gray-700 text-sm font-medium">Tên <span className="text-red-500">*</span></Label>
                <Input
                  id="addrLastName"
                  placeholder="Văn A"
                  value={addressForm.lastName}
                  onChange={(e) => updateAddressForm("lastName", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addressLabel" className="text-gray-700 text-sm font-medium">Nhãn địa chỉ</Label>
              <Input
                id="addressLabel"
                placeholder="Nhà, Văn phòng, v.v."
                value={addressForm.label}
                onChange={(e) => updateAddressForm("label", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="street" className="text-gray-700 text-sm font-medium">Địa chỉ</Label>
              <Input
                id="street"
                placeholder="123 Nguyễn Huệ"
                value={addressForm.street}
                onChange={(e) => updateAddressForm("street", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-gray-700 text-sm font-medium">Thành phố</Label>
                <Input
                  id="city"
                  placeholder="Hồ Chí Minh"
                  value={addressForm.city}
                  onChange={(e) => updateAddressForm("city", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-gray-700 text-sm font-medium">Tỉnh/Thành</Label>
                <Input
                  id="state"
                  placeholder="HCM"
                  value={addressForm.state}
                  onChange={(e) => updateAddressForm("state", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="zip" className="text-gray-700 text-sm font-medium">Mã bưu chính</Label>
                <Input
                  id="zip"
                  placeholder="10001"
                  value={addressForm.zip}
                  onChange={(e) => updateAddressForm("zip", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-gray-700 text-sm font-medium">Quốc gia</Label>
                <Input
                  id="country"
                  placeholder="Việt Nam"
                  value={addressForm.country}
                  onChange={(e) => updateAddressForm("country", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setAddressDialogOpen(false)}
              className="border-gray-200 text-gray-900 hover:bg-gray-50 rounded-xl font-medium"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveAddress}
              disabled={isSavingAddress}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20"
            >
              {isSavingAddress ? "Đang lưu..." : editingAddress ? "Cập nhật" : "Thêm"} địa chỉ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
