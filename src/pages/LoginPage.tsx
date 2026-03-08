import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ShieldCheck, User } from "lucide-react";
import communityImg from "@/assets/community-illustration.png";

const LoginPage = () => {
  const [role, setRole] = useState<UserRole>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    const success = login(email, password, role);
    if (success) {
      navigate(role === "admin" ? "/admin" : role === "worker" ? "/worker" : "/home");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-elevated bg-card animate-fade-in">
        {/* Left: Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center gradient-primary p-10">
          <img src={communityImg} alt="Community illustration" className="w-72 h-72 object-contain mb-6" />
          <h2 className="text-2xl font-semibold text-primary-foreground text-center">
            Your Apartment Community
          </h2>
          <p className="text-primary-foreground/80 text-center mt-2 text-sm">
            Report issues, track progress, and stay connected with your neighbors.
          </p>
        </div>

        {/* Right: Login form */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">CommunityFix</h1>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setRole("user")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                role === "user"
                  ? "gradient-primary text-primary-foreground shadow-soft"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              <User className="h-4 w-4" />
              Resident
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                role === "admin"
                  ? "gradient-primary text-primary-foreground shadow-soft"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </button>
            <button
              onClick={() => setRole("worker")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                role === "worker"
                  ? "gradient-primary text-primary-foreground shadow-soft"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              <User className="h-4 w-4" />
              Worker
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@apartment.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="mt-1.5 rounded-xl"
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button type="submit" className="w-full rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-opacity h-11">
              Sign In as {role === "admin" ? "Admin" : role === "worker" ? "Worker" : "Resident"}
            </Button>

            <div className="text-center space-y-2 pt-2">
              <button type="button" className="text-sm text-primary hover:underline">Forgot password?</button>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">Sign Up</Link>
              </p>
            </div>
          </form>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Demo: user@demo.com / demo123 or admin@demo.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
