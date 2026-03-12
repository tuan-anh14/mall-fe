import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { API_URL } from "../../lib/api";
import {
  loginSchema,
  registerSchema,
  LoginFormData,
  RegisterFormData,
} from "../../lib/schemas";

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string, userType: "buyer" | "seller") => Promise<void>;
}

export function LoginPage({ onNavigate, onLogin, onRegister }: LoginPageProps) {
  const [userType, setUserType] = useState<"buyer" | "seller">("buyer");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const handleLogin = loginForm.handleSubmit(async (data) => {
    try {
      await onLogin(data.email, data.password);
    } catch (err: any) {
      toast.error(err.message || "Đăng nhập thất bại");
    }
  });

  const handleRegister = registerForm.handleSubmit(async (data) => {
    try {
      await onRegister(data.name, data.email, data.password, userType);
    } catch (err: any) {
      toast.error(err.message || "Đăng ký thất bại");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl" />
            <div className="relative bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-white/10 rounded-3xl p-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl text-white">ShopHub</span>
              </div>
              <h2 className="text-4xl text-white mb-4">
                Chào mừng đến với Tương lai Mua sắm
              </h2>
              <p className="text-xl text-white/70 mb-8">
                Tham gia cùng hàng nghìn người bán và người mua trên sàn thương mại cao cấp của chúng tôi.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="text-white/80">Thanh toán an toàn & bảo vệ dữ liệu</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="text-white/80">Giao hàng nhanh & đổi trả dễ dàng</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="text-white/80">Hỗ trợ khách hàng 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl text-white mb-2">Chào mừng trở lại</h2>
                <p className="text-white/60 mb-6">Đăng nhập vào tài khoản</p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 bg-white/5 border-white/10"
                        {...loginForm.register("email")}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-red-400 mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="login-password">Mật khẩu</Label>
                      <button
                        type="button"
                        className="text-sm text-purple-400 hover:text-purple-300"
                        onClick={() => onNavigate("forgot-password")}
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-white/5 border-white/10"
                        {...loginForm.register("password")}
                      />
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-red-400 mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loginForm.formState.isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {loginForm.formState.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </div>

                <div className="relative my-6">
                  <Separator className="bg-white/10" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-950 px-3 text-sm text-white/60">
                    hoặc tiếp tục với
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => { window.location.href = `${API_URL}/api/v1/auth/google`; }}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => { window.location.href = `${API_URL}/api/v1/auth/github`; }}
                  >
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                    </svg>
                    GitHub
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl text-white mb-2">Tạo tài khoản</h2>
                <p className="text-white/60 mb-6">Tham gia ShopHub ngay hôm nay</p>

                {/* User Type Selection */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setUserType("buyer")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      userType === "buyer"
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <ShoppingCart className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-white text-sm">Tôi là Người mua</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("seller")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      userType === "seller"
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <User className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-white text-sm">Tôi là Người bán</p>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="register-name">Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <Input
                        id="register-name"
                        placeholder="Nguyễn Văn A"
                        className="pl-10 bg-white/5 border-white/10"
                        {...registerForm.register("name")}
                      />
                    </div>
                    {registerForm.formState.errors.name && (
                      <p className="text-xs text-red-400 mt-1">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 bg-white/5 border-white/10"
                        {...registerForm.register("email")}
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                      <p className="text-xs text-red-400 mt-1">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="register-password">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-white/5 border-white/10"
                        {...registerForm.register("password")}
                      />
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-xs text-red-400 mt-1">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="register-confirm">Xác nhận mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-white/5 border-white/10"
                        {...registerForm.register("confirmPassword")}
                      />
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-red-400 mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={registerForm.formState.isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {registerForm.formState.isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                  </Button>
                </div>

                <p className="text-center text-sm text-white/60 mt-6">
                  Bằng việc đăng ký, bạn đồng ý với{" "}
                  <button type="button" className="text-purple-400 hover:text-purple-300" onClick={() => onNavigate("terms")}>
                    Điều khoản dịch vụ
                  </button>{" "}
                  và{" "}
                  <button type="button" className="text-purple-400 hover:text-purple-300" onClick={() => onNavigate("privacy")}>
                    Chính sách bảo mật
                  </button>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
