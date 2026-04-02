import { Facebook, Twitter, Instagram, Youtube, Mail, Apple, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#090e1a] text-gray-400 pt-20 pb-10 relative overflow-hidden mt-auto">
      {/* Background Subtle Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand & Description */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate("home")}>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
                <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin-slow" />
              </div>
              <span className="text-2xl tracking-tighter text-white">
                <span className="font-light italic">Shop</span> <span className="font-black text-blue-500">MALL</span>
              </span>
            </div>

            <p className="text-base text-gray-400 leading-relaxed max-w-sm">
              Định nghĩa lại trải nghiệm mua sắm trực tuyến với sự kết hợp hoàn hảo giữa công nghệ hiện đại và dịch vụ tận tâm.
            </p>

            <div className="flex gap-4">
              {[
                { icon: <Facebook className="h-5 w-5" />, label: "Facebook" },
                { icon: <Twitter className="h-5 w-5" />, label: "Twitter" },
                { icon: <Instagram className="h-5 w-5" />, label: "Instagram" },
                { icon: <Youtube className="h-5 w-5" />, label: "Youtube" }
              ].map((social, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ y: -4, color: "#3b82f6" }}
                  className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-blue-500/50 transition-all text-gray-400"
                >
                  {social.icon}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Khám phá</h3>
            <ul className="space-y-4">
              {["Giới thiệu", "Cửa hàng", "Liên hệ", "Tuyển dụng"].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => onNavigate(item === "Cửa hàng" ? "shop" : item.toLowerCase())}
                    className="group flex items-center text-sm font-medium hover:text-white transition-colors"
                  >
                    <span className="h-px w-0 bg-blue-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300" />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Hỗ trợ</h3>
            <ul className="space-y-4">
              {["Trung tâm trợ giúp", "Theo dõi đơn", "Chính sách đổi trả", "Vận chuyển"].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => onNavigate("help")}
                    className="group flex items-center text-sm font-medium hover:text-white transition-colors"
                  >
                    <span className="h-px w-0 bg-blue-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300" />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & App Download */}
          <div className="lg:col-span-4 space-y-10">
            <div className="space-y-4">
              <h3 className="text-white font-black uppercase tracking-widest text-xs">Tham gia bản tin</h3>
              <p className="text-sm text-gray-500">Nhận ưu đãi độc quyền và cập nhật mới nhất.</p>
              <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 focus-within:border-blue-500/50 transition-all">
                <Input
                  type="email"
                  placeholder="Email của bạn..."
                  className="bg-transparent border-none text-white placeholder:text-gray-600 focus-visible:ring-0 h-10"
                />
                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl px-6 h-10 transition-transform active:scale-95 shadow-lg shadow-amber-500/20">
                  Gửi
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-black uppercase tracking-widest text-xs">Tải ứng dụng</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="h-12 px-5 bg-white/5 border-white/10 hover:bg-white hover:text-black rounded-xl flex items-center gap-3 group transition-all">
                  <Apple className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <div className="text-left leading-none">
                    <p className="text-[10px] opacity-70">Download on</p>
                    <p className="text-sm font-bold">App Store</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-12 px-5 bg-white/5 border-white/10 hover:bg-white hover:text-black rounded-xl flex items-center gap-3 group transition-all">
                  <Smartphone className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <div className="text-left leading-none">
                    <p className="text-[10px] opacity-70">Get it on</p>
                    <p className="text-sm font-bold">CH Play</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/5 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold uppercase tracking-widest">
          <div className="flex gap-8">
            <button onClick={() => onNavigate("privacy")} className="hover:text-blue-500 transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate("terms")} className="hover:text-blue-500 transition-colors">Terms of Service</button>
            <button onClick={() => onNavigate("cookies")} className="hover:text-blue-500 transition-colors">Cookies</button>
          </div>
          <p className="text-gray-600">&copy; {currentYear} SHOP MALL</p>
        </div>
      </div>

      {/* Bottom Corner Accent */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-600/10 to-transparent pointer-events-none" />
    </footer>
  );
}
