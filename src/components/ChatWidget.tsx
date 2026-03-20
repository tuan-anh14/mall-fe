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
            className="fixed bottom-24 right-4 z-50 w-80 md:w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-border">
                  <AvatarFallback className="bg-foreground/20 text-foreground">CS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-foreground">Hỗ trợ khách hàng</p>
                  <p className="text-xs text-muted-foreground">Trực tuyến</p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="text-foreground hover:bg-foreground/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-purple-500 text-white text-xs">CS</AvatarFallback>
                </Avatar>
                <div className="bg-foreground/5 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                  <p className="text-sm text-muted-foreground">
                    Xin chào! Chào mừng bạn đến với ShopHub. Tôi có thể giúp gì cho bạn hôm nay?
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">10:30 AM</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl rounded-tr-sm p-3 max-w-[80%]">
                  <p className="text-sm text-foreground">
                    Xin chào! Tôi có câu hỏi về đơn hàng gần đây.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">10:31 AM</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-purple-500 text-white text-xs">CS</AvatarFallback>
                </Avatar>
                <div className="bg-foreground/5 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                  <p className="text-sm text-muted-foreground">
                    Tôi rất vui được giúp bạn! Vui lòng cung cấp mã đơn hàng và tôi sẽ kiểm tra trạng thái cho bạn.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">10:31 AM</p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      setMessage("");
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
          className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </motion.div>
    </>
  );
}
