import { useState, useEffect, useRef } from "react";
import {
  Send,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Image as ImageIcon,
  Search,
  UserCircle,
  Ban,
  Flag,
  Trash2,
  BellOff,
  Archive,
  MessageSquare,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { motion } from "motion/react";
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
import { get, post } from "../../lib/api";

interface ChatPageProps {
  onNavigate: (page: string, data?: any) => void;
  sellerInfo?: {
    sellerId?: string;
    productId?: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
    productName?: string;
  };
  userId?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "seller";
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  online: boolean;
  productName?: string;
}

function formatTime(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ChatPage({ onNavigate, sellerInfo, userId }: ChatPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showClearChatDialog, setShowClearChatDialog] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversationId]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // If sellerInfo is passed, create/find the conversation with that seller
  useEffect(() => {
    if (sellerInfo?.sellerId && conversations.length > 0) {
      // Try to find existing conversation with this seller (by name match as heuristic)
      const existing = conversations.find(
        (c) => c.name.toLowerCase() === sellerInfo.name?.toLowerCase()
      );
      if (existing) {
        selectConversation(existing.id);
      } else {
        createConversation(sellerInfo.sellerId, sellerInfo.productId);
      }
    } else if (sellerInfo?.sellerId && conversations.length === 0 && !isLoadingConversations) {
      createConversation(sellerInfo.sellerId, sellerInfo.productId);
    }
  }, [sellerInfo, conversations.length, isLoadingConversations]);

  const loadConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const res = await get<{
        conversations: Array<{
          id: string;
          otherUser: { id: string; name: string; avatar?: string };
          product?: { id: string; name: string; image?: string };
          lastMessage?: string;
          lastMessageAt?: string;
          unreadCount: number;
        }>;
      }>("/api/v1/conversations");

      const mapped: Conversation[] = (res.conversations ?? []).map((conv) => ({
        id: conv.id,
        name: conv.otherUser?.name ?? "Unknown",
        lastMessage: conv.lastMessage ?? "",
        time: conv.lastMessageAt ? formatTime(conv.lastMessageAt) : "",
        unread: conv.unreadCount ?? 0,
        avatar: getInitials(conv.otherUser?.name ?? ""),
        online: false,
        productName: conv.product?.name,
      }));

      setConversations(mapped);

      // Auto-select first conversation if none selected
      if (mapped.length > 0 && !activeConversationId && !sellerInfo?.sellerId) {
        selectConversation(mapped[0].id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load conversations");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const createConversation = async (sellerId: string, productId?: string) => {
    try {
      const body: any = { sellerId };
      if (productId) body.productId = productId;
      const res = await post<{ id: string; otherUser: any; product?: any; lastMessage?: string; lastMessageAt?: string; unreadCount: number }>(
        "/api/v1/conversations",
        body
      );
      const newConv: Conversation = {
        id: res.id,
        name: res.otherUser?.name ?? sellerInfo?.name ?? "Seller",
        lastMessage: res.lastMessage ?? "",
        time: res.lastMessageAt ? formatTime(res.lastMessageAt) : "",
        unread: res.unreadCount ?? 0,
        avatar: getInitials(res.otherUser?.name ?? sellerInfo?.name ?? ""),
        online: false,
        productName: res.product?.name ?? sellerInfo?.productName,
      };

      setConversations((prev) => {
        const exists = prev.find((c) => c.id === newConv.id);
        if (exists) return prev;
        return [newConv, ...prev];
      });
      selectConversation(newConv.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to create conversation");
    }
  };

  const selectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setMessages([]);
    setIsLoadingMessages(true);
    try {
      const res = await get<{
        items: Array<{
          id: string;
          content: string;
          senderId: string;
          sender: { id: string; name: string; avatar?: string };
          createdAt: string;
          status?: string;
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/api/v1/conversations/${convId}/messages?page=1&limit=50`);

      const mapped: Message[] = (res.items ?? []).map((msg) => {
        // Determine if sender is current user
        // If userId prop is available use it, else we compare senderId with the otherUser's id
        const conv = conversations.find((c) => c.id === convId);
        let isUser: boolean;
        if (userId) {
          isUser = msg.senderId === userId;
        } else {
          // Fallback: the otherUser is the "seller" — if msg.sender.name matches conv.name it's the seller
          isUser = conv ? msg.sender?.name !== conv.name : false;
        }
        return {
          id: msg.id,
          text: msg.content,
          sender: isUser ? "user" : "seller",
          timestamp: formatTime(msg.createdAt),
          status: isUser ? "read" : undefined,
        };
      });

      setMessages(mapped);
    } catch (err: any) {
      toast.error(err.message || "Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId || isSending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      text: content,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await post<{
        id: string;
        content: string;
        senderId: string;
        sender: { id: string; name: string };
        createdAt: string;
      }>(`/api/v1/conversations/${activeConversationId}/messages`, { content });

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                id: res.id,
                text: res.content,
                sender: "user",
                timestamp: formatTime(res.createdAt),
                status: "sent",
              }
            : m
        )
      );

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, lastMessage: content, time: "just now" }
            : c
        )
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
      // Remove temp message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
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
    toast.info(`Viewing ${activeConversation?.name}'s profile`);
  };

  const handleBlockSeller = () => {
    toast.success(`${activeConversation?.name} has been blocked`);
  };

  const handleReportConversation = () => {
    toast.success("Conversation reported. Our team will review it shortly.");
  };

  const handleClearChat = () => {
    setShowClearChatDialog(true);
  };

  const confirmClearChat = () => {
    setMessages([]);
    setShowClearChatDialog(false);
    toast.success("Chat cleared successfully");
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? "Notifications enabled" : "Notifications muted");
  };

  const handleArchiveChat = () => {
    toast.success(`${activeConversation?.name} chat archived`);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
          {/* Conversations List */}
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
              {isLoadingConversations ? (
                <div className="p-8 text-center text-white/40 text-sm">
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-10 w-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                    onClick={() => selectConversation(conv.id)}
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
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            {activeConversation ? (
              <>
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
                  {isLoadingMessages ? (
                    <div className="text-center text-white/40 text-sm py-8">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-white/40 text-sm py-8">
                      No messages yet. Say hello!
                    </div>
                  ) : (
                    messages.map((message) => (
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
                    ))
                  )}

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
                      disabled={isSending}
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
                      disabled={!newMessage.trim() || isSending}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* No conversation selected */
              <div className="flex-1 flex flex-col items-center justify-center text-white/40">
                <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voice Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Voice Call</DialogTitle>
            <DialogDescription className="text-white/60">
              Calling {activeConversation?.name}...
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-8 gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">
                {activeConversation?.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-white text-xl mb-2">{activeConversation?.name}</p>
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
              Starting video call with {activeConversation?.name}...
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-8 gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">
                {activeConversation?.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-white text-xl mb-2">{activeConversation?.name}</p>
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
              This will permanently delete all messages with {activeConversation?.name}. This action cannot be undone.
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
