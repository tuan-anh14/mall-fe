import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Sparkles, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useChatBot } from "@/hooks/useChatBot";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, clearChat } = useChatBot();

  // Auto scroll to bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 50);
    }
  }, [isOpen, messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const msg = inputValue;
    setInputValue("");
    await sendMessage(msg);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 z-[10001] w-[380px] md:w-[420px] h-[600px] flex flex-col bg-white/80 backdrop-blur-xl border border-white/20 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-5 flex items-center justify-between overflow-hidden">
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
                  <h3 className="text-white font-bold flex items-center gap-1.5 leading-tight text-base">
                    ShopHub AI Assistant
                    <Sparkles size={14} className="text-blue-200" />
                  </h3>
                  <p className="text-[11px] text-blue-100/80 font-medium">Bản dùng thử AI thông minh</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={clearChat}
                  title="Xóa lịch sử"
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-full h-9 w-9"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
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
                      className={`px-4 py-3 text-[13.5px] shadow-sm transition-all leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-[20px] rounded-tr-[4px] shadow-blue-200/20"
                          : "bg-white/60 backdrop-blur-sm border border-white/50 text-slate-800 rounded-[20px] rounded-tl-[4px]"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1.5 px-1 font-medium">{msg.time}</span>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-8 w-8 flex-shrink-0 mt-1 shadow-sm">
                    <AvatarFallback className="bg-blue-50 text-white">
                      <Bot size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white/40 backdrop-blur-sm border border-white/40 px-4 py-3 rounded-[20px] rounded-tl-[4px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-gray-100/50">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-200 shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-300"
              >
                <Input
                  autoFocus
                  placeholder="Hỏi ShopHub AI..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  className="border-none focus-visible:ring-0 h-10 shadow-none text-sm placeholder:text-gray-400 flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 active:scale-90 transition-all"
                  disabled={!inputValue.trim() || isLoading}
                >
                  <Send className="h-4.5 w-4.5" />
                </Button>
              </form>
              <p className="text-[9px] text-center text-gray-400 mt-3 font-medium tracking-tight">
                Phản hồi có thể không chính xác 100%. Powered by <span className="text-blue-500 font-bold">ShopHub AI</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-[10001]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20 pointer-events-none"></span>
          )}
          
          <Button
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className={`h-16 w-16 rounded-full shadow-2xl transition-all duration-500 ${
              isOpen 
                ? "bg-white text-slate-800 rotate-90" 
                : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/40"
            }`}
          >
            {isOpen ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7 fill-current" />}
          </Button>

          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white border-2 border-white pointer-events-none shadow-lg animate-bounce">
              AI
            </span>
          )}
        </div>
      </motion.div>
    </>
  );
}

