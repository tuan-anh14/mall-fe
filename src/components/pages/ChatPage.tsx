import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, Phone, Video, MoreVertical, Smile, Paperclip, Image as ImageIcon, Search, UserCircle, Ban, Flag, Trash2, BellOff, Archive } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card } from "../ui/card";
import { motion } from "motion/react";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner@2.0.3";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface ChatPageProps {
  onNavigate: (page: string, data?: any) => void;
  sellerInfo?: {
    name: string;
    avatar?: string;
    isOnline?: boolean;
    productName?: string;
  };
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "seller";
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  online: boolean;
  productName?: string;
  messages: Message[];
}

export function ChatPage({ onNavigate, sellerInfo }: ChatPageProps) {
  // Mock conversations data
  const [conversations] = useState<Conversation[]>([
    {
      id: 1,
      name: "TechStore Official",
      lastMessage: "Yes, we do! For orders of 5 or more...",
      time: "10:35 AM",
      unread: 0,
      avatar: "TS",
      online: true,
      productName: "Premium Wireless Headphones",
      messages: [
        {
          id: 1,
          text: "Hi! I'm interested in this product. Is it still available?",
          sender: "user",
          timestamp: "10:30 AM",
          status: "read",
        },
        {
          id: 2,
          text: "Hello! Yes, it's still available. We have it in stock.",
          sender: "seller",
          timestamp: "10:31 AM",
        },
        {
          id: 3,
          text: "Great! Can you tell me more about the specifications?",
          sender: "user",
          timestamp: "10:32 AM",
          status: "read",
        },
        {
          id: 4,
          text: "Of course! This product features high-quality materials and comes with a 2-year warranty. Would you like detailed specs?",
          sender: "seller",
          timestamp: "10:33 AM",
        },
        {
          id: 5,
          text: "Yes, please! Also, do you offer any discounts for bulk orders?",
          sender: "user",
          timestamp: "10:34 AM",
          status: "read",
        },
        {
          id: 6,
          text: "Yes, we do! For orders of 5 or more items, we offer a 15% discount. For 10+, it's 20% off.",
          sender: "seller",
          timestamp: "10:35 AM",
        },
      ],
    },
    {
      id: 2,
      name: "Fashion Hub",
      lastMessage: "The blue one is back in stock!",
      time: "Yesterday",
      unread: 2,
      avatar: "FH",
      online: false,
      productName: "Designer Summer Dress",
      messages: [
        {
          id: 1,
          text: "Do you have the blue dress in size M?",
          sender: "user",
          timestamp: "Yesterday",
          status: "read",
        },
        {
          id: 2,
          text: "Let me check our inventory for you.",
          sender: "seller",
          timestamp: "Yesterday",
        },
        {
          id: 3,
          text: "The blue one is back in stock!",
          sender: "seller",
          timestamp: "Yesterday",
        },
      ],
    },
    {
      id: 3,
      name: "Home Decor Store",
      lastMessage: "Shipping usually takes 3-5 days",
      time: "2 days ago",
      unread: 0,
      avatar: "HD",
      online: true,
      productName: "Modern Table Lamp",
      messages: [
        {
          id: 1,
          text: "How long does shipping take?",
          sender: "user",
          timestamp: "2 days ago",
          status: "read",
        },
        {
          id: 2,
          text: "Shipping usually takes 3-5 days",
          sender: "seller",
          timestamp: "2 days ago",
        },
      ],
    },
  ]);

  const [activeConversationId, setActiveConversationId] = useState(1);
  const [conversationMessages, setConversationMessages] = useState<{[key: number]: Message[]}>({});
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showClearChatDialog, setShowClearChatDialog] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const messages = conversationMessages[activeConversationId] || activeConversation.messages;

  // Scroll to bottom when messages change or active conversation changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversationId]);

  // Simulate seller typing
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === "user") {
      const timer = setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now(),
        text: newMessage,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
      };

      const updatedMessages = [...messages, message];
      setConversationMessages(prev => ({
        ...prev,
        [activeConversationId]: updatedMessages
      }));
      setNewMessage("");

      // Simulate message status updates
      setTimeout(() => {
        setConversationMessages((prev) => ({
          ...prev,
          [activeConversationId]: prev[activeConversationId].map((msg) => 
            msg.id === message.id ? { ...msg, status: "delivered" as const } : msg
          )
        }));
      }, 1000);

      setTimeout(() => {
        setConversationMessages((prev) => ({
          ...prev,
          [activeConversationId]: prev[activeConversationId].map((msg) => 
            msg.id === message.id ? { ...msg, status: "read" as const } : msg
          )
        }));
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceCall = () => {
    setShowCallDialog(true);
  };

  const handleVideoCall = () => {
    setShowVideoDialog(true);
  };

  const handleViewProfile = () => {
    toast.info(`Viewing ${activeConversation.name}'s profile`);
    // In a real app, this would navigate to the seller's profile
  };

  const handleBlockSeller = () => {
    toast.success(`${activeConversation.name} has been blocked`);
  };

  const handleReportConversation = () => {
    toast.success("Conversation reported. Our team will review it shortly.");
  };

  const handleClearChat = () => {
    setShowClearChatDialog(true);
  };

  const confirmClearChat = () => {
    setConversationMessages(prev => ({
      ...prev,
      [activeConversationId]: []
    }));
    setShowClearChatDialog(false);
    toast.success("Chat cleared successfully");
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? "Notifications enabled" : "Notifications muted");
  };

  const handleArchiveChat = () => {
    toast.success(`${activeConversation.name} chat archived`);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
          {/* Conversations List - Hidden on mobile when chat is open */}
          <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-4 cursor-pointer border-b border-white/5 ${
                    conv.id === activeConversationId ? "bg-white/10" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                          {conv.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-black" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white truncate">{conv.name}</p>
                        <span className="text-xs text-white/50">{conv.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-white/60 truncate">{conv.lastMessage}</p>
                        {conv.unread > 0 && (
                          <Badge className="bg-purple-600 text-white text-xs ml-2">{conv.unread}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onNavigate("shop")}
                    className="lg:hidden text-white"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                        {activeConversation.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {activeConversation.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-black" />
                    )}
                  </div>
                  <div>
                    <p className="text-white">{activeConversation.name}</p>
                    <p className="text-sm text-white/60">
                      {activeConversation.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleVoiceCall}
                    className="text-white hover:bg-white/10"
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleVideoCall}
                    className="text-white hover:bg-white/10"
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-white/10">
                      <DropdownMenuLabel className="text-white">Chat Options</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem 
                        onClick={handleViewProfile}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <UserCircle className="mr-2 h-4 w-4" />
                        View Seller Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleToggleMute}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <BellOff className="mr-2 h-4 w-4" />
                        {isMuted ? "Unmute" : "Mute"} Notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleArchiveChat}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive Chat
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem 
                        onClick={handleClearChat}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleBlockSeller}
                        className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Block Seller
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleReportConversation}
                        className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        Report Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Product Info */}
              {activeConversation.productName && (
                <div className="mt-3 p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-white/50 mb-1">Discussing about:</p>
                  <p className="text-sm text-white">{activeConversation.productName}</p>
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-2 max-w-[70%] ${
                      message.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback
                        className={
                          message.sender === "user"
                            ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs"
                            : "bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs"
                        }
                      >
                        {message.sender === "user" ? "ME" : activeConversation.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div
                        className={`rounded-2xl p-3 ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 rounded-tr-sm"
                            : "bg-white/10 rounded-tl-sm"
                        }`}
                      >
                        <p className="text-sm text-white">{message.text}</p>
                      </div>
                      <div
                        className={`flex items-center gap-2 mt-1 ${
                          message.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <p className="text-xs text-white/50">{message.timestamp}</p>
                        {message.sender === "user" && message.status && (
                          <span className="text-xs text-white/50">
                            {message.status === "sent" && "✓"}
                            {message.status === "delivered" && "✓✓"}
                            {message.status === "read" && "✓✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                      {activeConversation.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white/10 rounded-2xl rounded-tl-sm p-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-white/60 rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-white/60 rounded-full animate-bounce delay-100" />
                      <div className="h-2 w-2 bg-white/60 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 flex-shrink-0"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 flex-shrink-0"
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-white/5 border-white/10 text-white"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 flex-shrink-0"
                >
                  <Smile className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex-shrink-0"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Voice Call</DialogTitle>
            <DialogDescription className="text-white/60">
              Calling {activeConversation.name}...
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-8 gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">
                {activeConversation.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-white text-xl mb-2">{activeConversation.name}</p>
              <p className="text-white/60 text-sm">Ringing...</p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  setShowCallDialog(false);
                  toast.info("Call ended");
                }}
                className="h-14 w-14 rounded-full"
              >
                <Phone className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Call Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Video Call</DialogTitle>
            <DialogDescription className="text-white/60">
              Starting video call with {activeConversation.name}...
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-8 gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">
                {activeConversation.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-white text-xl mb-2">{activeConversation.name}</p>
              <p className="text-white/60 text-sm">Connecting...</p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  setShowVideoDialog(false);
                  toast.info("Video call ended");
                }}
                className="h-14 w-14 rounded-full"
              >
                <Video className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Chat Confirmation Dialog */}
      <AlertDialog open={showClearChatDialog} onOpenChange={setShowClearChatDialog}>
        <AlertDialogContent className="bg-zinc-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Clear Chat History?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will permanently delete all messages with {activeConversation.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearChat}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Clear Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
