import { get, post } from "../lib/api";

export interface EscrowStats {
  escrowBalance: number;
  escrowOrdersCount: number;
}

export interface EscrowOrder {
  id: string;
  total: number;
  status: string;
  revenueStatus: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  seller: {
    id: string;
    storeName: string;
  };
}

export const financeService = {
  getStats: () => 
    get<EscrowStats>("/api/v1/admin/finance/stats"),

  getEscrowOrders: (page = 1, limit = 20) =>
    get<{ orders: EscrowOrder[]; total: number; totalPages: number }>(
      `/api/v1/admin/finance/escrow-orders?page=${page}&limit=${limit}`
    ),

  forceRelease: (orderId: string) =>
    post(`/api/v1/admin/finance/orders/${orderId}/force-release`, {}),

  forceRefund: (orderId: string) =>
    post(`/api/v1/admin/finance/orders/${orderId}/force-refund`, {}),
};
