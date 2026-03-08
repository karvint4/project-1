import AppNavbar from "@/components/AppNavbar";
import ChatPanel from "@/components/ChatPanel";

const ChatPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-6">Community Chat</h1>
        <ChatPanel />
      </main>
    </div>
  );
};

export default ChatPage;
