import { get, post, patch } from "../lib/api";

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  images: string[];
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  refundAmount?: number;
  sellerNote?: string;
  createdAt: string;
  updatedAt: string;
  order: {
    subtotal: number;
    tax: number;
    couponDiscount?: number | null;
    total: number;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const returnService = {
  createRequest: (data: { orderId: string; reason: string; images: string[] }) => {
    return post<ReturnRequest>("/api/v1/return-requests", data);
  },

  getRequests: () => {
    return get<ReturnRequest[]>("/api/v1/return-requests");
  },

  getRequestById: (id: string) => {
    return get<ReturnRequest>(`/api/v1/return-requests/${id}`);
  },

  updateStatus: (id: string, data: { status: string; sellerNote?: string; refundAmount?: number }) => {
    return patch<ReturnRequest>(`/api/v1/return-requests/${id}/status`, data);
  },

  confirmReceipt: (id: string) => {
    return post<{ message: string; refundAmount: number }>(`/api/v1/return-requests/${id}/confirm-receipt`);
  }
};
