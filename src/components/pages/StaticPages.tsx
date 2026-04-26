import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Star, Truck, Shield, Users, Heart, Globe, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { motion } from "motion/react";
import { toast } from "sonner";
import { post } from "../../lib/api";

import { formatCurrency, FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_COST } from "../../lib/currency";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const sectionReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-indigo-500/15 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-24 lg:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="max-w-3xl"
          >
            <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-4">Về chúng tôi</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
              Giới thiệu
              <span className="block bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">Shop MALL</span>
            </h1>
            <p className="text-lg text-blue-100/80 leading-relaxed max-w-xl">
              Điểm đến cao cấp cho các sản phẩm chất lượng từ 2026. Chúng tôi kết nối sản phẩm tuyệt vời với những khách hàng sành điệu.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative -mt-12 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { value: "10K+", label: "Khách hàng", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { value: "5K+", label: "Sản phẩm", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
              { value: "100+", label: "Quốc gia", icon: Globe, color: "text-emerald-600", bg: "bg-emerald-50" },
              { value: "99%", label: "Hài lòng", icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-lg shadow-gray-900/5 text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.bg} mb-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Câu chuyện của chúng tôi</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-6">Xây dựng trải nghiệm mua sắm hoàn hảo</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Shop MALL được thành lập với sứ mệnh đơn giản: tạo ra một nền tảng thương mại điện tử cao cấp kết nối các sản phẩm chất lượng với những khách hàng sành điệu. Chúng tôi tin rằng mua sắm trực tuyến nên là một trải nghiệm thú vị và liền mạch.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Ngày nay, chúng tôi phục vụ hàng nghìn khách hàng trên toàn thế giới, cung cấp các sản phẩm được tuyển chọn kỹ lưỡng trong lĩnh vực điện tử, thời trang, đồ gia dụng và nhiều hơn nữa. Cam kết xuất sắc là động lực cho mọi việc chúng tôi làm.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 bg-gray-50/80">
        <div className="container mx-auto px-4">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-12"
          >
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Giá trị cốt lõi</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Tại sao chọn chúng tôi</h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {[
              {
                icon: Star,
                title: "Chất lượng cao cấp",
                desc: "Chỉ những sản phẩm tốt nhất, được kiểm duyệt kỹ lưỡng mới có trên nền tảng của chúng tôi.",
                color: "text-amber-600",
                bg: "bg-gradient-to-br from-amber-50 to-orange-50",
                border: "border-amber-100",
              },
              {
                icon: Truck,
                title: "Giao hàng nhanh",
                desc: `Nhận đơn hàng trong 2-3 ngày làm việc. Miễn phí vận chuyển cho đơn hàng từ ${formatCurrency(FREE_SHIPPING_THRESHOLD)}.`,
                color: "text-emerald-600",
                bg: "bg-gradient-to-br from-emerald-50 to-green-50",
                border: "border-emerald-100",
              },
              {
                icon: Shield,
                title: "Thanh toán an toàn",
                desc: "Dữ liệu và giao dịch của bạn được bảo vệ bằng mã hóa tiên tiến nhất.",
                color: "text-blue-600",
                bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
                border: "border-blue-100",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className={`${item.bg} border ${item.border} rounded-2xl p-8 text-center transition-shadow duration-300 hover:shadow-lg`}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm mb-5">
                  <item.icon className={`h-7 w-7 ${item.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Sẵn sàng khám phá?
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Hàng nghìn sản phẩm chất lượng đang chờ bạn. Bắt đầu mua sắm ngay hôm nay.
            </p>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              Mua sắm ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsSubmitting(true);
    try {
      await post("/api/v1/contacts", formData);
      toast.success("Cảm ơn bạn! Tin nhắn đã được gửi thành công.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi tin nhắn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: Mail, title: "Email", lines: ["support@shophub.com", "sales@shophub.com"], color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { icon: Phone, title: "Điện thoại", lines: ["+1 (555) 123-4567", "+1 (555) 987-6543"], color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { icon: MapPin, title: "Địa chỉ", lines: ["123 Shopping Street", "New York, NY 10001"], color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
    { icon: Clock, title: "Giờ làm việc", lines: ["Thứ Hai - Thứ Sáu: 9h - 18h", "Thứ Bảy - Chủ Nhật: 10h - 16h"], color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-indigo-500/15 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-20 lg:py-28 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-4">Liên hệ</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
              Liên hệ với
              <span className="block bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">chúng tôi</span>
            </h1>
            <p className="text-lg text-blue-100/80 leading-relaxed max-w-xl mx-auto">
              Có câu hỏi? Chúng tôi rất muốn nghe từ bạn. Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Contact Info Cards ── */}
      <section className="relative -mt-10 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {contactInfo.map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-lg shadow-gray-900/5 transition-shadow duration-300 hover:shadow-xl"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${item.bg} border ${item.border} mb-4`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                {item.lines.map((line, j) => (
                  <p key={j} className="text-sm text-gray-600 leading-relaxed">{line}</p>
                ))}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Form + Map ── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
            {/* Form */}
            <motion.div
              variants={sectionReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="lg:col-span-3"
            >
              <div className="bg-white border border-gray-200/80 rounded-2xl p-8 md:p-10 shadow-sm">
                <div className="mb-8">
                  <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">Tin nhắn</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Gửi tin nhắn cho chúng tôi</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1.5 block">Họ và tên</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Nguyễn Văn A"
                        className="border-gray-200 rounded-xl h-11 bg-gray-50/50 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1.5 block">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        className="border-gray-200 rounded-xl h-11 bg-gray-50/50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium text-gray-700 mb-1.5 block">Chủ đề</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Bạn cần hỗ trợ gì?"
                      className="border-gray-200 rounded-xl h-11 bg-gray-50/50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700 mb-1.5 block">Nội dung</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Mô tả chi tiết yêu cầu của bạn..."
                      className="border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white transition-colors resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 rounded-xl h-12"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Gửi tin nhắn
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              variants={sectionReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="lg:col-span-2"
            >
              <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-8 md:p-10 text-white h-full relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-blue-400/15 blur-2xl" />
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">Phản hồi nhanh</h3>
                  <p className="text-blue-100/80 text-sm leading-relaxed mb-8">
                    Đội ngũ của chúng tôi thường phản hồi trong vòng 24 giờ vào ngày làm việc.
                  </p>

                  <div className="space-y-6">
                    {contactInfo.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white mb-0.5">{item.title}</p>
                          {item.lines.map((line, j) => (
                            <p key={j} className="text-sm text-blue-100/70">{line}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-gray-900 mb-6">Điều khoản dịch vụ</h1>
        <p className="text-gray-500 mb-8">Cập nhật lần cuối: 10 tháng 11, 2025</p>

        <div className="prose max-w-none space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">1. Chấp nhận điều khoản</h2>
            <p className="text-gray-600">
              Bằng việc truy cập và sử dụng Shop MALL, bạn chấp nhận và đồng ý tuân theo các điều khoản và quy định của thỏa thuận này.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">2. Giấy phép sử dụng</h2>
            <p className="text-gray-600">
              Được cấp phép tải xuống tạm thời một bản sao tài liệu trên Shop MALL chỉ để xem cá nhân, phi thương mại.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">3. Tuyên bố miễn trừ</h2>
            <p className="text-gray-600">
              Các tài liệu trên Shop MALL được cung cấp trên cơ sở 'nguyên trạng'. Shop MALL không đưa ra bảo đảm nào, dù rõ ràng hay ngụ ý.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-gray-900 mb-6">Chính sách bảo mật</h1>
        <p className="text-gray-500 mb-8">Cập nhật lần cuối: 10 tháng 11, 2025</p>

        <div className="prose max-w-none space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Thông tin chúng tôi thu thập</h2>
            <p className="text-gray-600">
              Chúng tôi thu thập thông tin bạn cung cấp trực tiếp, như khi bạn tạo tài khoản, mua hàng hoặc liên hệ hỗ trợ.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Cách chúng tôi sử dụng thông tin</h2>
            <p className="text-gray-600">
              Chúng tôi sử dụng thông tin thu thập để cung cấp, duy trì và cải thiện dịch vụ, xử lý giao dịch và liên lạc với bạn.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Chia sẻ thông tin</h2>
            <p className="text-gray-600">
              Chúng tôi không chia sẻ thông tin cá nhân của bạn với bên thứ ba trừ khi được mô tả trong chính sách này hoặc có sự đồng ý của bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CareersPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-gray-900 mb-6">Tuyển dụng tại Shop MALL</h1>
        <p className="text-xl text-gray-600 mb-12">
          Tham gia đội ngũ và cùng xây dựng tương lai thương mại điện tử.
        </p>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Tại sao làm việc với chúng tôi?</h2>
            <p className="text-gray-600 mb-6">
              Tại Shop MALL, chúng tôi không chỉ xây dựng một nền tảng thương mại điện tử. Chúng tôi đang tạo ra những trải nghiệm làm hài lòng khách hàng và trao quyền cho người bán. Hãy tham gia cùng chúng tôi!
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">💼</div>
                <h3 className="text-gray-900 mb-1">Lương cạnh tranh</h3>
                <p className="text-sm text-gray-500">Mức lương hàng đầu ngành</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">🏖️</div>
                <h3 className="text-gray-900 mb-1">Cân bằng công việc-cuộc sống</h3>
                <p className="text-sm text-gray-500">Giờ linh hoạt & làm việc từ xa</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="text-gray-900 mb-1">Phát triển</h3>
                <p className="text-sm text-gray-500">Cơ hội phát triển sự nghiệp</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Vị trí tuyển dụng</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-gray-900">Senior Frontend Developer</h3>
                  <span className="text-blue-600">Từ xa</span>
                </div>
                <p className="text-gray-500 mb-4">Xây dựng giao diện người dùng đẹp, responsive bằng React và các công nghệ web hiện đại.</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Ứng tuyển ngay</Button>
              </div>
              <div className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-gray-900">Product Designer</h3>
                  <span className="text-blue-600">New York, NY</span>
                </div>
                <p className="text-gray-500 mb-4">Thiết kế trải nghiệm trực quan và thú vị cho hàng triệu người dùng.</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Ứng tuyển ngay</Button>
              </div>
              <div className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-gray-900">Customer Success Manager</h3>
                  <span className="text-blue-600">Từ xa</span>
                </div>
                <p className="text-gray-500 mb-4">Giúp khách hàng thành công và xây dựng mối quan hệ bền vững.</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Ứng tuyển ngay</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-gray-900 mb-6">Đổi trả & Hoàn tiền</h1>
        <p className="text-xl text-gray-600 mb-12">
          Chúng tôi muốn bạn hoàn toàn hài lòng với đơn hàng.
        </p>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Chính sách đổi trả</h2>
            <p className="text-gray-600 mb-4">
              Chúng tôi cung cấp chính sách đổi trả 30 ngày cho hầu hết các sản phẩm. Nếu bạn không hài lòng với đơn hàng, bạn có thể trả lại để được hoàn tiền đầy đủ hoặc đổi sản phẩm.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Sản phẩm phải chưa sử dụng và còn nguyên bao bì</li>
              <li>• Miễn phí vận chuyển đổi trả cho sản phẩm lỗi</li>
              <li>• Hoàn tiền được xử lý trong 5-7 ngày làm việc</li>
              <li>• Một số sản phẩm có thể không đủ điều kiện đổi trả</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Cách đổi trả sản phẩm</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">1</div>
                <div>
                  <h3 className="text-gray-900 mb-1">Yêu cầu đổi trả</h3>
                  <p className="text-gray-500">Vào lịch sử đơn hàng và chọn sản phẩm bạn muốn đổi trả</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">2</div>
                <div>
                  <h3 className="text-gray-900 mb-1">In nhãn đổi trả</h3>
                  <p className="text-gray-500">Chúng tôi sẽ gửi email nhãn vận chuyển trả hàng miễn phí cho bạn</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">3</div>
                <div>
                  <h3 className="text-gray-900 mb-1">Gửi hàng trả lại</h3>
                  <p className="text-gray-500">Đóng gói sản phẩm cẩn thận và gửi tại bất kỳ điểm vận chuyển nào</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">4</div>
                <div>
                  <h3 className="text-gray-900 mb-1">Nhận hoàn tiền</h3>
                  <p className="text-gray-500">Khi chúng tôi nhận được sản phẩm, hoàn tiền sẽ được xử lý</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Sản phẩm không đổi trả</h2>
            <p className="text-gray-600 mb-4">Các sản phẩm sau không thể đổi trả:</p>
            <ul className="space-y-2 text-gray-600">
              <li>• Sản phẩm cá nhân hóa hoặc đặt làm riêng</li>
              <li>• Sản phẩm chăm sóc sức khỏe và cá nhân</li>
              <li>• Thẻ quà tặng</li>
              <li>• Phần mềm tải xuống</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-gray-900 mb-6">Thông tin vận chuyển</h1>
        <p className="text-xl text-gray-600 mb-12">
          Vận chuyển nhanh, đáng tin cậy đến tận nhà.
        </p>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Các phương thức vận chuyển</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-gray-900">Vận chuyển tiêu chuẩn</h3>
                  <span className="text-blue-600">$4.99</span>
                </div>
                <p className="text-gray-500">Giao hàng trong 5-7 ngày làm việc</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-gray-900">Vận chuyển nhanh (Mặc định)</h3>
                  <span className="text-blue-600">{formatCurrency(DEFAULT_SHIPPING_COST)}</span>
                </div>
                <p className="text-gray-500">Giao hàng trong 2-3 ngày làm việc</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-gray-900">Giao hàng hỏa tốc</h3>
                  <span className="text-blue-600">{formatCurrency(DEFAULT_SHIPPING_COST * 2)}</span>
                </div>
                <p className="text-gray-500">Đặt trước 14h để nhận hàng trong ngày hoặc sáng mai</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Miễn phí vận chuyển</h2>
            <p className="text-gray-600 mb-4">
              Miễn phí vận chuyển tiêu chuẩn cho đơn hàng từ {formatCurrency(FREE_SHIPPING_THRESHOLD)}! Không cần mã giảm giá, tự động áp dụng khi thanh toán.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Vận chuyển quốc tế</h2>
            <p className="text-gray-600 mb-4">
              Chúng tôi giao hàng đến hơn 100 quốc gia trên toàn thế giới. Phí vận chuyển quốc tế và thời gian giao hàng thay đổi theo điểm đến. Có thể phát sinh phí hải quan bổ sung.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Theo dõi đơn hàng</h2>
            <p className="text-gray-600 mb-4">
              Theo dõi đơn hàng bất cứ lúc nào bằng cách truy cập trang Theo dõi đơn hàng hoặc nhấp vào liên kết theo dõi trong email xác nhận vận chuyển.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Theo dõi đơn hàng</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-gray-900 mb-6">Chính sách Cookie</h1>
        <p className="text-gray-500 mb-8">Cập nhật lần cuối: 10 tháng 11, 2025</p>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Cookie là gì?</h2>
            <p className="text-gray-600">
              Cookie là các tệp văn bản nhỏ được lưu trữ trên thiết bị của bạn khi bạn truy cập trang web của chúng tôi. Chúng giúp chúng tôi cung cấp trải nghiệm tốt hơn bằng cách ghi nhớ tùy chọn của bạn và hiểu cách bạn sử dụng trang web.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Cách chúng tôi sử dụng Cookie</h2>
            <p className="text-gray-600 mb-4">Chúng tôi sử dụng cookie cho nhiều mục đích:</p>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong className="text-gray-900">Cookie thiết yếu:</strong> Cần thiết để trang web hoạt động bình thường</li>
              <li>• <strong className="text-gray-900">Cookie hiệu suất:</strong> Giúp chúng tôi hiểu cách khách truy cập tương tác với trang web</li>
              <li>• <strong className="text-gray-900">Cookie chức năng:</strong> Ghi nhớ tùy chọn và cài đặt của bạn</li>
              <li>• <strong className="text-gray-900">Cookie tiếp thị:</strong> Được sử dụng để hiển thị quảng cáo phù hợp</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Quản lý Cookie</h2>
            <p className="text-gray-600">
              Bạn có thể kiểm soát và quản lý cookie trong cài đặt trình duyệt. Xin lưu ý rằng việc xóa hoặc chặn cookie có thể ảnh hưởng đến trải nghiệm người dùng và một số tính năng có thể không hoạt động bình thường.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GDPRPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-gray-900 mb-6">Tuân thủ GDPR</h1>
        <p className="text-gray-500 mb-8">Cập nhật lần cuối: 10 tháng 11, 2025</p>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Quyền của bạn theo GDPR</h2>
            <p className="text-gray-600 mb-4">
              Nếu bạn là cư dân của Khu vực Kinh tế Châu Âu (EEA), bạn có một số quyền bảo vệ dữ liệu theo Quy định Bảo vệ Dữ liệu Chung (GDPR).
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong className="text-gray-900">Quyền truy cập:</strong> Bạn có thể yêu cầu bản sao dữ liệu cá nhân của mình</li>
              <li>• <strong className="text-gray-900">Quyền chỉnh sửa:</strong> Bạn có thể yêu cầu sửa dữ liệu không chính xác</li>
              <li>• <strong className="text-gray-900">Quyền xóa:</strong> Bạn có thể yêu cầu xóa dữ liệu cá nhân của mình</li>
              <li>• <strong className="text-gray-900">Quyền hạn chế xử lý:</strong> Bạn có thể yêu cầu giới hạn việc xử lý dữ liệu</li>
              <li>• <strong className="text-gray-900">Quyền chuyển dữ liệu:</strong> Bạn có thể yêu cầu chuyển dữ liệu của mình</li>
              <li>• <strong className="text-gray-900">Quyền phản đối:</strong> Bạn có thể phản đối việc xử lý dữ liệu của mình</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Cách thực hiện quyền của bạn</h2>
            <p className="text-gray-600 mb-4">
              Để thực hiện bất kỳ quyền GDPR nào, vui lòng liên hệ Nhân viên Bảo vệ Dữ liệu của chúng tôi tại privacy@ShopHub.com. Chúng tôi sẽ phản hồi yêu cầu của bạn trong vòng 30 ngày.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Bảo mật dữ liệu</h2>
            <p className="text-gray-600">
              Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu cá nhân của bạn khỏi việc xử lý trái phép hoặc bất hợp pháp, mất mát, hủy hoại hoặc hư hỏng ngẫu nhiên.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl text-gray-900 mb-4">Liên hệ với chúng tôi</h2>
            <p className="text-gray-600">
              Nếu bạn có bất kỳ câu hỏi nào về việc tuân thủ GDPR hoặc các hoạt động bảo vệ dữ liệu của chúng tôi, vui lòng liên hệ tại privacy@ShopHub.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
