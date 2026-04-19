import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Camera, X, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { returnService } from "../services/return.service";
import { post } from "../lib/api";

interface ReturnRequestModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onSuccess?: () => void;
}

export function ReturnRequestModal({
  isOpen,
  onOpenChange,
  orderId,
  onSuccess,
}: ReturnRequestModalProps) {
  const [reason, setReason] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (images.length + selectedFiles.length > 5) {
        toast.error("Bạn chỉ có thể tải lên tối đa 5 hình ảnh.");
        return;
      }
      setImages((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do đổi trả hàng.");
      return;
    }
    if (images.length === 0) {
      toast.error("Vui lòng tải lên ít nhất một ảnh minh chứng.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload images
      const formData = new FormData();
      images.forEach((file) => formData.append("files", file));
      
      const uploadRes = await post<{ urls: string[] }>("/api/v1/upload/images", formData);
      const imageUrls = uploadRes.urls || [];

      // 2. Create return request
      await returnService.createRequest({
        orderId,
        reason,
        images: imageUrls,
      });

      toast.success("Yêu cầu đổi trả đã được gửi thành công!");
      onSuccess?.();
      onOpenChange(false);
      // Reset form
      setReason("");
      setImages([]);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi gửi yêu cầu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Yêu cầu Đổi trả hàng</DialogTitle>
          <DialogDescription>
            Đơn hàng: <span className="font-semibold text-blue-600">{orderId}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-semibold text-gray-700">
              Lý do đổi trả <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Vui lòng mô tả chi tiết lý do bạn muốn trả hàng (sản phẩm lỗi, không đúng mẫu...)"
              className="min-h-[120px] focus:ring-blue-500 rounded-xl"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">
              Hình ảnh minh chứng ({images.length}/5) <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Vui lòng chụp ảnh sản phẩm, nhãn mác và chi tiết lỗi (nếu có).
            </p>
            
            <div className="grid grid-cols-5 gap-3">
              {images.map((file, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                  <Upload className="h-6 w-6 text-gray-400 group-hover:text-blue-500 mb-1" />
                  <span className="text-[10px] text-gray-400 group-hover:text-blue-500 uppercase font-bold">Thêm ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi yêu cầu"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
