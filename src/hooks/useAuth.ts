import { useState } from "react";
import { toast } from "sonner";
import { User } from "../types";
import { authService } from "../services/auth.service";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const { user: me } = await authService.me();
      setUser(me);
      setIsAuthenticated(true);
      return true;
    } catch {
      return false;
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
    userType: "buyer" | "seller"
  ): Promise<User> => {
    const { user: me } = await authService.register(name, email, password, userType);
    setUser(me);
    setIsAuthenticated(true);
    toast.success(`Chào mừng, ${me.name}!`);
    return me;
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

  return {
    user,
    isAuthenticated,
    isAuthLoading,
    checkAuth,
    login,
    register,
    logout,
  };
}
