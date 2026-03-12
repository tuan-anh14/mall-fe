import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { post } from "../../lib/api";

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email");
      return;
    }
    setIsLoading(true);
    try {
      await post("/api/v1/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => onNavigate("login")}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại đăng nhập
        </Button>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {!submitted ? (
            <>
              <div className="mb-8 text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl text-white mb-2">Quên mật khẩu?</h2>
                <p className="text-white/60">
                  Đừng lo! Nhập email và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Địa chỉ email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 bg-white/5 border-white/10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isLoading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-2xl text-white mb-2">Kiểm tra email</h2>
              <p className="text-white/60 mb-6">
                Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong className="text-white">{email}</strong>
              </p>
              <p className="text-sm text-white/50 mb-6">
                Chưa nhận được email? Kiểm tra thư mục spam hoặc{" "}
                <button
                  type="button"
                  className="text-purple-400 hover:text-purple-300"
                  onClick={() => setSubmitted(false)}
                >
                  thử email khác
                </button>
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onNavigate("login")}
              >
                Quay lại đăng nhập
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
