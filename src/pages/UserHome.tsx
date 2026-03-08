import { Link } from "react-router-dom";
import { useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import { problemCategories } from "@/data/problemCategories";
import { mockProblems } from "@/data/mockProblems";
import ProblemCard from "@/components/ProblemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, Plus, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const UserHome = () => {
  const { joinApartmentByCode, user, getApartmentServers, getUserIssues, getUserJoinRequestStatus } = useAuth();
  const { toast } = useToast();
  const [apartmentCode, setApartmentCode] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  
  const currentServer = user?.apartmentServerId 
    ? getApartmentServers().find(s => s.id === user.apartmentServerId)
    : null;

  const pendingRequest = getUserJoinRequestStatus(user?.id || '');

  const adminUser = currentServer
    ? { name: currentServer.adminName, id: currentServer.adminId }
    : null;

  const myIssues = getUserIssues(user?.id || '').slice(0, 3);

  const handleJoinApartment = (e: React.FormEvent) => {
    e.preventDefault();
    const code = apartmentCode.trim();
    if (!code) {
      toast({ title: "Error", description: "Please enter an apartment code", variant: "destructive" });
      return;
    }
    if (!roomNumber.trim() || !floorNumber.trim()) {
      toast({ title: "Error", description: "Please enter room and floor number", variant: "destructive" });
      return;
    }
    
    console.log('Attempting to join with code:', code);
    const success = joinApartmentByCode(code, roomNumber.trim(), floorNumber.trim());
    if (success) {
      toast({ title: "Request Sent! 🎉", description: "Waiting for admin approval" });
      setShowJoinDialog(false);
      setApartmentCode("");
      setRoomNumber("");
      setFloorNumber("");
      window.location.reload();
    } else {
      toast({ title: "Error", description: "Invalid apartment code. Please check and try again.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10 animate-fade-in">
        {/* Welcome */}
        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back! 👋</h1>
            {user?.apartmentServerId && currentServer ? (
              <div className="mt-2 space-y-1">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{currentServer.name}</span> Community
                </p>
                <p className="text-sm text-muted-foreground">
                  Admin: <span className="font-medium">{adminUser?.name || currentServer.adminId}</span>
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground mt-1">
                Report and track apartment issues easily.
              </p>
            )}
          </div>
          
          {!user?.apartmentServerId && !pendingRequest && (
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogTrigger asChild>
                <Button className="rounded-xl gradient-primary text-primary-foreground gap-2">
                  <Plus className="h-4 w-4" /> Join Apartment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Join Apartment Community
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleJoinApartment} className="space-y-4">
                  <div>
                    <Label htmlFor="apartmentCode" className="text-sm font-medium">
                      Apartment Code
                    </Label>
                    <Input
                      id="apartmentCode"
                      type="text"
                      placeholder="Paste code here"
                      value={apartmentCode}
                      onChange={(e) => setApartmentCode(e.target.value)}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData('text').trim();
                        setApartmentCode(pastedText);
                      }}
                      className="mt-1.5 rounded-xl font-mono"
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Get this code from your apartment admin
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="roomNumber" className="text-sm font-medium">Room No.</Label>
                      <Input
                        id="roomNumber"
                        type="text"
                        placeholder="304"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="mt-1.5 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="floorNumber" className="text-sm font-medium">Floor No.</Label>
                      <Input
                        id="floorNumber"
                        type="text"
                        placeholder="3"
                        value={floorNumber}
                        onChange={(e) => setFloorNumber(e.target.value)}
                        className="mt-1.5 rounded-xl"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full rounded-xl gradient-primary text-primary-foreground">
                    Join Community
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
          
          {pendingRequest && (
            <div className="bg-warning/10 border border-warning/20 rounded-xl px-4 py-2">
              <p className="text-sm font-medium text-warning">Request Sent</p>
              <p className="text-xs text-muted-foreground">Waiting for admin approval</p>
            </div>
          )}
        </section>

        {/* Quick Issue Categories */}
        {user?.apartmentServerId && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Report an Issue</h2>
              <Link to="/home/problems/new" className="text-sm text-primary flex items-center gap-1 hover:underline">
                New Issue <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {problemCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    to={`/home/problems/new?category=${cat.id}`}
                    className="bg-card rounded-2xl shadow-card border border-border p-4 flex flex-col items-center gap-2 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Icon className={`h-5 w-5 ${cat.color}`} />
                    </div>
                    <span className="text-xs font-medium text-foreground text-center">{cat.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* My Issues */}
        {user?.apartmentServerId && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">My Issues</h2>
              <Link to="/home/problems" className="text-sm text-primary flex items-center gap-1 hover:underline">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {myIssues.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {myIssues.map((p) => (
                  <ProblemCard key={p.id} problem={p} />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
                <p className="text-muted-foreground">You haven't reported any issues yet</p>
                <Link to="/home/problems/new">
                  <Button className="mt-4 rounded-xl gradient-primary text-primary-foreground gap-2">
                    <Plus className="h-4 w-4" /> Report First Issue
                  </Button>
                </Link>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default UserHome;
