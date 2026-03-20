import React, { useState, useEffect } from "react";
import { ArrowLeft, Star, Package, Shield, MessageCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { get } from "../../lib/api";
import { toast } from "sonner";
import { formatCurrency } from "../../lib/currency";

interface SellerProfilePageProps {
  onNavigate: (page: string, data?: any) => void;
  sellerUserId?: string;
}

export function SellerProfilePage({ onNavigate, sellerUserId }: SellerProfilePageProps) {
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerUserId) {
      toast.error("Không tìm thấy người bán");
      onNavigate("shop");
      return;
    }

    const fetchSellerProfile = async () => {
      setLoading(true);
      try {
        const res = await get<{ seller: any; products: any[] }>(
          `/api/v1/products/sellers/${sellerUserId}`
        );
        setSeller(res.seller);
        setProducts(res.products ?? []);
      } catch (err: any) {
        toast.error(err.message || "Không thể tải hồ sơ người bán");
        onNavigate("shop");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProfile();
  }, [sellerUserId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-muted-foreground">Đang tải hồ sơ người bán...</p>
        </div>
      </div>
    );
  }

  if (!seller) return null;

  const memberSince = seller.memberSince
    ? new Date(seller.memberSince).getFullYear()
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => onNavigate("shop")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại cửa hàng
      </Button>

      {/* Seller Header */}
      <div className="bg-foreground/5 border border-border rounded-2xl overflow-hidden mb-8">
        {/* Banner */}
        {seller.bannerImage ? (
          <div className="h-48 overflow-hidden">
            <img
              src={seller.bannerImage}
              alt="Ảnh bìa cửa hàng"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-r from-purple-900/40 to-blue-900/40" />
        )}

        <div className="p-6 -mt-12 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Store Logo */}
            <Avatar className="h-24 w-24 border-4 border-black">
              {seller.logoImage ? (
                <img src={seller.logoImage} alt={seller.storeName} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-3xl">
                  {seller.storeName?.[0]?.toUpperCase() ?? "S"}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl text-foreground">Cửa hàng {seller.storeName}</h1>
                {seller.isVerified && (
                  <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Shield className="h-3 w-3 mr-1" />
                    Đã xác minh
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {seller.positiveRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span>{seller.positiveRating}% đánh giá tích cực</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>{seller.totalProducts} sản phẩm</span>
                </div>
                {memberSince && (
                  <span>Thành viên từ {memberSince}</span>
                )}
              </div>

              {seller.description && (
                <p className="text-muted-foreground mt-3 text-sm max-w-2xl">{seller.description}</p>
              )}
            </div>

            <Button
              onClick={() =>
                onNavigate("chat", {
                  sellerId: seller.userId,
                  name: seller.storeName,
                })
              }
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex-shrink-0"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Liên hệ người bán
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <h2 className="text-2xl text-foreground mb-6">
          Sản phẩm ({seller.totalProducts})
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Chưa có sản phẩm</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-foreground/5 border border-border rounded-2xl overflow-hidden hover:border-border transition-all cursor-pointer group"
                onClick={() => onNavigate("product", product)}
              >
                <div className="aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={product.image || product.images?.[0]?.url || ""}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  {product.discount && (
                    <Badge className="mb-2 bg-gradient-to-r from-purple-600 to-blue-600 text-xs">
                      -{product.discount}%
                    </Badge>
                  )}
                  <p className="text-foreground text-sm font-medium line-clamp-2 mb-2">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-foreground font-semibold">{formatCurrency(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-muted-foreground text-sm line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {product.rating !== undefined && product.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-muted-foreground text-xs">{product.rating}</span>
                      {product.reviews > 0 && (
                        <span className="text-muted-foreground text-xs">({product.reviews})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
