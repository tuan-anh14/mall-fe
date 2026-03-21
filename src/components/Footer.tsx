import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center" />
              <span className="text-xl tracking-tight text-white"><span className="font-light">Shop</span> <span className="font-bold">MALL</span></span>
            </div>
            <p className="text-sm text-gray-400 mb-4 max-w-sm">
              Điểm đến cao cấp cho các sản phẩm chất lượng. Chúng tôi mang đến cho bạn bộ sưu tập tốt nhất về điện tử, thời trang và đồ gia dụng.
            </p>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-white">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate("about")} className="text-gray-400 hover:text-white transition-colors">
                  Giới thiệu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("shop")} className="text-gray-400 hover:text-white transition-colors">
                  Cửa hàng
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("contact")} className="text-gray-400 hover:text-white transition-colors">
                  Liên hệ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("careers")} className="text-gray-400 hover:text-white transition-colors">
                  Tuyển dụng
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-4 text-white">Dịch vụ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate("help")} className="text-gray-400 hover:text-white transition-colors">
                  Trung tâm hỗ trợ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("orders")} className="text-gray-400 hover:text-white transition-colors">
                  Theo dõi đơn hàng
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("returns")} className="text-gray-400 hover:text-white transition-colors">
                  Đổi trả
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("shipping")} className="text-gray-400 hover:text-white transition-colors">
                  Thông tin vận chuyển
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-white">Pháp lý</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate("privacy")} className="text-gray-400 hover:text-white transition-colors">
                  Chính sách bảo mật
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("terms")} className="text-gray-400 hover:text-white transition-colors">
                  Điều khoản dịch vụ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("cookies")} className="text-gray-400 hover:text-white transition-colors">
                  Chính sách Cookie
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("gdpr")} className="text-gray-400 hover:text-white transition-colors">
                  GDPR
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-white mb-1">Đăng ký nhận bản tin</h3>
              <p className="text-sm text-gray-400">Nhận thông tin cập nhật mới nhất về sản phẩm mới và khuyến mãi sắp tới</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 md:w-64"
              />
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                <Mail className="h-4 w-4 mr-2" />
                Đăng ký
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; 2025 Shop MALL. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
