import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, ShoppingCart, Eye, EyeOff, ShieldCheck, Zap, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
  onRegister: (name: string, email: string, password: string) => Promise<void>;
}

export function LoginPage({ onNavigate, onLogin, onRegister }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

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
      await onRegister(data.name, data.email, data.password);
    } catch (err: any) {
      toast.error(err.message || "Đăng ký thất bại");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#f8fafc] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 lg:gap-8 items-stretch min-h-[700px] relative z-10">
        {/* Left Side - Luxury Branding */}
        <div className="hidden lg:flex flex-col relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-12 shadow-2xl group">
          {/* Animated Background Gradients */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.2, 0.3] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-400/20 blur-[100px]" 
          />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-16" onClick={() => onNavigate("home")} role="button">
              <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-105">
                <ShoppingCart className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl tracking-tight text-white"><span className="font-light">Shop</span> <span className="font-bold">MALL</span></span>
            </div>

            <div className="flex-1 space-y-12">
              <div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-extrabold text-white leading-tight"
                >
                  Nâng tầm trải nghiệm <br />
                  <span className="text-blue-300">Mua sắm số</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-blue-100/70 mt-6 max-w-md leading-relaxed"
                >
                  Khám phá thế giới thương mại điện tử cao cấp với tốc độ vượt trội và bảo mật tuyệt đối.
                </motion.p>
              </div>

              {/* Floating Glass Feature Cards */}
              <div className="grid gap-6">
                {[
                  { icon: <ShieldCheck className="h-6 w-6" />, title: "Bảo mật đa tầng", desc: "Mọi giao dịch được mã hóa 256-bit chuẩn quốc tế." },
                  { icon: <Zap className="h-6 w-6" />, title: "Tốc độ vượt trội", desc: "Hệ thống tối ưu, đặt hàng chỉ trong 3 giây." },
                  { icon: <Headphones className="h-6 w-6" />, title: "Hỗ trợ tận tâm", desc: "Đội ngũ chăm sóc khách hàng túc trực 24/7." }
                ].map((feature, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="flex items-center gap-5 p-5 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors cursor-default"
                  >
                    <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-200">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base">{feature.title}</h4>
                      <p className="text-blue-100/50 text-sm mt-0.5">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-auto border-t border-white/10 flex items-center justify-between text-blue-100/40 text-sm">
              <p>© 2024 SHOP MALL Inc.</p>
              <div className="flex gap-4">
                <span>Privacy</span>
                <span>Terms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="flex flex-col justify-center py-10 lg:py-0 px-2 lg:px-8">
          <div className="w-full max-w-md mx-auto">
            <Tabs 
              defaultValue="login" 
              className="w-full"
              onValueChange={setActiveTab}
            >
              <div className="mb-10 text-center lg:text-left">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                    {activeTab === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
                  </h1>
                  <p className="text-gray-500 font-medium">
                    {activeTab === "login" ? "Vui lòng nhập thông tin để tiếp tục" : "Điền thông tin của bạn để bắt đầu hành trình"}
                  </p>
                </motion.div>
              </div>

              <TabsList className="grid w-full grid-cols-2 p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-2xl mb-8">
                <TabsTrigger value="login" className="rounded-xl font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm py-2.5">
                  Đăng nhập
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm py-2.5">
                  Đăng ký
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                {/* Login Tab */}
                <TabsContent value="login">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={handleLogin} className="space-y-5 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-[2.5rem] p-4 lg:p-8 shadow-xl">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email" className="text-sm font-bold text-gray-700 ml-1">Email</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                              <Mail className="h-5 w-5" />
                            </div>
                            <Input
                              id="login-email"
                              type="email"
                              placeholder="admin@shopmall.com"
                              className="h-14 pl-12 bg-gray-50/50 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                              {...loginForm.register("email")}
                            />
                          </div>
                          {loginForm.formState.errors.email && (
                            <p className="text-xs font-bold text-red-500 ml-2 mt-1">{loginForm.formState.errors.email.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center ml-1">
                            <Label htmlFor="login-password" className="text-sm font-bold text-gray-700">Mật khẩu</Label>
                            <button
                              type="button"
                              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                              onClick={() => onNavigate("forgot-password")}
                            >
                              Quên mật khẩu?
                            </button>
                          </div>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                              <Lock className="h-5 w-5" />
                            </div>
                            <Input
                              id="login-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="h-14 pl-12 pr-12 bg-gray-50/50 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                              {...loginForm.register("password")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                          {loginForm.formState.errors.password && (
                            <p className="text-xs font-bold text-red-500 ml-2 mt-1">{loginForm.formState.errors.password.message}</p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          disabled={loginForm.formState.isSubmitting}
                          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-base font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {loginForm.formState.isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <motion.span 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full"
                              />
                              Đang đăng nhập...
                            </span>
                          ) : "Đăng nhập"}
                        </Button>
                      </div>

                      <div className="relative my-8">
                        <Separator className="bg-gray-100" />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                          hoặc đăng nhập bằng
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-14 rounded-2xl border-gray-200 hover:bg-gray-50 hover:border-gray-300 font-bold text-gray-700 transition-all group"
                          onClick={() => { window.location.href = `${API_URL}/api/v1/auth/google`; }}
                        >
                          <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          Google
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-14 rounded-2xl border-gray-200 hover:bg-gray-900 group transition-all"
                          onClick={() => { window.location.href = `${API_URL}/api/v1/auth/github`; }}
                        >
                          <svg className="h-5 w-5 mr-3 text-gray-900 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                          </svg>
                          <span className="font-bold text-gray-700 group-hover:text-white transition-colors">GitHub</span>
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={handleRegister} className="space-y-5 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-[2.5rem] p-4 lg:p-8 shadow-xl">
                      <div className="flex items-center gap-4 p-4 rounded-2xl border border-blue-100 bg-blue-50/50">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-600">
                          <ShoppingCart className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-gray-900 text-sm font-black uppercase tracking-tight">Buyer Account</p>
                          <p className="text-gray-500 text-[10px] font-medium leading-tight">Mặc định là tài khoản mua hàng, bạn có thể nâng cấp thành người bán sau.</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-name" className="text-sm font-bold text-gray-700 ml-1">Họ và tên</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                              <User className="h-5 w-5" />
                            </div>
                            <Input
                              id="register-name"
                              placeholder="Nguyễn Văn A"
                              className="h-13 pl-12 bg-gray-50/50 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                              {...registerForm.register("name")}
                            />
                          </div>
                          {registerForm.formState.errors.name && (
                            <p className="text-xs font-bold text-red-500 ml-2 mt-1">{registerForm.formState.errors.name.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-email" className="text-sm font-bold text-gray-700 ml-1">Email</Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                              <Mail className="h-5 w-5" />
                            </div>
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="you@example.com"
                              className="h-13 pl-12 bg-gray-50/50 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                              {...registerForm.register("email")}
                            />
                          </div>
                          {registerForm.formState.errors.email && (
                            <p className="text-xs font-bold text-red-500 ml-2 mt-1">{registerForm.formState.errors.email.message}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="register-password" className="text-sm font-bold text-gray-700 ml-1">Mật khẩu</Label>
                            <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <Lock className="h-5 w-5" />
                              </div>
                              <Input
                                id="register-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-13 pl-12 bg-gray-50/50 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                                {...registerForm.register("password")}
                              />
                            </div>
                            {registerForm.formState.errors.password && (
                              <p className="text-xs font-bold text-red-500 ml-2 mt-1">{registerForm.formState.errors.password.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="register-confirm" className="text-sm font-bold text-gray-700 ml-1">Xác nhận</Label>
                            <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <Lock className="h-5 w-5" />
                              </div>
                              <Input
                                id="register-confirm"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-13 pl-12 bg-gray-50/50 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                                {...registerForm.register("confirmPassword")}
                              />
                            </div>
                            {registerForm.formState.errors.confirmPassword && (
                              <p className="text-xs font-bold text-red-500 ml-2 mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                            )}
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={registerForm.formState.isSubmitting}
                          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-base font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {registerForm.formState.isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
                        </Button>
                      </div>

                      <p className="text-center text-[10px] leading-relaxed text-gray-400 font-medium px-4">
                        Bằng việc đăng ký, bạn đồng ý với{" "}
                        <button type="button" className="text-blue-600 hover:underline" onClick={() => onNavigate("terms")}>Điều khoản dịch vụ</button>
                        {" "}và{" "}
                        <button type="button" className="text-blue-600 hover:underline" onClick={() => onNavigate("privacy")}>Chính sách bảo mật</button>
                      </p>
                    </form>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
