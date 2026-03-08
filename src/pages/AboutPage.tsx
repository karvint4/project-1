import AppNavbar from "@/components/AppNavbar";
import { Building2, ShieldCheck, MessageSquare, Eye } from "lucide-react";

const features = [
  { icon: Building2, title: "Community-First", desc: "Built for apartment communities to resolve issues together." },
  { icon: ShieldCheck, title: "Secure & Private", desc: "Your data stays within your apartment server. Role-based access control." },
  { icon: MessageSquare, title: "Real-Time Chat", desc: "Stay connected with neighbors and admins through community chat." },
  { icon: Eye, title: "Transparent Tracking", desc: "Track every issue from submission to completion with full visibility." },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-3">About CommunityFix</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A modern platform for apartment communities to report, track, and resolve maintenance issues with complete transparency.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-card rounded-2xl shadow-card border border-border p-6 hover:shadow-soft transition-shadow duration-300">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
