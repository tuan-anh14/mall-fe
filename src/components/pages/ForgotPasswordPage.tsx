import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle, ShieldQuestion } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { post } from "../../lib/api";
import { forgotPasswordSchema, ForgotPasswordFormData } from "../../lib/schemas";

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await post("/api/v1/auth/forgot-password", { email: data.email });
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#f8fafc] relative overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-indigo-400/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[500px] relative z-10">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.4 }}
        >
          <Button
            variant="ghost"
            onClick={() => onNavigate("login")}
            className="mb-8 h-10 px-4 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all group font-bold"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Quay lại đăng nhập
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl border border-white p-6 lg:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-200 transform -rotate-3">
                      <ShieldQuestion className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-amber-400 border-4 border-white flex items-center justify-center shadow-lg">
                      <div className="h-1 w-1 rounded-full bg-white animate-pulse" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Quên mật khẩu?</h2>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    Đừng quá lo lắng! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục tài khoản.
                  </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-bold text-gray-700 ml-1">Địa chỉ email</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="h-14 pl-12 bg-gray-50/50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs font-bold text-red-500 ml-2 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-base font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <motion.span 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full"
                        />
                        Đang xử lý...
                      </span>
                    ) : "Gửi yêu cầu khôi phục"}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="relative inline-block mb-8">
                  <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                    <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-100">
                      <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="absolute -bottom-1 -right-1 h-10 w-10 rounded-2xl bg-white border-4 border-green-50 flex items-center justify-center shadow-xl"
                  >
                    <Mail className="h-4 w-4 text-green-600" />
                  </motion.div>
                </div>

                <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Kiểm tra Email</h2>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mb-8">
                  <p className="text-gray-500 font-medium">
                    Liên kết khôi phục đã được gửi tới:
                  </p>
                  <p className="text-gray-900 font-black mt-1 break-all tracking-tight underline underline-offset-4 decoration-blue-200">{submittedEmail}</p>
                </div>
                
                <div className="space-y-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 leading-relaxed">
                    Bạn không nhận được email? <br />
                    Hãy kiểm tra thư mục Spam hoặc{" "}
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => setSubmitted(false)}
                    >
                      thử lại
                    </button>
                  </p>
                  
                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-gray-200 hover:bg-gray-50 font-bold transition-all"
                    onClick={() => onNavigate("login")}
                  >
                    Quay lại trang đăng nhập
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center mt-12 text-gray-400 text-xs font-medium uppercase tracking-widest leading-relaxed">
          Bảo mật bởi hệ thống Shop MALL <br /> 
          © 2024 Secure Authentication Center
        </p>
      </div>
    </div>
  );
}
