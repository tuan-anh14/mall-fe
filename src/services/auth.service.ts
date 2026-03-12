import { get, post } from "../lib/api";
import { User } from "../types";

export const authService = {
  me(): Promise<{ user: User }> {
    return get<{ user: User }>("/api/v1/auth/me");
  },

  login(email: string, password: string): Promise<{ user: User }> {
    return post<{ user: User }>("/api/v1/auth/login", { email, password });
  },

  register(
    name: string,
    email: string,
    password: string,
    userType: "buyer" | "seller"
  ): Promise<{ user: User }> {
    return post<{ user: User }>("/api/v1/auth/register", {
      name,
      email,
      password,
      userType,
    });
  },

  logout(): Promise<void> {
    return post("/api/v1/auth/logout");
  },
};
