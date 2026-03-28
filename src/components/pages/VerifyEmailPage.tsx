import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../ui/input-otp";
import { toast } from "sonner";

interface VerifyEmailPageProps {
  email: string;
  onNavigate: (page: string) => void;
  onVerify: (email: string, code: string) => Promise<void>;
}

export function VerifyEmailPage({ email, onNavigate, onVerify }: VerifyEmailPageProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0 && !canResend) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [resendTimer, canResend]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 chữ số");
      return;
    }

    setIsLoading(true);
    try {
      await onVerify(email, code);
    } catch (err: any) {
      toast.error(err.message || "Xác thực thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    if (!canResend) return;
    
    // In a real app, call resend API here
    toast.success("Mã mới đã được gửi đến email của bạn!");
    setResendTimer(60);
    setCanResend(false);
  };

  if (!email) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md text-center border border-red-100">
          <h2 className="text-xl font-bold mb-2">Thiếu thông tin Email</h2>
          <p className="mb-6 text-red-500/80">Chúng tôi không tìm thấy địa chỉ email cần xác thực. Vui lòng quay lại trang đăng ký.</p>
          <Button onClick={() => onNavigate("login")} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
            Quay lại Đăng ký
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-6">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Xác thực Email</h1>
          <p className="text-gray-500">
            Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến <br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        <div className="bg-white border border-gray-100 shadow-xl shadow-blue-500/5 rounded-3xl p-8">
          <div className="space-y-8">
            <div className="flex flex-col items-center space-y-4">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                onComplete={handleVerify}
              >
                <InputOTPGroup className="gap-2 sm:gap-4">
                  <InputOTPSlot index={0} className="w-12 h-14 text-xl sm:w-14 sm:h-16 sm:text-2xl rounded-xl border-gray-200" />
                  <InputOTPSlot index={1} className="w-12 h-14 text-xl sm:w-14 sm:h-16 sm:text-2xl rounded-xl border-gray-200" />
                  <InputOTPSlot index={2} className="w-12 h-14 text-xl sm:w-14 sm:h-16 sm:text-2xl rounded-xl border-gray-200" />
                  <InputOTPSlot index={3} className="w-12 h-14 text-xl sm:w-14 sm:h-16 sm:text-2xl rounded-xl border-gray-200" />
                  <InputOTPSlot index={4} className="w-12 h-14 text-xl sm:w-14 sm:h-16 sm:text-2xl rounded-xl border-gray-200" />
                  <InputOTPSlot index={5} className="w-12 h-14 text-xl sm:w-14 sm:h-16 sm:text-2xl rounded-xl border-gray-200" />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-sm text-gray-400">Nhập mã 6 chữ số để tiếp tục</p>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-600/20"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Đang xác thực...
                </span>
              ) : (
                "Xác nhận"
              )}
            </Button>

            <div className="text-center">
              <button
                onClick={handleResendCode}
                disabled={!canResend}
                className={`text-sm font-medium transition-colors ${
                  canResend ? "text-blue-600 hover:text-blue-700" : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {canResend ? "Gửi lại mã xác nhận" : `Gửi lại mã sau ${resendTimer}s`}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => onNavigate("login")}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại trang đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
