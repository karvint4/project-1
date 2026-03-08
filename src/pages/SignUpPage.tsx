import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, ShieldCheck, User } from "lucide-react";
import communityImg from "@/assets/community-illustration.png";

const SignUpPage = () => {
  const [role, setRole] = useState<UserRole>("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [workerRole, setWorkerRole] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !mobile) {
      setError("Please fill in all required fields");
      return;
    }
    if (role === "worker" && !workerRole) {
      setError("Please select your worker role");
      return;
    }
    const success = signup(name, email, password, mobile, role);
    if (success) {
      navigate(role === "admin" ? "/admin" : role === "worker" ? "/worker" : "/home");
    } else {
      setError("Email already exists");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-elevated bg-card animate-fade-in">
        <div className="hidden md:flex flex-col items-center justify-center gradient-primary p-10">
          <img src={communityImg} alt="Community illustration" className="w-72 h-72 object-contain mb-6" />
          <h2 className="text-2xl font-semibold text-primary-foreground text-center">
            Join Your Community
          </h2>
          <p className="text-primary-foreground/80 text-center mt-2 text-sm">
            Create an account to start reporting and tracking issues.
          </p>
        </div>

        <div className="p-8 md:p-10 flex flex-col justify-center max-h-screen overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Sign Up</h1>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                className="mt-1.5 rounded-xl"
              />
            </div>
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
            <div>
              <Label htmlFor="mobile" className="text-sm font-medium">Mobile</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="+91 98765 43210"
                value={mobile}
                onChange={(e) => { setMobile(e.target.value); setError(""); }}
                className="mt-1.5 rounded-xl"
              />
            </div>
            {role === "worker" && (
              <div>
                <Label htmlFor="workerRole" className="text-sm font-medium">Worker Role</Label>
                <Select value={workerRole} onValueChange={setWorkerRole}>
                  <SelectTrigger className="mt-1.5 rounded-xl">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumber">Plumber</SelectItem>
                    <SelectItem value="electrician">Electrician</SelectItem>
                    <SelectItem value="carpenter">Carpenter</SelectItem>
                    <SelectItem value="painter">Painter</SelectItem>
                    <SelectItem value="cleaner">Cleaner</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button type="submit" className="w-full rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-opacity h-11">
              Create Account
            </Button>

            <p className="text-sm text-muted-foreground text-center pt-2">
              Already have an account?{" "}
              <Link to="/" className="text-primary hover:underline font-medium">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
