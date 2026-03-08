import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import { Building2, MessageSquare, Wrench, Info, LayoutDashboard } from "lucide-react";

const AppNavbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const isWorker = user.role === "worker";
  const basePath = isAdmin ? "/admin" : isWorker ? "/worker" : "/home";

  const navItems = isAdmin
    ? [
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { to: "/admin/problems", label: "Issues", icon: Wrench },
        { to: "/admin/chat", label: "Chat", icon: MessageSquare },
      ]
    : isWorker
    ? [
        { to: "/worker", label: "Home", icon: LayoutDashboard },
      ]
    : [
        { to: "/home", label: "Home", icon: LayoutDashboard },
        { to: "/home/problems", label: "Problems", icon: Wrench },
        { to: "/home/chat", label: "Chat", icon: MessageSquare },
        { to: "/about", label: "About", icon: Info },
      ];

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={basePath} className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-foreground">CommunityFix</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <ProfileDropdown />
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center justify-around border-t border-border py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AppNavbar;
