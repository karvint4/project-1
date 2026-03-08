import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Building2, CheckCircle2, XCircle } from "lucide-react";
import communityImg from "@/assets/community-illustration.png";

const JoinApartmentPage = () => {
  const { serverId } = useParams();
  const { getApartmentServers, joinApartmentByCode, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [server, setServer] = useState<any>(null);
  const [joined, setJoined] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!serverId) return;
    
    const servers = getApartmentServers();
    const foundServer = servers.find(s => s.id === serverId);
    
    if (foundServer) {
      setServer(foundServer);
    } else {
      setError("Invalid or expired invite link");
    }
  }, [serverId, getApartmentServers]);

  const handleJoin = () => {
    if (!isAuthenticated) {
      navigate("/signup");
      return;
    }

    if (server && joinApartmentByCode(server.code, "", "")) {
      setPending(true);
    } else {
      setError("Failed to submit join request");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Link</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/")} className="rounded-xl">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-warning mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Request Sent!</h1>
          <p className="text-muted-foreground mb-6">Your join request has been sent to the admin for approval.</p>
          <Button onClick={() => navigate("/home")} className="rounded-xl">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to the Community!</h1>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-elevated p-8 text-center animate-fade-in">
        <img src={communityImg} alt="Community" className="w-32 h-32 mx-auto mb-6" />
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Join Community</h1>
        </div>

        <div className="bg-secondary/50 p-4 rounded-xl mb-6">
          <h2 className="font-semibold text-foreground mb-1">{server.name}</h2>
          <p className="text-sm text-muted-foreground">{server.address}</p>
          {server.description && (
            <p className="text-xs text-muted-foreground mt-2">{server.description}</p>
          )}
        </div>

        {isAuthenticated ? (
          <Button onClick={handleJoin} className="w-full rounded-xl gradient-primary text-primary-foreground">
            Join This Community
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">You need to sign in to join this community</p>
            <Button onClick={() => navigate("/signup")} className="w-full rounded-xl gradient-primary text-primary-foreground">
              Sign Up to Join
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full rounded-xl">
              Already have an account? Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinApartmentPage;