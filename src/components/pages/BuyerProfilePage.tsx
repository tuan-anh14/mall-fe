import { useState, useEffect } from "react";
import { ArrowLeft, User, ShoppingBag, Star, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { get } from "../../lib/api";

interface BuyerProfilePageProps {
  onNavigate: (page: string, data?: any) => void;
  buyerUserId?: string;
}

interface BuyerProfile {
  id: string;
  name: string;
  memberSince: string;
  orderCount: number;
  reviewCount: number;
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatMemberSince(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
}

export function BuyerProfilePage({ onNavigate, buyerUserId }: BuyerProfilePageProps) {
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!buyerUserId) {
      setError(true);
      setLoading(false);
      return;
    }
    get<{ profile: BuyerProfile }>(`/api/v1/users/${buyerUserId}/buyer-profile`)
      .then((res) => setProfile(res.profile))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [buyerUserId]);

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4 max-w-xl">
        <Button
          variant="ghost"
          className="mb-6 text-white/60 hover:text-white"
          onClick={() => onNavigate("chat")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : error || !profile ? (
          <div className="text-center py-20">
            <User className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50">Không tìm thấy thông tin người dùng</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile header */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white/10">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl text-white mb-1">{profile.name}</h1>
              {profile.memberSince && (
                <p className="text-white/50 text-sm flex items-center justify-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Thành viên từ {formatMemberSince(profile.memberSince)}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <ShoppingBag className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-3xl text-white mb-1">{profile.orderCount}</p>
                <p className="text-sm text-white/50">Đơn hàng</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-3xl text-white mb-1">{profile.reviewCount}</p>
                <p className="text-sm text-white/50">Đánh giá</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
