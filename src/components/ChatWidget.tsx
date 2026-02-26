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
            className="fixed bottom-24 right-4 z-50 w-80 md:w-96 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white/20">
                  <AvatarFallback className="bg-white/20 text-white">CS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white">Customer Support</p>
                  <p className="text-xs text-white/80">Online</p>
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
                  <AvatarFallback className="bg-purple-500 text-white text-xs">CS</AvatarFallback>
                </Avatar>
                <div className="bg-white/5 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                  <p className="text-sm text-white/90">
                    Hello! Welcome to ShopHub. How can I help you today?
                  </p>
                  <p className="text-xs text-white/50 mt-1">10:30 AM</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl rounded-tr-sm p-3 max-w-[80%]">
                  <p className="text-sm text-white">
                    Hi! I have a question about my recent order.
                  </p>
                  <p className="text-xs text-white/70 mt-1">10:31 AM</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-purple-500 text-white text-xs">CS</AvatarFallback>
                </Avatar>
                <div className="bg-white/5 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                  <p className="text-sm text-white/90">
                    I'd be happy to help! Please provide your order number and I'll check the status for you.
                  </p>
                  <p className="text-xs text-white/50 mt-1">10:31 AM</p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
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
