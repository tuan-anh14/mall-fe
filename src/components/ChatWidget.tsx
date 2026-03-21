import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "motion/react";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 z-50 w-80 md:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white/20">
                  <AvatarFallback className="bg-white/20 text-white">CS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white">Hỗ trợ khách hàng</p>
                  <p className="text-xs text-white/80">Trực tuyến</p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-blue-600 text-white text-xs">CS</AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                  <p className="text-sm text-gray-800">
                    Xin chào! Chào mừng bạn đến với Shop MALL. Tôi có thể giúp gì cho bạn hôm nay?
                  </p>
                  <p className="text-xs text-gray-400 mt-1">10:30 AM</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <div className="bg-blue-600 rounded-2xl rounded-tr-sm p-3 max-w-[80%]">
                  <p className="text-sm text-white">
                    Xin chào! Tôi có câu hỏi về đơn hàng gần đây.
                  </p>
                  <p className="text-xs text-blue-100 mt-1">10:31 AM</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-blue-600 text-white text-xs">CS</AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                  <p className="text-sm text-gray-800">
                    Tôi rất vui được giúp bạn! Vui lòng cung cấp mã đơn hàng và tôi sẽ kiểm tra trạng thái cho bạn.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">10:31 AM</p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="border-gray-200"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      setMessage("");
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </motion.div>
    </>
  );
}
