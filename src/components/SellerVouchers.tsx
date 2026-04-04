import React from 'react';
import { Ticket, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/currency';

interface Coupon {
  id: string;
  code: string;
  name?: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validUntil?: string;
}

interface SellerVouchersProps {
  coupons: Coupon[];
}

export function SellerVouchers({ coupons }: SellerVouchersProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  if (!coupons || coupons.length === 0) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã: ${code}`, {
      description: "Dán mã này vào giỏ hàng để được giảm giá!",
      duration: 2000,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="my-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <Ticket className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Ưu đãi của Shop</h3>
            <p className="text-xs text-gray-500">Áp dụng trực tiếp cho các sản phẩm của shop này</p>
          </div>
        </div>
      </div>
      
      <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-1 px-1">
        {coupons.map((coupon) => (
          <div 
            key={coupon.id}
            className="flex-shrink-0 w-[280px] h-[132px] relative bg-white border border-blue-100/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden"
          >
            {/* Background design elements */}
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-blue-50/50 rounded-full group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-blue-700 font-extrabold text-2xl tracking-tighter">
                      {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                    </p>
                    <p className="text-blue-700/70 font-bold text-sm uppercase">OFF</p>
                  </div>
                  <p className="text-gray-500 text-[11px] mt-1 font-semibold leading-none">
                    {coupon.minOrderAmount ? `Đơn tối thiểu ${formatCurrency(coupon.minOrderAmount)}` : 'Mọi đơn hàng'}
                  </p>
                </div>
                <div className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black rounded-full uppercase tracking-tighter border border-blue-100/50">
                  Shop Voucher
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-auto bg-gray-50/80 rounded-xl p-2 border border-dashed border-gray-200 group-hover:border-blue-200 transition-colors">
              <span className="font-mono font-bold text-gray-700 text-sm tracking-widest">{coupon.code}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                className={`h-7 px-3 rounded-lg transition-all duration-300 ${
                  copiedCode === coupon.code 
                    ? "bg-emerald-50 text-emerald-600" 
                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-100/50"
                }`}
                onClick={() => handleCopy(coupon.code)}
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check className="h-3.5 w-3.5 animate-in zoom-in" />
                    <span className="ml-1.5 text-[10px] font-black tracking-wider">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="ml-1.5 text-[10px] font-black tracking-wider uppercase">Lấy mã</span>
                  </>
                )}
              </Button>
            </div>

            {/* Side notches for voucher feel */}
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-gray-50/50 rounded-full border-r border-blue-100" />
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-gray-50/50 rounded-full border-l border-blue-100" />
            
            {/* Decorative dots line */}
            <div className="absolute bottom-12 left-0 right-0 border-b border-dotted border-blue-50/50" />
          </div>
        ))}
        {coupons.length > 2 && (
          <div className="flex-shrink-0 w-12 flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity cursor-pointer px-2">
             <div className="w-1 h-1 rounded-full bg-blue-600 my-0.5" />
             <div className="w-1 h-1 rounded-full bg-blue-600 my-0.5" />
             <div className="w-1 h-1 rounded-full bg-blue-600 my-0.5" />
          </div>
        )}
      </div>
    </div>
  );
}
