import React, { useState, useEffect } from "react";
import { useImagePreview } from "../context/ImagePreviewContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { returnService, ReturnRequest } from "../services/return.service";
import { formatCurrency } from "../lib/currency";

interface SellerReturnRequestModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  onSuccess?: () => void;
}

export function SellerReturnRequestModal({
  isOpen,
  onOpenChange,
  requestId,
  onSuccess,
}: SellerReturnRequestModalProps) {
  const [request, setRequest] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [sellerNote, setSellerNote] = useState("");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { openPreview } = useImagePreview();

  const getDefaultRefundAmount = (order: ReturnRequest["order"]) =>
    Math.max(0, Number(order.total || 0));

  useEffect(() => {
    if (isOpen && requestId) {
      fetchRequest();
    }
  }, [isOpen, requestId]);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const data = await returnService.getRequestById(requestId);
      setRequest(data);
      setSellerNote(data.sellerNote || "");
      setRefundAmount(data.refundAmount?.toString() || getDefaultRefundAmount(data.order).toString());
    } catch (error: any) {
      toast.error(error.message || "Không thể tải chi tiết yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    setIsSubmitting(true);
    try {
      await returnService.updateStatus(requestId, {
        status,
        sellerNote,
        refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
      });
      toast.success("Cập nhật trạng thái thành công!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReceipt = async () => {
    setIsSubmitting(true);
    try {
      await returnService.confirmReceipt(requestId);
      toast.success("Đã xác nhận nhận hàng và hoàn tiền cho khách!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi xác nhận.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Quản lý Yêu cầu Trả hàng</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
            <p className="text-gray-500">Đang tải chi tiết...</p>
          </div>
        ) : request ? (
          <div className="space-y-6 py-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Thông tin yêu cầu</p>
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-500 text-xs">Khách hàng:</Label>
                  <p className="text-gray-900 font-bold text-sm mt-0.5">
                    {request.user?.firstName} {request.user?.lastName} ({request.user?.email})
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs">Lý do từ khách hàng:</Label>
                  <p className="text-gray-900 text-sm mt-1 bg-white p-3 rounded-lg border border-gray-200">
                    {request.reason}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs">Hình ảnh minh chứng:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {request.images.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="evidence"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-zoom-in hover:scale-105 transition-transform"
                        onClick={() => openPreview(url)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refund" className="text-sm font-semibold text-gray-700">Số tiền hoàn lại</Label>
                  <div className="relative">
                    <Input
                      id="refund"
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="Nhập số tiền..."
                      className="rounded-xl border-gray-200 pr-10"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-gray-500">
                      đ
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Mặc định hoàn tiền hàng sau giảm giá và VAT.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Trạng thái hiện tại</Label>
                  <div className="h-10 flex items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      request.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                      request.status === 'APPROVED' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      request.status === 'REJECTED' ? 'bg-red-50 text-red-600 border border-red-100' :
                      'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellerNote" className="text-sm font-semibold text-gray-700">Ghi chú của người bán</Label>
                <Textarea
                  id="sellerNote"
                  placeholder="Nhập phản hồi cho khách hàng..."
                  className="min-h-[80px] rounded-xl border-gray-200"
                  value={sellerNote}
                  onChange={(e) => setSellerNote(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {request.status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl py-6"
                    disabled={isSubmitting}
                    onClick={() => handleUpdateStatus('REJECTED')}
                  >
                    <XCircle className="mr-2 h-5 w-5" />
                    Từ chối yêu cầu
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6"
                    disabled={isSubmitting}
                    onClick={() => handleUpdateStatus('APPROVED')}
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Chấp nhận trả hàng
                  </Button>
                </div>
              )}

              {request.status === 'APPROVED' && (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 text-lg font-bold"
                  disabled={isSubmitting}
                  onClick={handleConfirmReceipt}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-6 w-6" />
                  )}
                  Xác nhận đã nhận hàng & Hoàn tiền
                </Button>
              )}

              {request.status === 'COMPLETED' && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6" />
                  <p className="font-semibold text-sm">Yêu cầu này đã được hoàn tất và hoàn tiền.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            Không tìm thấy thông tin yêu cầu.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
