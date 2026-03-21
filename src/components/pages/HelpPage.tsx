import { HelpCircle, Search, ChevronDown, ChevronUp, MessageCircle, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { motion } from "motion/react";
import { useState } from "react";

interface HelpPageProps {
  onNavigate?: (page: string, data?: any) => void;
}

export function HelpPage({ onNavigate }: HelpPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: "orders",
      title: "Đơn hàng & Vận chuyển",
      icon: "📦",
      questions: [
        {
          question: "Làm thế nào để theo dõi đơn hàng?",
          answer:
            "Bạn có thể theo dõi đơn hàng bằng cách vào trang Theo dõi đơn hàng từ menu hồ sơ hoặc sử dụng mã theo dõi được gửi qua email. Chỉ cần nhập số đơn hàng và địa chỉ email để xem cập nhật theo thời gian thực.",
        },
        {
          question: "Có những tùy chọn vận chuyển nào?",
          answer:
            "Chúng tôi cung cấp Giao hàng tiêu chuẩn (5-7 ngày làm việc), Giao hàng nhanh (2-3 ngày làm việc) và Giao hàng trong ngày. Chi phí vận chuyển thay đổi tùy theo vị trí và phương thức bạn chọn.",
        },
        {
          question: "Tôi có thể thay đổi địa chỉ giao hàng sau khi đặt hàng không?",
          answer:
            "Bạn có thể thay đổi địa chỉ giao hàng trong vòng 2 giờ sau khi đặt hàng. Sau đó, vui lòng liên hệ đội ngũ hỗ trợ khách hàng để được hỗ trợ.",
        },
        {
          question: "Bạn có giao hàng quốc tế không?",
          answer:
            "Có, chúng tôi giao hàng đến hơn 100 quốc gia trên toàn thế giới. Phí và thời gian giao hàng quốc tế thay đổi tùy theo điểm đến. Có thể phát sinh thêm phí hải quan.",
        },
      ],
    },
    {
      id: "returns",
      title: "Đổi trả & Hoàn tiền",
      icon: "🔄",
      questions: [
        {
          question: "Chính sách đổi trả của bạn là gì?",
          answer:
            "Chúng tôi áp dụng chính sách đổi trả trong 30 ngày cho hầu hết các sản phẩm. Sản phẩm phải chưa sử dụng, còn nguyên bao bì gốc và trong tình trạng như khi nhận hàng. Một số sản phẩm như hàng cá nhân hóa không được đổi trả.",
        },
        {
          question: "Làm thế nào để yêu cầu đổi trả?",
          answer:
            "Vào lịch sử đơn hàng, chọn đơn hàng bạn muốn đổi trả và nhấn 'Yêu cầu đổi trả'. Làm theo hướng dẫn để in nhãn trả hàng và gửi sản phẩm về cho chúng tôi.",
        },
        {
          question: "Khi nào tôi nhận được tiền hoàn?",
          answer:
            "Hoàn tiền được xử lý trong vòng 5-7 ngày làm việc sau khi chúng tôi nhận và kiểm tra sản phẩm trả lại. Số tiền hoàn sẽ được chuyển về phương thức thanh toán ban đầu của bạn.",
        },
        {
          question: "Tôi có thể đổi sản phẩm không?",
          answer:
            "Có, chúng tôi hỗ trợ đổi sang kích cỡ hoặc màu sắc khác. Vui lòng liên hệ hỗ trợ khách hàng để sắp xếp đổi hàng, hoặc bạn có thể trả sản phẩm cũ và đặt đơn hàng mới.",
        },
      ],
    },
    {
      id: "payment",
      title: "Thanh toán & Giá cả",
      icon: "💳",
      questions: [
        {
          question: "Bạn chấp nhận những phương thức thanh toán nào?",
          answer:
            "Chúng tôi chấp nhận tất cả các thẻ tín dụng lớn (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay và Shop Pay. Đối với đơn hàng lớn, chúng tôi cũng hỗ trợ thanh toán qua hóa đơn.",
        },
        {
          question: "Sử dụng thẻ tín dụng trên trang web có an toàn không?",
          answer:
            "Có, thông tin thanh toán của bạn hoàn toàn an toàn. Chúng tôi sử dụng mã hóa SSL tiêu chuẩn ngành và tuân thủ PCI DSS. Chúng tôi không bao giờ lưu trữ toàn bộ thông tin thẻ tín dụng trên máy chủ.",
        },
        {
          question: "Bạn có hỗ trợ đối chiếu giá không?",
          answer:
            "Có, chúng tôi hỗ trợ đối chiếu giá cho các sản phẩm giống hệt được bán bởi nhà bán lẻ ủy quyền. Liên hệ đội ngũ hỗ trợ với bằng chứng giá thấp hơn trong vòng 7 ngày kể từ ngày mua.",
        },
        {
          question: "Tôi có thể sử dụng nhiều mã giảm giá không?",
          answer:
            "Chỉ có thể áp dụng một mã giảm giá cho mỗi đơn hàng. Hệ thống sẽ tự động áp dụng mã giảm giá tốt nhất cho bạn.",
        },
      ],
    },
    {
      id: "account",
      title: "Tài khoản & Bảo mật",
      icon: "🔐",
      questions: [
        {
          question: "Làm thế nào để đặt lại mật khẩu?",
          answer:
            "Nhấn 'Quên mật khẩu' trên trang đăng nhập và nhập địa chỉ email. Bạn sẽ nhận được liên kết đặt lại mật khẩu qua email. Nhấn vào liên kết để tạo mật khẩu mới.",
        },
        {
          question: "Tôi có thể thay đổi địa chỉ email không?",
          answer:
            "Có, bạn có thể cập nhật địa chỉ email trong trang Cài đặt tài khoản. Bạn cần xác minh địa chỉ email mới trước khi nó được kích hoạt.",
        },
        {
          question: "Làm thế nào để bật xác thực hai yếu tố?",
          answer:
            "Vào Cài đặt > Bảo mật và bật 'Xác thực hai yếu tố'. Bạn có thể chọn nhận mã qua SMS hoặc sử dụng ứng dụng xác thực như Google Authenticator.",
        },
        {
          question: "Làm thế nào để xóa tài khoản?",
          answer:
            "Để xóa tài khoản, vào Cài đặt > Tài khoản và cuộn đến phần Vùng nguy hiểm. Xin lưu ý rằng hành động này không thể hoàn tác và toàn bộ dữ liệu của bạn sẽ bị xóa vĩnh viễn.",
        },
      ],
    },
    {
      id: "products",
      title: "Sản phẩm & Tồn kho",
      icon: "🛍️",
      questions: [
        {
          question: "Làm sao để biết sản phẩm còn hàng?",
          answer:
            "Tình trạng sản phẩm được hiển thị trên mỗi trang sản phẩm. Nếu sản phẩm hết hàng, bạn có thể đăng ký nhận thông báo qua email khi sản phẩm có hàng trở lại.",
        },
        {
          question: "Hình ảnh sản phẩm có chính xác không?",
          answer:
            "Chúng tôi cố gắng hiển thị hình ảnh sản phẩm chính xác. Tuy nhiên, màu sắc có thể khác đôi chút do cài đặt màn hình. Kiểm tra mô tả sản phẩm để biết thông số chi tiết.",
        },
        {
          question: "Bạn có cung cấp bảo hành sản phẩm không?",
          answer:
            "Nhiều sản phẩm của chúng tôi có bảo hành từ nhà sản xuất. Chi tiết bảo hành được liệt kê trên mỗi trang sản phẩm. Chúng tôi cũng cung cấp tùy chọn bảo hành mở rộng khi thanh toán.",
        },
        {
          question: "Tôi có thể đặt trước sản phẩm sắp ra mắt không?",
          answer:
            "Có, đặt trước có sẵn cho một số sản phẩm sắp ra mắt. Sản phẩm đặt trước được đánh dấu rõ ràng và sẽ được giao vào hoặc trước ngày phát hành.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Chúng tôi có thể giúp gì cho bạn?</h1>
          <p className="text-gray-500">Tìm câu trả lời cho các câu hỏi phổ biến hoặc liên hệ hỗ trợ</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm trợ giúp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 text-lg"
            />
          </div>
        </motion.div>

        {/* Quick Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          <Card className="bg-white border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-gray-900 mb-1">Trò chuyện trực tiếp</h3>
              <p className="text-sm text-gray-500 mb-3">Trò chuyện với đội ngũ hỗ trợ</p>
              <Button variant="ghost" size="sm" className="text-blue-600">
                Bắt đầu trò chuyện
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-gray-900 mb-1">Hỗ trợ qua Email</h3>
              <p className="text-sm text-gray-500 mb-3">Nhận trợ giúp qua email</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600"
                onClick={() => onNavigate?.("contact")}
              >
                Gửi Email
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-gray-900 mb-1">Hỗ trợ qua điện thoại</h3>
              <p className="text-sm text-gray-500 mb-3">Gọi cho chúng tôi: +84 234 567 890</p>
              <Button variant="ghost" size="sm" className="text-blue-600">
                Gọi ngay
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-gray-900 mb-6">Câu hỏi thường gặp</h2>
          <div className="space-y-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((item, qIndex) => (
                        <AccordionItem
                          key={qIndex}
                          value={`${category.id}-${qIndex}`}
                          className="border-gray-200"
                        >
                          <AccordionTrigger className="text-gray-900 hover:text-blue-600 text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-gray-900 mb-2">Vẫn cần trợ giúp?</h3>
              <p className="text-gray-500 mb-6">
                Đội ngũ hỗ trợ khách hàng của chúng tôi luôn sẵn sàng 24/7 để hỗ trợ bạn
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => onNavigate?.("contact")}
              >
                Liên hệ hỗ trợ
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
