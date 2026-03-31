import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User as UserIcon, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen]);

  const messages = [
    {
      id: 1,
      role: "assistant",
      content: "Xin chào! 👋 Tôi là trợ lý AI của ShopHub. Tôi có thể giúp gì cho bạn hôm nay?",
      time: "10:30 AM",
    },
    {
      id: 2,
      role: "user",
      content: "Tôi muốn tìm hiểu về chính sách hoàn tiền.",
      time: "10:31 AM",
    },
    {
      id: 3,
      role: "assistant",
      content: "Tại ShopHub, bạn có thể hoàn trả sản phẩm trong vòng 7 ngày kể từ khi nhận hàng nếu có lỗi từ nhà sản xuất. Bạn có muốn tôi hướng dẫn chi tiết các bước không?",
      time: "10:32 AM",
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 z-[10001] w-[380px] md:w-[420px] max-h-[600px] flex flex-col bg-white/80 backdrop-blur-xl border border-white/20 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-5 flex items-center justify-between overflow-hidden">
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <circle cx="10" cy="10" r="15" fill="white" />
                  <circle cx="90" cy="90" r="20" fill="white" />
                  <circle cx="50" cy="50" r="10" fill="white" />
                </svg>
              </div>

              <div className="relative flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white/30 shadow-inner">
                    <AvatarFallback className="bg-blue-500 text-white">
                      <Bot size={24} />
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-blue-700 rounded-full shadow-sm"></span>
                </div>
                <div>
                  <h3 className="text-white font-bold flex items-center gap-1.5 leading-tight">
                    ShopHub AI Assistant
                    <Sparkles size={14} className="text-blue-200" />
                  </h3>
                  <p className="text-[11px] text-blue-100/80 font-medium">Thường phản hồi ngay lập tức</p>
                </div>
              </div>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="relative text-white/80 hover:text-white hover:bg-white/10 rounded-full h-9 w-9"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 min-h-[350px] max-h-[400px] overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1 shadow-sm">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <Bot size={16} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] flex flex-col ${msg.role === "user" ? "items-end" : ""}`}>
                    <div
                      className={`px-4 py-3 text-sm shadow-sm transition-all ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-[20px] rounded-tr-[4px]"
                          : "bg-white/60 backdrop-blur-sm border border-white/50 text-gray-800 rounded-[20px] rounded-tl-[4px]"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1.5 px-1">{msg.time}</span>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator Placeholder */}
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-400">
                  <Bot size={16} />
                </div>
                <div className="bg-white/40 backdrop-blur-sm border border-white/40 px-4 py-3 rounded-[20px] rounded-tl-[4px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-gray-100">
              <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-200 shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="border-none focus-visible:ring-0 h-10 shadow-none text-sm placeholder:text-gray-400"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && message.trim()) {
                      setMessage("");
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="h-10 w-10 flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-blue-200 shadow-lg transition-transform active:scale-95"
                  disabled={!message.trim()}
                >
                  <Send className="h-4.5 w-4.5" />
                </Button>
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-3">
                Powered by <span className="font-semibold text-blue-500/80">ShopHub AI</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-[10001]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          {/* Pulse Effect */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20 pointer-events-none"></span>
          )}
          
          <Button
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className={`h-16 w-16 rounded-full shadow-[0_8px_30px_rgb(37,99,235,0.4)] transition-all duration-300 ${
              isOpen ? "bg-white text-gray-800 rotate-90" : "bg-blue-600 text-white"
            }`}
          >
            {isOpen ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7 fill-current" />}
          </Button>

          {/* Badge (Example: New notification) */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white pointer-events-none">
              1
            </span>
          )}
        </div>
      </motion.div>
    </>
  );
}

