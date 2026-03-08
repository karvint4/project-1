import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

const initialMessages: Message[] = [
  { id: "1", sender: "Priya Patel", text: "Hi everyone! Welcome to Sunrise Heights community chat.", timestamp: "10:00 AM", isOwn: false },
  { id: "2", sender: "Rahul Sharma", text: "Thanks Priya! Great to be connected.", timestamp: "10:05 AM", isOwn: false },
  { id: "3", sender: "Anita Desai", text: "Has anyone noticed the elevator noise? I reported it already.", timestamp: "10:12 AM", isOwn: false },
  { id: "4", sender: "Vikram Singh", text: "Yes, I heard it too. Hopefully it gets fixed soon.", timestamp: "10:15 AM", isOwn: false },
];

const ChatPanel = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || !user) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: user.name,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[500px] bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      <div className="px-5 py-3 border-b border-border gradient-subtle">
        <h3 className="font-semibold text-foreground">Community Chat</h3>
        <p className="text-xs text-muted-foreground">Sunrise Heights</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isOwn ? "items-end" : "items-start"}`}>
            <span className="text-[10px] text-muted-foreground mb-0.5">{msg.sender}</span>
            <div
              className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                msg.isOwn
                  ? "gradient-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-secondary-foreground rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-border flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="rounded-xl"
        />
        <Button onClick={handleSend} size="icon" className="rounded-xl gradient-primary text-primary-foreground shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatPanel;
