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
import { motion } from "motion/react";
import { toast } from "sonner@2.0.3";
import { get, put, post, del } from "../../lib/api";

interface SettingsPageProps {
  onNavigate: (page: string, data?: any) => void;
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
  country: "United States",
};

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
      toast.error(err.message || "Failed to load profile");
    }
  };

  const loadAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const res = await get<{ addresses: Address[] }>("/api/v1/users/me/addresses");
      setAddresses(res.addresses ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load addresses");
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
      toast.error(err.message || "Failed to load notification settings");
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await put("/api/v1/users/me", { firstName, lastName, phone });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
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
      toast.error("Please fill in first name and last name");
      return;
    }
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zip) {
      toast.error("Please fill in all required address fields");
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
        toast.success("Address updated!");
      } else {
        const result = await post<{ address: Address }>("/api/v1/users/me/addresses", addressForm);
        setAddresses((prev) => [...prev, result.address]);
        toast.success("Address added!");
      }
      setAddressDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await del(`/api/v1/users/me/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Address deleted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete address");
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
      toast.success("Notification preferences saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save notification settings");
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
    toast.success(editingPayment ? "Payment method updated!" : "Payment method added!");
    setPaymentDialogOpen(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      return;
    }
    try {
      await del("/api/v1/users/me");
      toast.success("Account deleted successfully");
      onNavigate("home");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
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
              <h1 className="text-white">Settings</h1>
              <p className="text-sm text-white/60">Manage your account preferences</p>
            </div>
          </div>
        </motion.div>

        {/* Settings Tabs */}
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8 bg-white/5">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
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
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white/80">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white/80">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      readOnly
                      className="bg-white/5 border-white/10 text-white opacity-70 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white/80">Phone Number</Label>
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
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Manage your saved payment methods
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
                          <p className="text-white">Visa ending in 4242</p>
                          <p className="text-sm text-white/60">Expires 12/25</p>
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
                      Add Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Addresses */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Addresses
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Manage your delivery addresses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingAddresses ? (
                      <div className="text-center py-4 text-white/40 text-sm">
                        Loading addresses...
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-4 text-white/40 text-sm">
                        No addresses saved yet
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
                                    Default
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
                      Add New Address
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
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Email Notifications</Label>
                      <p className="text-sm text-white/60">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifSettings.emailNotifications}
                      onCheckedChange={() => toggleNotif("emailNotifications")}
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Order Updates</Label>
                      <p className="text-sm text-white/60">Get updates about your orders</p>
                    </div>
                    <Switch
                      checked={notifSettings.orderUpdates}
                      onCheckedChange={() => toggleNotif("orderUpdates")}
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Promotional Emails</Label>
                      <p className="text-sm text-white/60">Receive special offers and promotions</p>
                    </div>
                    <Switch
                      checked={notifSettings.promotions}
                      onCheckedChange={() => toggleNotif("promotions")}
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Price Drop Alerts</Label>
                      <p className="text-sm text-white/60">Get notified when wishlist items go on sale</p>
                    </div>
                    <Switch
                      checked={notifSettings.newsletter}
                      onCheckedChange={() => toggleNotif("newsletter")}
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Login Alerts</Label>
                      <p className="text-sm text-white/60">Get notified of new login activity</p>
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
                    {isSavingNotif ? "Saving..." : "Save Preferences"}
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
                    Change Password
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-white/80">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-white/80">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white/80">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => toast.success("Password updated!")}
                  >
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-white/60" />
                      <div>
                        <p className="text-white">Authenticator App</p>
                        <p className="text-sm text-white/60">
                          {notifSettings.twoFactorAuth ? "Enabled" : "Not enabled"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5"
                      onClick={() => toggleNotif("twoFactorAuth")}
                    >
                      {notifSettings.twoFactorAuth ? "Disable" : "Enable"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-white/60" />
                      <div>
                        <p className="text-white">Email Verification</p>
                        <p className="text-sm text-white/60">Enabled</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                      Disable
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Active Sessions
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Manage your active login sessions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <p className="text-white">Chrome on Windows</p>
                      <p className="text-sm text-white/60">Last active: 2 minutes ago</p>
                    </div>
                    <Button variant="ghost" size="sm">Revoke</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <p className="text-white">Safari on iPhone</p>
                      <p className="text-sm text-white/60">Last active: 2 days ago</p>
                    </div>
                    <Button variant="ghost" size="sm">Revoke</Button>
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
                    General Preferences
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Customize your shopping experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white/80">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="space-y-2">
                    <Label className="text-white/80">Currency</Label>
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
                        Dark Mode
                      </Label>
                      <p className="text-sm text-white/60">Use dark theme across the site</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Show Product Recommendations</Label>
                      <p className="text-sm text-white/60">Get personalized product suggestions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => toast.success("Preferences saved!")}
                  >
                    Save Preferences
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
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
              <CardDescription className="text-white/60">
                Irreversible actions - proceed with caution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Delete Account</p>
                  <p className="text-sm text-white/60">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="bg-black border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{editingPayment ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
            <DialogDescription className="text-white/60">
              {editingPayment
                ? "Update your payment method details"
                : "Add a new payment method to your account"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-white/80">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                defaultValue={editingPayment ? `**** **** **** ${editingPayment.last4}` : ""}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry" className="text-white/80">Expiry Date</Label>
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
              <Label htmlFor="cardName" className="text-white/80">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
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
              Cancel
            </Button>
            <Button
              onClick={handleSavePayment}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {editingPayment ? "Update" : "Add"} Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="bg-black border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Shipping Address" : "Add Shipping Address"}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {editingAddress
                ? "Update your shipping address details"
                : "Add a new shipping address to your account"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addrFirstName" className="text-white/80">First Name <span className="text-red-400">*</span></Label>
                <Input
                  id="addrFirstName"
                  placeholder="John"
                  value={addressForm.firstName}
                  onChange={(e) => updateAddressForm("firstName", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addrLastName" className="text-white/80">Last Name <span className="text-red-400">*</span></Label>
                <Input
                  id="addrLastName"
                  placeholder="Doe"
                  value={addressForm.lastName}
                  onChange={(e) => updateAddressForm("lastName", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLabel" className="text-white/80">Address Label</Label>
              <Input
                id="addressLabel"
                placeholder="Home, Office, etc."
                value={addressForm.label}
                onChange={(e) => updateAddressForm("label", e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street" className="text-white/80">Street Address</Label>
              <Input
                id="street"
                placeholder="123 Main Street"
                value={addressForm.street}
                onChange={(e) => updateAddressForm("street", e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-white/80">City</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={addressForm.city}
                  onChange={(e) => updateAddressForm("city", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-white/80">State/Province</Label>
                <Input
                  id="state"
                  placeholder="NY"
                  value={addressForm.state}
                  onChange={(e) => updateAddressForm("state", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zip" className="text-white/80">ZIP/Postal Code</Label>
                <Input
                  id="zip"
                  placeholder="10001"
                  value={addressForm.zip}
                  onChange={(e) => updateAddressForm("zip", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-white/80">Country</Label>
                <Input
                  id="country"
                  placeholder="United States"
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
              Cancel
            </Button>
            <Button
              onClick={handleSaveAddress}
              disabled={isSavingAddress}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {isSavingAddress ? "Saving..." : editingAddress ? "Update" : "Add"} Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
