import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { post } from "../../lib/api";
import { resetPasswordSchema, ResetPasswordFormData } from "../../lib/schemas";

interface ResetPasswordPageProps {
  onNavigate: (page: string) => void;
  token: string | null;
}

export function ResetPasswordPage({ onNavigate, token }: ResetPasswordPageProps) {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!token) {
      toast.error("Token đặt lại không hợp lệ hoặc bị thiếu");
      return;
    }
    try {
      await post("/api/v1/auth/reset-password", { token, password: data.password });
      setSubmitted(true);
      toast.success("Đặt lại mật khẩu thành công!");
    } catch (err: any) {
      toast.error(err.message || "Đặt lại thất bại");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {!submitted && (
          <Button
            variant="ghost"
            onClick={() => onNavigate("login")}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại đăng nhập
          </Button>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {!submitted ? (
            <>
              <div className="mb-8 text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl text-white mb-2">Đặt lại mật khẩu</h2>
                <p className="text-white/60">Nhập mật khẩu mới bên dưới</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Mật khẩu mới</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white/5 border-white/10"
                      {...register("password")}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white/5 border-white/10"
                      {...register("confirmPassword")}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isSubmitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-2xl text-white mb-2">Đã đặt lại mật khẩu!</h2>
              <p className="text-white/60 mb-6">
                Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.
              </p>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => onNavigate("login")}
              >
                Đăng nhập
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
