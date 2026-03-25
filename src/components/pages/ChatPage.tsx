import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Image as ImageIcon,
  Search,
  UserCircle,
  Ban,
  Flag,
  Trash2,
  BellOff,
  Archive,
  MessageSquare,
  Maximize2
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
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
import { toast } from "sonner";
import { useImagePreview } from "../../context/ImagePreviewContext";
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
import { get, post, del } from "../../lib/api";
import { API_URL } from "../../lib/api";

interface ChatPageProps {
  onNavigate: (page: string, data?: any) => void;
  sellerInfo?: {
    sellerId?: string;
    productId?: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  };
  userId?: string;
  userType?: string;
  userAvatar?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "seller";
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  attachmentUrl?: string;
  attachmentType?: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  avatarUrl?: string;
  online: boolean;
  sellerUserId?: string;
}

function formatTime(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString();
}

function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ChatPage({ onNavigate, sellerInfo, userId, userType, userAvatar }: ChatPageProps) {
  const { openPreview } = useImagePreview();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showClearChatDialog, setShowClearChatDialog] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sellerConvInitiatedRef = useRef<string | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

  // Scroll to bottom only when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // If sellerInfo is passed, find or create the conversation with that seller (once per sellerId)
  useEffect(() => {
    if (!sellerInfo?.sellerId) return;
    if (isLoadingConversations) return;
    if (sellerConvInitiatedRef.current === sellerInfo.sellerId) return;

    const existing = conversations.find((c) => c.sellerUserId === sellerInfo.sellerId);
    if (existing) {
      sellerConvInitiatedRef.current = sellerInfo.sellerId;
      selectConversation(existing.id);
    } else {
      sellerConvInitiatedRef.current = sellerInfo.sellerId;
      createConversation(sellerInfo.sellerId, sellerInfo.productId);
    }
  }, [sellerInfo?.sellerId, isLoadingConversations, conversations]);

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

      const mapped: Conversation[] = (res.conversations ?? []).map((conv) => {
        const baseName = conv.otherUser?.name ?? "Không xác định";
        const displayName = userType === "buyer" ? `${baseName}` : baseName;
        return {
          id: conv.id,
          name: displayName,
          lastMessage: conv.lastMessage ?? "",
          time: conv.lastMessageAt ? formatTime(conv.lastMessageAt) : "",
          unread: conv.unreadCount ?? 0,
          avatar: getInitials(baseName),
          avatarUrl: conv.otherUser?.avatar,
          online: false,
          sellerUserId: conv.otherUser?.id,
        };
      });

      setConversations(mapped);

      // Auto-select first conversation if none selected
      if (mapped.length > 0 && !activeConversationId && !sellerInfo?.sellerId) {
        selectConversation(mapped[0].id);
      }
    } catch (err: any) {
      toast.error(err.message || "Không thể tải cuộc trò chuyện");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const createConversation = async (sellerId: string, productId?: string) => {
    try {
      const body: any = { sellerId };
      if (productId) body.productId = productId;
      const res = await post<{ conversation: { id: string; otherUser: any; product?: any; lastMessage?: string; lastMessageAt?: string; unreadCount: number } }>(
        "/api/v1/conversations",
        body
      );
      const conv = res.conversation ?? (res as any);
      const baseName = conv.otherUser?.name ?? sellerInfo?.name ?? "Người bán";
      const displayName = userType === "buyer" ? `${baseName}` : baseName;
      const newConv: Conversation = {
        id: conv.id,
        name: displayName,
        lastMessage: conv.lastMessage ?? "",
        time: conv.lastMessageAt ? formatTime(conv.lastMessageAt) : "",
        unread: conv.unreadCount ?? 0,
        avatar: getInitials(baseName),
        avatarUrl: conv.otherUser?.avatar || sellerInfo?.avatar,
        online: false,
        sellerUserId: conv.otherUser?.id,
      };

      setConversations((prev) => {
        const exists = prev.find((c) => c.id === newConv.id);
        if (exists) return prev;
        return [newConv, ...prev];
      });
      selectConversation(newConv.id);
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo cuộc trò chuyện");
    }
  };

  // Stop polling when component unmounts or conversation changes
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const startPolling = (convId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await get<{ messages: Array<{ id: string; text: string; isMine?: boolean; sender: { id: string; name: string }; attachmentUrl?: string; attachmentType?: string; createdAt: string }> }>(`/api/v1/conversations/${convId}/messages?page=1&limit=50`);
        const rawMessages = [...(res.messages ?? [])].reverse();
        setMessages((prev) => {
          // Only update if there are new messages
          if (rawMessages.length <= prev.length) return prev;
          return rawMessages.map((msg) => {
            const isUser = msg.isMine ?? (userId ? msg.sender?.id === userId : false);
            return {
              id: msg.id,
              text: msg.text,
              sender: isUser ? "user" as const : "seller" as const,
              timestamp: formatTime(msg.createdAt),
              status: isUser ? "read" as const : undefined,
              attachmentUrl: msg.attachmentUrl,
              attachmentType: msg.attachmentType,
            };
          });
        });
      } catch {
        // silently fail polling
      }
    }, 4000);
  };

  const selectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setMessages([]);
    setIsLoadingMessages(true);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    try {
      const res = await get<{
        messages: Array<{
          id: string;
          text: string;
          senderId?: string;
          isMine?: boolean;
          sender: { id: string; name: string; avatar?: string };
          attachmentUrl?: string;
          attachmentType?: string;
          createdAt: string;
          status?: string;
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/api/v1/conversations/${convId}/messages?page=1&limit=50`);

      // backend returns messages in desc order, reverse to show oldest first
      const rawMessages = [...(res.messages ?? [])].reverse();

      const mapped: Message[] = rawMessages.map((msg) => {
        // Use isMine from backend (most reliable), fallback to sender.id comparison
        const isUser = msg.isMine ?? (userId ? msg.sender?.id === userId : false);
        return {
          id: msg.id,
          text: msg.text,
          sender: isUser ? "user" : "seller",
          timestamp: formatTime(msg.createdAt),
          status: isUser ? "read" : undefined,
          attachmentUrl: msg.attachmentUrl,
          attachmentType: msg.attachmentType,
        };
      });

      setMessages(mapped);
      startPolling(convId);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải tin nhắn");
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
        message: {
          id: string;
          text: string;
          isMine: boolean;
          sender: { id: string; name: string };
          createdAt: string;
          attachmentUrl?: string;
          attachmentType?: string;
        };
      }>(`/api/v1/conversations/${activeConversationId}/messages`, { text: content });

      const msg = res.message;

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                id: msg.id,
                text: msg.text,
                sender: "user",
                timestamp: formatTime(msg.createdAt),
                status: "sent",
                attachmentUrl: msg.attachmentUrl,
                attachmentType: msg.attachmentType,
              }
            : m
        )
      );

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, lastMessage: content, time: "vừa xong" }
            : c
        )
      );
    } catch (err: any) {
      toast.error(err.message || "Không thể gửi tin nhắn");
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
    if (!activeConversation?.sellerUserId) {
      toast.info("Không tìm thấy hồ sơ");
      return;
    }
    if (userType?.toUpperCase() === "SELLER") {
      onNavigate("buyer-profile", { buyerUserId: activeConversation.sellerUserId });
    } else {
      onNavigate("seller-profile", { sellerUserId: activeConversation.sellerUserId });
    }
  };

  const handleBlockSeller = () => {
    toast.success(`Đã chặn ${activeConversation?.name}`);
  };

  const handleReportConversation = () => {
    toast.success("Đã báo cáo cuộc trò chuyện. Đội ngũ của chúng tôi sẽ xem xét sớm.");
  };

  const handleClearChat = () => {
    setShowClearChatDialog(true);
  };

  const confirmClearChat = async () => {
    if (!activeConversationId) return;
    setShowClearChatDialog(false);
    // Delete each message individually for the current user (server-side soft delete)
    const toDelete = messages.filter((m) => !m.id.startsWith("temp-"));
    await Promise.allSettled(
      toDelete.map((m) =>
        del(`/api/v1/conversations/${activeConversationId}/messages/${m.id}`)
      )
    );
    setMessages([]);
    toast.success("Đã xóa trò chuyện thành công");
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? "Đã bật thông báo" : "Đã tắt thông báo");
  };

  const handleArchiveChat = () => {
    toast.success(`Đã lưu trữ trò chuyện với ${activeConversation?.name}`);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeConversationId) return;
    try {
      await del(`/api/v1/conversations/${activeConversationId}/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa tin nhắn");
    }
  };

  const EMOJIS = ["😊", "😂", "❤️", "👍", "🔥", "😍", "🎉", "👏", "😢", "😮", "🙏", "💯", "✨", "🥰", "😎", "🤔", "💪", "🎁", "⭐", "🛒"];

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversationId) return;
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const uploadRes = await fetch(`${API_URL}/api/v1/upload/images`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      const imageUrl = uploadJson?.data?.urls?.[0] ?? null;
      if (!imageUrl) throw new Error("Tải lên thất bại");

      // Send as attachment message
      const tempId = `temp-img-${Date.now()}`;
      const tempMsg: Message = {
        id: tempId,
        text: "",
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
        attachmentUrl: imageUrl,
        attachmentType: "image",
      };
      setMessages((prev) => [...prev, tempMsg]);

      const res = await post<{ message: any }>(`/api/v1/conversations/${activeConversationId}/messages`, {
        text: "📷 Hình ảnh",
        attachmentUrl: imageUrl,
        attachmentType: "image",
      });
      const msg = res.message;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...m, id: msg.id, timestamp: formatTime(msg.createdAt), status: "sent" }
            : m
        )
      );
      toast.success("Đã gửi ảnh!");
    } catch (err: any) {
      toast.error(err.message || "Không thể tải ảnh lên");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
          {/* Conversations List */}
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  className="pl-10 bg-gray-50 border-gray-200 text-gray-900"
                  value={conversationSearch}
                  onChange={(e) => setConversationSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingConversations ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Đang tải cuộc trò chuyện...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Chưa có cuộc trò chuyện</p>
                </div>
              ) : (
                (() => {
                  const filtered = conversations.filter((conv) =>
                    conversationSearch.trim() === "" ||
                    conv.name.toLowerCase().includes(conversationSearch.toLowerCase()) ||
                    (conv.lastMessage ?? "").toLowerCase().includes(conversationSearch.toLowerCase())
                  );
                  return filtered.length === 0 ? (
                    <div className="p-8 text-center">
                      <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Không tìm thấy cuộc trò chuyện</p>
                    </div>
                  ) : (
                    <>
                      {filtered.map((conv) => (
                        <motion.div
                          key={conv.id}
                          whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                          onClick={() => selectConversation(conv.id)}
                          className={`p-4 cursor-pointer border-b border-gray-100 ${
                            conv.id === activeConversationId ? "bg-gray-100" : ""
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                {conv.avatarUrl && <AvatarImage src={conv.avatarUrl} className="object-cover" />}
                                <AvatarFallback className="bg-blue-600 text-white">
                                  {conv.avatar}
                                </AvatarFallback>
                              </Avatar>
                              {conv.online && (
                                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-gray-900 truncate">{conv.name}</p>
                                <span className="text-xs text-gray-400">{conv.time}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                {conv.unread > 0 && (
                                  <Badge className="bg-blue-600 text-white text-xs ml-2">{conv.unread}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </>
                  );
                })()
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onNavigate("shop")}
                        className="lg:hidden text-gray-900"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          {activeConversation.avatarUrl && <AvatarImage src={activeConversation.avatarUrl} className="object-cover" />}
                          <AvatarFallback className="bg-blue-600 text-white">
                            {activeConversation.avatar}
                          </AvatarFallback>
                        </Avatar>
                        {activeConversation.online && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-gray-900">{activeConversation.name}</p>
                        <p className="text-sm text-gray-500">
                          {activeConversation.online ? "Trực tuyến" : "Ngoại tuyến"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleVoiceCall}
                        className="text-gray-600 hover:bg-gray-100"
                      >
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleVideoCall}
                        className="text-gray-600 hover:bg-gray-100"
                      >
                        <Video className="h-5 w-5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center size-9 rounded-md text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none">
                          <MoreVertical className="h-5 w-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200 z-[200]">
                          <DropdownMenuLabel className="text-gray-900">Tùy chọn trò chuyện</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-gray-200" />
                          <DropdownMenuItem
                            onClick={handleViewProfile}
                            className="text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <UserCircle className="mr-2 h-4 w-4" />
                            {userType?.toUpperCase() === "SELLER" ? "Xem hồ sơ người mua" : "Xem hồ sơ người bán"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleToggleMute}
                            className="text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <BellOff className="mr-2 h-4 w-4" />
                            {isMuted ? "Bật" : "Tắt"} thông báo
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleArchiveChat}
                            className="text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Lưu trữ trò chuyện
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-200" />
                          <DropdownMenuItem
                            onClick={handleClearChat}
                            className="text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa trò chuyện
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleBlockSeller}
                            className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {userType?.toUpperCase() === "SELLER" ? "Chặn người mua" : "Chặn người bán"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleReportConversation}
                            className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                          >
                            <Flag className="mr-2 h-4 w-4" />
                            Báo cáo cuộc trò chuyện
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                </div>

                {/* Messages Area */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoadingMessages ? (
                    <div className="text-center text-gray-400 text-sm py-8">
                      Đang tải tin nhắn...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">
                      Chưa có tin nhắn. Hãy gửi lời chào!
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex group ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex gap-2 max-w-[70%] ${
                            message.sender === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            {message.sender === "user" ? (
                              userAvatar && <AvatarImage src={userAvatar} className="object-cover" />
                            ) : (
                              activeConversation.avatarUrl && <AvatarImage src={activeConversation.avatarUrl} className="object-cover" />
                            )}
                            <AvatarFallback
                              className={
                                message.sender === "user"
                                  ? "bg-blue-600 text-white text-xs"
                                  : "bg-blue-600 text-white text-xs"
                              }
                            >
                              {message.sender === "user" ? "ME" : activeConversation.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="relative">
                            <div
                              className={`rounded-2xl p-3 ${
                                message.sender === "user"
                                  ? "bg-blue-600 rounded-tr-sm"
                                  : "bg-gray-100 rounded-tl-sm"
                              }`}
                            >
                              {message.attachmentType === "image" && message.attachmentUrl ? (
                                <div
                                  className="mt-2 rounded-lg overflow-hidden border border-gray-100 cursor-pointer group relative"
                                  onClick={() => openPreview(message.attachmentUrl)}
                                >
                                  <img
                                    src={message.attachmentUrl}
                                    alt="Sent"
                                    className="max-w-full h-auto max-h-64 object-contain transition-transform duration-500 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="bg-white/90 p-1.5 rounded-full shadow-lg">
                                      <Maximize2 className="h-4 w-4 text-gray-900" />
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                              {message.text && message.text !== "📷 Hình ảnh" && (
                                <p className={`text-sm ${message.sender === "user" ? "text-white" : "text-gray-900"}`}>{message.text}</p>
                              )}
                            </div>
                            {/* Delete button - only for current user's messages */}
                            {message.sender === "user" && !message.id.startsWith("temp-") && (
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="absolute -top-2 -left-6 opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 bg-red-600/80 rounded-full flex items-center justify-center hover:bg-red-600"
                                title="Xóa tin nhắn"
                              >
                                <Trash2 className="h-3 w-3 text-white" />
                              </button>
                            )}
                            <div
                              className={`flex items-center gap-2 mt-1 ${
                                message.sender === "user" ? "justify-end" : "justify-start"
                              }`}
                            >
                              <p className="text-xs text-gray-400">{message.timestamp}</p>
                              {message.sender === "user" && message.status && (
                                <span className="text-xs text-gray-400">
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
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {activeConversation.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="flex flex-wrap gap-2">
                        {EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="text-xl hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:bg-gray-100 flex-shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                    >
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Nhập tin nhắn..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="flex-1 bg-gray-50 border-gray-200 text-gray-900"
                      disabled={isSending || isUploadingImage}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`text-gray-600 hover:bg-gray-100 flex-shrink-0 ${showEmojiPicker ? "bg-gray-100" : ""}`}
                      onClick={() => setShowEmojiPicker((v) => !v)}
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                      disabled={!newMessage.trim() || isSending || isUploadingImage}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* No conversation selected */
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg">Chọn cuộc trò chuyện để bắt đầu nhắn tin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voice Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Cuộc gọi thoại</DialogTitle>
            <DialogDescription className="text-gray-500">
              Đang gọi {activeConversation?.name}...
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-8 gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-blue-600 text-white text-2xl">
                {activeConversation?.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-gray-900 text-xl mb-2">{activeConversation?.name}</p>
              <p className="text-gray-500 text-sm">Đang đổ chuông...</p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  setShowCallDialog(false);
                  toast.info("Cuộc gọi kết thúc");
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
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Cuộc gọi video</DialogTitle>
            <DialogDescription className="text-gray-500">
              Bắt đầu cuộc gọi video với {activeConversation?.name}...
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-8 gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-blue-600 text-white text-2xl">
                {activeConversation?.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-gray-900 text-xl mb-2">{activeConversation?.name}</p>
              <p className="text-gray-500 text-sm">Đang kết nối...</p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  setShowVideoDialog(false);
                  toast.info("Cuộc gọi video kết thúc");
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
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Xóa lịch sử trò chuyện?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Thao tác này sẽ xóa vĩnh viễn tất cả tin nhắn với {activeConversation?.name}. Không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearChat}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xóa trò chuyện
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
