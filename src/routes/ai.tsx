import { useState, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Paperclip, 
  Send, 
  X, 
  Bot, 
  User,
  Sparkles
} from "lucide-react";

export const Route = createFileRoute("/ai")({
  component: AIPage,
});

// Kiểu dữ liệu Tin nhắn
interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  image?: string; // Lưu base64 preview ảnh
}

// Kiểu dữ liệu Đoạn chat (Chat Session)
interface ChatSession {
  id: string;
  title: string;
  timeGroup: "HÔM NAY" | "TUẦN TRƯỚC";
  messages: Message[];
}

export function AIPage() {
  // 1. Quản lý danh sách các đoạn chat
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Giải thuật QuickSort & C++",
      timeGroup: "HÔM NAY",
      messages: [
        { id: "m1", sender: "user", text: "Bạn hãy tóm tắt giải thuật QuickSort giúp mình nhé!" },
        { id: "m2", sender: "ai", text: "Chào bạn! **QuickSort (Sắp xếp nhanh)** là thuật toán chia để trị dựa trên việc chọn một phần tử làm **chốt (Pivot)** và phân tách dãy số thành 2 phần." }
      ]
    },
    {
      id: "2",
      title: "Tóm tắt văn học: Vợ chồng A Phủ",
      timeGroup: "HÔM NAY",
      messages: []
    },
    {
      id: "3",
      title: "Ma trận nghịch đảo & Đại số tuyến tính",
      timeGroup: "TUẦN TRƯỚC",
      messages: []
    }
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string>("1");
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lấy cuộc hội thoại đang chọn
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // 2. Hàm chuyển đổi File sang dạng Base64 cho Gemini API
  const fileToGenerativePart = async (file: File) => {
    return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
    });
  };

  // 3. Xử lý tải ảnh từ máy tính
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setSelectedImage({ file, preview });
    }
  };

  // 4. Tạo cuộc hội thoại mới
  const handleCreateNewChat = () => {
    const newId = Date.now().toString();
    const newChat: ChatSession = {
      id: newId,
      title: "Cuộc hội thoại mới",
      timeGroup: "HÔM NAY",
      messages: [
        {
          id: Date.now().toString(),
          sender: "ai",
          text: "Xin chào! Mình là **Studia AI Tutor**. Bạn cần giúp đỡ bài tập hay nội dung học tập nào hôm nay?"
        }
      ]
    };

    setSessions([newChat, ...sessions]);
    setActiveSessionId(newId);
  };

  // 5. Gửi tin nhắn & Gọi Gemini API
  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const userText = inputText;
    const currentImg = selectedImage;

    // Reset input
    setInputText("");
    setSelectedImage(null);
    setIsLoading(true);

    // Tạo tin nhắn người dùng
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      image: currentImg?.preview
    };

    // Cập nhật giao diện lập tức
    setSessions(prev => prev.map(session => {
      if (session.id === activeSessionId) {
        // Đổi tên tiêu đề nếu là tin nhắn đầu tiên
        const newTitle = session.messages.length <= 1 && userText ? userText.slice(0, 28) + "..." : session.title;
        return {
          ...session,
          title: newTitle,
          messages: [...session.messages, userMsg]
        };
      }
      return session;
    }));

    try {
      // ĐỌC API KEY TỪ FILE .ENV (VITE_GEMINI_API_KEY) HOẶC DÙNG KEY TẠM
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      
      if (!apiKey) {
        throw new Error("Chưa cấu hình VITE_GEMINI_API_KEY trong file .env!");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
      const promptParts: any[] = [];
      if (userText) promptParts.push(userText);
      if (currentImg) {
        const imgPart = await fileToGenerativePart(currentImg.file);
        promptParts.push(imgPart);
      }

      const result = await model.generateContent(promptParts);
      const responseText = result.response.text();

      // Thêm phản hồi của AI vào giao diện
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: responseText
      };

      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, aiMsg] } : s));
    } catch (error: any) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `⚠️ **Lỗi:** ${error.message || "Không thể kết nối đến Gemini AI. Bạn hãy kiểm tra lại API Key nhé!"}`
      };
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-1 w-full h-[calc(100vh-7rem)] gap-6 animate-[fade-up_0.4s_ease-out]">
        
        {/* ================= CỘT BÊN TRÁI: DANH SÁCH CHAT ================= */}
        <aside className="flex w-72 flex-col justify-between rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="space-y-4">
            
            {/* Nút Tạo cuộc hội thoại mới */}
            <button 
              onClick={handleCreateNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-bold text-white shadow-sm hover:opacity-90 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Cuộc hội thoại mới</span>
            </button>

            {/* Ô tìm kiếm phiên học */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Tìm kiếm phiên học..." 
                className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Danh sách các hội thoại */}
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-22rem)] pr-1">
              
              {/* Nhóm HÔM NAY */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black tracking-wider text-muted-foreground uppercase px-2">
                  Hôm nay
                </span>
                {sessions.filter(s => s.timeGroup === "HÔM NAY").map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                      s.id === activeSessionId 
                        ? "bg-primary/10 text-primary" 
                        : "text-foreground/80 hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </button>
                ))}
              </div>

              {/* Nhóm TUẦN TRƯỚC */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black tracking-wider text-muted-foreground uppercase px-2">
                  Tuần trước
                </span>
                {sessions.filter(s => s.timeGroup === "TUẦN TRƯỚC").map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                      s.id === activeSessionId 
                        ? "bg-primary/10 text-primary" 
                        : "text-foreground/80 hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Bộ nhớ / Thông tin mô hình bên dưới */}
          <div className="rounded-2xl border border-border/60 bg-background p-3 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Gemini Flash 1.5
              </span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Sẵn sàng</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Tối ưu hóa học tập & giải đề</p>
          </div>
        </aside>

        {/* ================= CỘT BÊN PHẢI: KHUNG CHAT AI ================= */}
        <main className="flex flex-1 flex-col justify-between rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm overflow-hidden">
          
          {/* Header Khung Chat */}
          <header className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Studia AI Tutor</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Trực tuyến 24/7
                </p>
              </div>
            </div>
          </header>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2">
            {activeSession.messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Avatar AI */}
                {msg.sender === "ai" && (
                  <div className="rounded-xl bg-primary p-2 text-white h-fit shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                {/* Nội dung tin nhắn */}
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed space-y-2 ${
                  msg.sender === "user" 
                    ? "bg-primary text-white rounded-br-none" 
                    : "bg-background border border-border/80 text-foreground rounded-bl-none shadow-sm"
                }`}>
                  {/* Ảnh gửi kèm (nếu có) */}
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Uploaded preview" 
                      className="max-h-48 rounded-xl object-cover border border-white/20 mb-2"
                    />
                  )}
                  <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                </div>

                {/* Avatar User */}
                {msg.sender === "user" && (
                  <div className="rounded-xl bg-accent p-2 text-foreground h-fit shrink-0 border border-border">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Trạng thái Đang suy nghĩ của AI */}
            {isLoading && (
              <div className="flex gap-3 items-center text-muted-foreground text-xs font-bold animate-pulse">
                <div className="rounded-xl bg-primary p-2 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <span>Studia AI đang suy nghĩ...</span>
              </div>
            )}
          </div>

          {/* Thanh nhập tin nhắn */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            
            {/* Thẻ xem trước Ảnh đã chọn */}
            {selectedImage && (
              <div className="relative inline-block">
                <img 
                  src={selectedImage.preview} 
                  alt="Selected" 
                  className="h-16 w-16 rounded-xl object-cover border border-border shadow-sm"
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-white shadow hover:opacity-90"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background p-2 focus-within:ring-2 focus-within:ring-primary/20 transition">
              
              {/* Input đính kèm file/ảnh ẩn */}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
              />

              {/* Nút đính kèm ảnh */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition"
                title="Đính kèm ảnh bài tập"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              {/* Ô nhập chữ */}
              <input 
                type="text"
                placeholder="Nhập câu hỏi học tập, dán đề bài hoặc đính kèm ảnh..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground"
              />

              {/* Nút gửi */}
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || (!inputText.trim() && !selectedImage)}
                className="rounded-xl bg-primary p-2.5 text-white shadow hover:opacity-90 transition disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>

            </div>
            <p className="text-[10px] text-center text-muted-foreground">
              Nhấn Enter để gửi tin nhắn. Studia AI hỗ trợ đọc đề qua ảnh và giải bài tập.
            </p>
          </div>

        </main>
      </div>
    </AppShell>
  );
}