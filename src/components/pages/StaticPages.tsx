import React from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-foreground mb-6">Giới thiệu ShopHub</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Điểm đến cao cấp cho các sản phẩm chất lượng từ 2024.
        </p>

        <div className="prose prose-invert max-w-none space-y-6">
          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-3xl text-foreground mb-4">Câu chuyện của chúng tôi</h2>
            <p className="text-muted-foreground mb-4">
              ShopHub được thành lập với sứ mệnh đơn giản: tạo ra một nền tảng thương mại điện tử cao cấp kết nối các sản phẩm chất lượng với những khách hàng sành điệu. Chúng tôi tin rằng mua sắm trực tuyến nên là một trải nghiệm thú vị và liền mạch.
            </p>
            <p className="text-muted-foreground">
              Ngày nay, chúng tôi phục vụ hàng nghìn khách hàng trên toàn thế giới, cung cấp các sản phẩm được tuyển chọn kỹ lưỡng trong lĩnh vực điện tử, thời trang, đồ gia dụng và nhiều hơn nữa. Cam kết xuất sắc là động lực cho mọi việc chúng tôi làm.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-foreground/5 border border-border rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🌟</div>
              <h3 className="text-2xl text-foreground mb-2">Chất lượng cao cấp</h3>
              <p className="text-muted-foreground">Chỉ những sản phẩm tốt nhất mới có trên nền tảng của chúng tôi</p>
            </div>
            <div className="bg-foreground/5 border border-border rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🚚</div>
              <h3 className="text-2xl text-foreground mb-2">Giao hàng nhanh</h3>
              <p className="text-muted-foreground">Nhận đơn hàng trong 2-3 ngày</p>
            </div>
            <div className="bg-foreground/5 border border-border rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-2xl text-foreground mb-2">Thanh toán an toàn</h3>
              <p className="text-muted-foreground">Dữ liệu của bạn được bảo vệ với chúng tôi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl text-foreground mb-6 text-center">Liên hệ với chúng tôi</h1>
        <p className="text-xl text-muted-foreground mb-12 text-center">
          Có câu hỏi? Chúng tôi rất muốn nghe từ bạn.
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-6">Gửi tin nhắn cho chúng tôi</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Tên</Label>
                <Input id="name" className="bg-foreground/5 border-border" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" className="bg-foreground/5 border-border" />
              </div>
              <div>
                <Label htmlFor="subject">Chủ đề</Label>
                <Input id="subject" className="bg-foreground/5 border-border" />
              </div>
              <div>
                <Label htmlFor="message">Nội dung</Label>
                <Textarea
                  id="message"
                  rows={5}
                  className="bg-foreground/5 border-border"
                />
              </div>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Gửi tin nhắn
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-foreground/5 border border-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl text-foreground mb-1">Email</h3>
                  <p className="text-muted-foreground">support@shophub.com</p>
                  <p className="text-muted-foreground">sales@shophub.com</p>
                </div>
              </div>
            </div>

            <div className="bg-foreground/5 border border-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl text-foreground mb-1">Điện thoại</h3>
                  <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  <p className="text-muted-foreground">+1 (555) 987-6543</p>
                </div>
              </div>
            </div>

            <div className="bg-foreground/5 border border-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xl text-foreground mb-1">Địa chỉ</h3>
                  <p className="text-muted-foreground">123 Shopping Street</p>
                  <p className="text-muted-foreground">New York, NY 10001</p>
                </div>
              </div>
            </div>

            <div className="bg-foreground/5 border border-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl text-foreground mb-1">Giờ làm việc</h3>
                  <p className="text-muted-foreground">Thứ Hai - Thứ Sáu: 9h - 18h</p>
                  <p className="text-muted-foreground">Thứ Bảy - Chủ Nhật: 10h - 16h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-foreground mb-6">Điều khoản dịch vụ</h1>
        <p className="text-muted-foreground mb-8">Cập nhật lần cuối: 10 tháng 11, 2025</p>

        <div className="prose prose-invert max-w-none space-y-6">
          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">1. Chấp nhận điều khoản</h2>
            <p className="text-muted-foreground">
              Bằng việc truy cập và sử dụng ShopHub, bạn chấp nhận và đồng ý tuân theo các điều khoản và quy định của thỏa thuận này.
            </p>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">2. Giấy phép sử dụng</h2>
            <p className="text-muted-foreground">
              Được cấp phép tải xuống tạm thời một bản sao tài liệu trên ShopHub chỉ để xem cá nhân, phi thương mại.
            </p>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">3. Tuyên bố miễn trừ</h2>
            <p className="text-muted-foreground">
              Các tài liệu trên ShopHub được cung cấp trên cơ sở 'nguyên trạng'. ShopHub không đưa ra bảo đảm nào, dù rõ ràng hay ngụ ý.
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
        <h1 className="text-5xl text-foreground mb-6">Chính sách bảo mật</h1>
        <p className="text-muted-foreground mb-8">Cập nhật lần cuối: 10 tháng 11, 2025</p>

        <div className="prose prose-invert max-w-none space-y-6">
          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Thông tin chúng tôi thu thập</h2>
            <p className="text-muted-foreground">
              Chúng tôi thu thập thông tin bạn cung cấp trực tiếp, như khi bạn tạo tài khoản, mua hàng hoặc liên hệ hỗ trợ.
            </p>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Cách chúng tôi sử dụng thông tin</h2>
            <p className="text-muted-foreground">
              Chúng tôi sử dụng thông tin thu thập để cung cấp, duy trì và cải thiện dịch vụ, xử lý giao dịch và liên lạc với bạn.
            </p>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Chia sẻ thông tin</h2>
            <p className="text-muted-foreground">
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
        <h1 className="text-5xl text-foreground mb-6">Tuyển dụng tại ShopHub</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Tham gia đội ngũ và cùng xây dựng tương lai thương mại điện tử.
        </p>

        <div className="space-y-6">
          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Tại sao làm việc với chúng tôi?</h2>
            <p className="text-muted-foreground mb-6">
              Tại ShopHub, chúng tôi không chỉ xây dựng một nền tảng thương mại điện tử. Chúng tôi đang tạo ra những trải nghiệm làm hài lòng khách hàng và trao quyền cho người bán. Hãy tham gia cùng chúng tôi!
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-foreground/5 border border-border rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">💼</div>
                <h3 className="text-foreground mb-1">Lương cạnh tranh</h3>
                <p className="text-sm text-muted-foreground">Mức lương hàng đầu ngành</p>
              </div>
              <div className="bg-foreground/5 border border-border rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">🏖️</div>
                <h3 className="text-foreground mb-1">Cân bằng công việc-cuộc sống</h3>
                <p className="text-sm text-muted-foreground">Giờ linh hoạt & làm việc từ xa</p>
              </div>
              <div className="bg-foreground/5 border border-border rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="text-foreground mb-1">Phát triển</h3>
                <p className="text-sm text-muted-foreground">Cơ hội phát triển sự nghiệp</p>
              </div>
            </div>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Vị trí tuyển dụng</h2>
            <div className="space-y-4">
              <div className="border border-border rounded-xl p-6 hover:bg-foreground/5 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-foreground">Senior Frontend Developer</h3>
                  <span className="text-purple-400">Từ xa</span>
                </div>
                <p className="text-muted-foreground mb-4">Xây dựng giao diện người dùng đẹp, responsive bằng React và các công nghệ web hiện đại.</p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">Ứng tuyển ngay</Button>
              </div>
              <div className="border border-border rounded-xl p-6 hover:bg-foreground/5 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-foreground">Product Designer</h3>
                  <span className="text-purple-400">New York, NY</span>
                </div>
                <p className="text-muted-foreground mb-4">Thiết kế trải nghiệm trực quan và thú vị cho hàng triệu người dùng.</p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">Ứng tuyển ngay</Button>
              </div>
              <div className="border border-border rounded-xl p-6 hover:bg-foreground/5 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-foreground">Customer Success Manager</h3>
                  <span className="text-purple-400">Từ xa</span>
                </div>
                <p className="text-muted-foreground mb-4">Giúp khách hàng thành công và xây dựng mối quan hệ bền vững.</p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">Ứng tuyển ngay</Button>
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
        <h1 className="text-5xl text-foreground mb-6">Đổi trả & Hoàn tiền</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Chúng tôi muốn bạn hoàn toàn hài lòng với đơn hàng.
        </p>

        <div className="space-y-6">
          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Chính sách đổi trả</h2>
            <p className="text-muted-foreground mb-4">
              Chúng tôi cung cấp chính sách đổi trả 30 ngày cho hầu hết các sản phẩm. Nếu bạn không hài lòng với đơn hàng, bạn có thể trả lại để được hoàn tiền đầy đủ hoặc đổi sản phẩm.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Sản phẩm phải chưa sử dụng và còn nguyên bao bì</li>
              <li>• Miễn phí vận chuyển đổi trả cho sản phẩm lỗi</li>
              <li>• Hoàn tiền được xử lý trong 5-7 ngày làm việc</li>
              <li>• Một số sản phẩm có thể không đủ điều kiện đổi trả</li>
            </ul>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Cách đổi trả sản phẩm</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">1</div>
                <div>
                  <h3 className="text-foreground mb-1">Yêu cầu đổi trả</h3>
                  <p className="text-muted-foreground">Vào lịch sử đơn hàng và chọn sản phẩm bạn muốn đổi trả</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">2</div>
                <div>
                  <h3 className="text-foreground mb-1">In nhãn đổi trả</h3>
                  <p className="text-muted-foreground">Chúng tôi sẽ gửi email nhãn vận chuyển trả hàng miễn phí cho bạn</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">3</div>
                <div>
                  <h3 className="text-foreground mb-1">Gửi hàng trả lại</h3>
                  <p className="text-muted-foreground">Đóng gói sản phẩm cẩn thận và gửi tại bất kỳ điểm vận chuyển nào</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">4</div>
                <div>
                  <h3 className="text-foreground mb-1">Nhận hoàn tiền</h3>
                  <p className="text-muted-foreground">Khi chúng tôi nhận được sản phẩm, hoàn tiền sẽ được xử lý</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Sản phẩm không đổi trả</h2>
            <p className="text-muted-foreground mb-4">Các sản phẩm sau không thể đổi trả:</p>
            <ul className="space-y-2 text-muted-foreground">
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
        <h1 className="text-5xl text-foreground mb-6">Thông tin vận chuyển</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Vận chuyển nhanh, đáng tin cậy đến tận nhà.
        </p>

        <div className="space-y-6">
          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Các phương thức vận chuyển</h2>
            <div className="space-y-4">
              <div className="border border-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-foreground">Vận chuyển tiêu chuẩn</h3>
                  <span className="text-purple-400">$4.99</span>
                </div>
                <p className="text-muted-foreground">Giao hàng trong 5-7 ngày làm việc</p>
              </div>
              <div className="border border-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-foreground">Vận chuyển nhanh</h3>
                  <span className="text-purple-400">$9.99</span>
                </div>
                <p className="text-muted-foreground">Giao hàng trong 2-3 ngày làm việc</p>
              </div>
              <div className="border border-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-foreground">Giao hàng ngày hôm sau</h3>
                  <span className="text-purple-400">$19.99</span>
                </div>
                <p className="text-muted-foreground">Đặt trước 14h để nhận hàng ngày hôm sau</p>
              </div>
            </div>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Miễn phí vận chuyển</h2>
            <p className="text-muted-foreground mb-4">
              Miễn phí vận chuyển tiêu chuẩn cho đơn hàng trên $50! Không cần mã giảm giá, tự động áp dụng khi thanh toán.
            </p>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Vận chuyển quốc tế</h2>
            <p className="text-muted-foreground mb-4">
              Chúng tôi giao hàng đến hơn 100 quốc gia trên toàn thế giới. Phí vận chuyển quốc tế và thời gian giao hàng thay đổi theo điểm đến. Có thể phát sinh phí hải quan bổ sung.
            </p>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Theo dõi đơn hàng</h2>
            <p className="text-muted-foreground mb-4">
              Theo dõi đơn hàng bất cứ lúc nào bằng cách truy cập trang Theo dõi đơn hàng hoặc nhấp vào liên kết theo dõi trong email xác nhận vận chuyển.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">Theo dõi đơn hàng</Button>
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
        <h1 className="text-5xl text-foreground mb-6">Chính sách Cookie</h1>
        <p className="text-muted-foreground mb-8">Cập nhật lần cuối: 10 tháng 11, 2025</p>

        <div className="space-y-6">
          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Cookie là gì?</h2>
            <p className="text-muted-foreground">
              Cookie là các tệp văn bản nhỏ được lưu trữ trên thiết bị của bạn khi bạn truy cập trang web của chúng tôi. Chúng giúp chúng tôi cung cấp trải nghiệm tốt hơn bằng cách ghi nhớ tùy chọn của bạn và hiểu cách bạn sử dụng trang web.
            </p>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Cách chúng tôi sử dụng Cookie</h2>
            <p className="text-muted-foreground mb-4">Chúng tôi sử dụng cookie cho nhiều mục đích:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong className="text-foreground">Cookie thiết yếu:</strong> Cần thiết để trang web hoạt động bình thường</li>
              <li>• <strong className="text-foreground">Cookie hiệu suất:</strong> Giúp chúng tôi hiểu cách khách truy cập tương tác với trang web</li>
              <li>• <strong className="text-foreground">Cookie chức năng:</strong> Ghi nhớ tùy chọn và cài đặt của bạn</li>
              <li>• <strong className="text-foreground">Cookie tiếp thị:</strong> Được sử dụng để hiển thị quảng cáo phù hợp</li>
            </ul>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Quản lý Cookie</h2>
            <p className="text-muted-foreground">
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
        <h1 className="text-5xl text-foreground mb-6">Tuân thủ GDPR</h1>
        <p className="text-muted-foreground mb-8">Cập nhật lần cuối: 10 tháng 11, 2025</p>

        <div className="space-y-6">
          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Quyền của bạn theo GDPR</h2>
            <p className="text-muted-foreground mb-4">
              Nếu bạn là cư dân của Khu vực Kinh tế Châu Âu (EEA), bạn có một số quyền bảo vệ dữ liệu theo Quy định Bảo vệ Dữ liệu Chung (GDPR).
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong className="text-foreground">Quyền truy cập:</strong> Bạn có thể yêu cầu bản sao dữ liệu cá nhân của mình</li>
              <li>• <strong className="text-foreground">Quyền chỉnh sửa:</strong> Bạn có thể yêu cầu sửa dữ liệu không chính xác</li>
              <li>• <strong className="text-foreground">Quyền xóa:</strong> Bạn có thể yêu cầu xóa dữ liệu cá nhân của mình</li>
              <li>• <strong className="text-foreground">Quyền hạn chế xử lý:</strong> Bạn có thể yêu cầu giới hạn việc xử lý dữ liệu</li>
              <li>• <strong className="text-foreground">Quyền chuyển dữ liệu:</strong> Bạn có thể yêu cầu chuyển dữ liệu của mình</li>
              <li>• <strong className="text-foreground">Quyền phản đối:</strong> Bạn có thể phản đối việc xử lý dữ liệu của mình</li>
            </ul>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Cách thực hiện quyền của bạn</h2>
            <p className="text-muted-foreground mb-4">
              Để thực hiện bất kỳ quyền GDPR nào, vui lòng liên hệ Nhân viên Bảo vệ Dữ liệu của chúng tôi tại privacy@shophub.com. Chúng tôi sẽ phản hồi yêu cầu của bạn trong vòng 30 ngày.
            </p>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Bảo mật dữ liệu</h2>
            <p className="text-muted-foreground">
              Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu cá nhân của bạn khỏi việc xử lý trái phép hoặc bất hợp pháp, mất mát, hủy hoại hoặc hư hỏng ngẫu nhiên.
            </p>
          </div>

          <div className="bg-foreground/5 border border-border rounded-2xl p-8">
            <h2 className="text-2xl text-foreground mb-4">Liên hệ với chúng tôi</h2>
            <p className="text-muted-foreground">
              Nếu bạn có bất kỳ câu hỏi nào về việc tuân thủ GDPR hoặc các hoạt động bảo vệ dữ liệu của chúng tôi, vui lòng liên hệ tại privacy@shophub.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
