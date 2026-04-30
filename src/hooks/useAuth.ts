import { useState } from "react";
import { toast } from "sonner";
import { User } from "../types";
import { authService } from "../services/auth.service";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const checkAuth = async (): Promise<User | null> => {
    try {
      const { user: me } = await authService.me();
      setUser(me);
      setIsAuthenticated(true);
      return me;
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    const { user: me } = await authService.login(email, password);
    setUser(me);
    setIsAuthenticated(true);
    toast.success(`Chào mừng trở lại, ${me.name}!`);
    return me;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<User> => {
    const { user: me } = await authService.register(name, email, password);
    // Don't set user yet, wait for email verification
    return me;
  };

  const verifyEmail = async (email: string, code: string): Promise<void> => {
    await authService.verifyEmail(email, code);
    toast.success("Xác thực email thành công! Bây giờ bạn có thể đăng nhập.");
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch {
      // Session may have already expired
    }
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Đã đăng xuất thành công");
  };

  const becomeSellerRequest = async (message?: string): Promise<void> => {
    const { message: msg } = await authService.becomeSellerRequest(message);
    toast.success(msg);
    // Refresh user to update sellerRequestStatus so the button is blocked
    await checkAuth();
  };

  return {
    user,
    isAuthenticated,
    isAuthLoading,
    checkAuth,
    login,
    register,
    verifyEmail,
    logout,
    becomeSellerRequest,
  };
}
