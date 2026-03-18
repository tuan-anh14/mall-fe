import { get, post, put } from "../lib/api";

export interface WalletInfo {
  id: string;
  balance: number;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  type: "DEPOSIT" | "PAYMENT" | "REFUND" | "ADJUSTMENT";
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  orderId?: string;
  description?: string;
  gatewayTxnId?: string;
  createdAt: string;
}

export interface DepositIntent {
  transactionId: string;
  paymentUrl: string;
  amount: number;
  gateway: string;
}

export const walletService = {
  getWallet: () => get<WalletInfo>("/api/v1/wallet"),

  getTransactions: (page = 1, limit = 20) =>
    get<{ transactions: WalletTransaction[]; total: number; totalPages: number }>(
      `/api/v1/wallet/transactions?page=${page}&limit=${limit}`
    ),

  createDeposit: (amount: number, gateway: "VNPAY" | "MOMO", returnUrl?: string) =>
    post<DepositIntent>("/api/v1/wallet/deposit", { amount, gateway, returnUrl }),

  simulateDeposit: (txnId: string) =>
    post(`/api/v1/payment/simulate/${txnId}`, {}),

  // Admin
  adminGetWallets: (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    return get<{ wallets: any[]; total: number; totalPages: number }>(
      `/api/v1/wallet/admin/list?${params}`
    );
  },

  adminGetWallet: (userId: string) =>
    get(`/api/v1/wallet/admin/user/${userId}`),

  adminAdjust: (userId: string, amount: number, reason: string) =>
    put(`/api/v1/wallet/admin/user/${userId}/adjust`, { amount, reason }),
};
