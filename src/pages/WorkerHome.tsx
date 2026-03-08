import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PaymentProfileDialog from "@/components/PaymentProfileDialog";
import PaymentDetailsDialog from "@/components/PaymentDetailsDialog";
import { problemCategories } from "@/data/problemCategories";
import { CheckCircle2, Clock, Plus, Wallet, Send, X, Check, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const WorkerHome = () => {
  const { user, getAllIssues, joinWorkerServerByCode, updateIssueStatus, savePaymentProfile, getPaymentProfile, sendPaymentDetails, getApartmentServers, getServerMembers } = useAuth();
  const { toast } = useToast();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [workerCode, setWorkerCode] = useState("");
  const [selectedWorkerRole, setSelectedWorkerRole] = useState("");
  const [showPaymentProfile, setShowPaymentProfile] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  
  const allIssues = getAllIssues();
  const myIssues = allIssues.filter(issue => issue.assignedWorkerId === user?.id);

  const newAssignments = myIssues.filter(i => i.status === "started" && !i.workerAccepted && !i.workerRejected);
  const acceptedIssues = myIssues.filter(i => i.workerAccepted && i.status !== "completed" && i.status !== "verified" && i.status !== "rejected");
  const completedIssues = myIssues.filter(i => i.status === "completed" || i.status === "verified");
  const verifiedIssues = myIssues.filter(i => i.status === "verified" && !i.paymentSent);
  const paymentProfile = user ? getPaymentProfile(user.id) : null;

  const workerServer = user?.workerServerId ? getApartmentServers().find(s => s.id === user.workerServerId) : null;
  const allWorkers = workerServer ? getServerMembers(workerServer.id).filter(m => m.role === "worker") : [];
  const workersByRole = allWorkers.reduce((acc, worker) => {
    const role = worker.workerRole || "other";
    if (!acc[role]) acc[role] = [];
    acc[role].push(worker);
    return acc;
  }, {} as Record<string, any[]>);

  const handleAcceptWork = (issueId: string) => {
    if (acceptedIssues.length >= 3) {
      toast({ title: "Maximum Limit", description: "You can only accept 3 works at a time", variant: "destructive" });
      return;
    }
    updateIssueStatus(issueId, "in_progress");
    const issue = allIssues.find(i => i.id === issueId);
    if (issue) issue.workerAccepted = true;
    toast({ title: "Work Accepted", description: "Work has been accepted" });
  };

  const handleRejectWork = (issueId: string) => {
    updateIssueStatus(issueId, "rejected");
    const issue = allIssues.find(i => i.id === issueId);
    if (issue) issue.workerRejected = true;
    toast({ title: "Work Rejected", description: "Work has been rejected" });
  };

  const handleCompleteWork = (issueId: string) => {
    updateIssueStatus(issueId, "completed");
    toast({ title: "Work Completed", description: "Waiting for verification" });
  };

  const handleSendPaymentDetails = (issue: any) => {
    if (!paymentProfile) {
      toast({ title: "Setup Required", description: "Please setup your payment profile first", variant: "destructive" });
      setShowPaymentProfile(true);
      return;
    }
    setSelectedIssue(issue);
    setShowPaymentDetails(true);
  };

  const handlePaymentDetailsSubmit = (details: any) => {
    if (selectedIssue && user) {
      sendPaymentDetails(selectedIssue.id, { ...details, workerProfile: paymentProfile });
      toast({ title: "Payment Details Sent", description: "User/Admin will receive payment request" });
      setShowPaymentDetails(false);
      setSelectedIssue(null);
    }
  };

  const handleJoinWorkerServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerCode.trim() || !selectedWorkerRole) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    
    const success = joinWorkerServerByCode(workerCode.trim(), selectedWorkerRole);
    if (success) {
      toast({ title: "Success! 🎉", description: "You've joined the worker server" });
      setShowJoinDialog(false);
      window.location.reload();
    } else {
      toast({ title: "Error", description: "Invalid worker code", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Worker Dashboard</h1>
            {user?.workerServerId ? (
              <p className="text-muted-foreground mt-1">
                Role: <span className="font-semibold capitalize">{user?.workerRole?.replace("_", " ")}</span>
              </p>
            ) : (
              <p className="text-muted-foreground mt-1">Join a worker server to get started</p>
            )}
          </div>
          
          <div className="flex gap-2">
            {user?.workerServerId && (
              <>
                <Button 
                  onClick={() => setShowPaymentProfile(true)}
                  variant="outline"
                  className="rounded-xl gap-2"
                >
                  <Wallet className="h-4 w-4" /> Payment Profile
                </Button>
                <Button 
                  onClick={() => setShowMembersDialog(true)}
                  variant="outline"
                  className="rounded-xl gap-2"
                >
                  <Users className="h-4 w-4" /> View Members
                </Button>
              </>
            )}
            {!user?.workerServerId && (
              <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl gradient-primary text-primary-foreground gap-2">
                    <Plus className="h-4 w-4" /> Join Worker Server
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Join Worker Server</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleJoinWorkerServer} className="space-y-4">
                    <div>
                      <Label htmlFor="workerCode">Worker Code</Label>
                      <Input
                        id="workerCode"
                        value={workerCode}
                        onChange={(e) => setWorkerCode(e.target.value)}
                        className="mt-1.5 rounded-xl"
                        placeholder="Enter code from admin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="workerRole">Your Role</Label>
                      <Select value={selectedWorkerRole} onValueChange={setSelectedWorkerRole}>
                        <SelectTrigger className="mt-1.5 rounded-xl">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plumber">Plumber</SelectItem>
                          <SelectItem value="electrician">Electrician</SelectItem>
                          <SelectItem value="carpenter">Carpenter</SelectItem>
                          <SelectItem value="cleaner">Cleaner</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="pest_control">Pest Control</SelectItem>
                          <SelectItem value="elevator_technician">Elevator Technician</SelectItem>
                          <SelectItem value="civil_engineer">Civil Engineer</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full rounded-xl gradient-primary text-primary-foreground">
                      Join Server
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {user?.workerServerId && (
          <>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-card rounded-2xl shadow-card border border-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{newAssignments.length}</p>
                  <p className="text-xs text-muted-foreground">New Assignments</p>
                </div>
              </div>
              <div className="bg-card rounded-2xl shadow-card border border-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{acceptedIssues.length}/3</p>
                  <p className="text-xs text-muted-foreground">Active Works</p>
                </div>
              </div>
              <div className="bg-card rounded-2xl shadow-card border border-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedIssues.length}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">New Work Assignments</h2>
              {newAssignments.length > 0 ? (
                <div className="space-y-4">
                  {newAssignments.map((issue) => {
                    const cat = problemCategories.find(c => c.id === issue.category);
                    const Icon = cat?.icon;
                    
                    return (
                      <div key={issue.id} className="bg-card rounded-2xl shadow-card border border-border p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {Icon && <Icon className={`h-5 w-5 ${cat?.color}`} />}
                            <div>
                              <h3 className="font-semibold text-foreground">{cat?.label}</h3>
                              <p className="text-xs text-muted-foreground">By: {issue.createdByName}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500">
                            New
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/80 mb-3">{issue.description}</p>
                        {issue.scheduledDate && (
                          <p className="text-xs text-muted-foreground mb-3">
                            Scheduled: {new Date(issue.scheduledDate).toLocaleString()}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptWork(issue.id)}
                            className="flex-1 rounded-lg bg-green-500 hover:bg-green-600 text-white"
                            disabled={acceptedIssues.length >= 3}
                          >
                            <Check className="h-4 w-4 mr-2" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectWork(issue.id)}
                            className="flex-1 rounded-lg"
                          >
                            <X className="h-4 w-4 mr-2" /> Reject
                          </Button>
                        </div>
                        {acceptedIssues.length >= 3 && (
                          <p className="text-xs text-destructive mt-2">Maximum 3 works limit reached</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
                  <p className="text-muted-foreground">No new assignments</p>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Verified Work - Send Payment Details</h2>
              {verifiedIssues.length > 0 ? (
                <div className="space-y-4">
                  {verifiedIssues.map((issue) => {
                    const cat = problemCategories.find(c => c.id === issue.category);
                    const Icon = cat?.icon;
                    
                    return (
                      <div key={issue.id} className="bg-card rounded-2xl shadow-card border border-border p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {Icon && <Icon className={`h-5 w-5 ${cat?.color}`} />}
                            <div>
                              <h3 className="font-semibold text-foreground">{cat?.label}</h3>
                              <p className="text-xs text-muted-foreground">By: {issue.createdByName}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500">
                            Verified
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/80 mb-3">{issue.description}</p>
                        <Button
                          size="sm"
                          onClick={() => handleSendPaymentDetails(issue)}
                          className="w-full rounded-lg gradient-primary text-primary-foreground"
                        >
                          <Send className="h-4 w-4 mr-2" /> Send Payment Details
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
                  <p className="text-muted-foreground">No verified work pending payment</p>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Active Work ({acceptedIssues.length}/3)</h2>
              {acceptedIssues.length > 0 ? (
                <div className="space-y-4">
                  {acceptedIssues.map((issue) => {
                    const cat = problemCategories.find(c => c.id === issue.category);
                    const Icon = cat?.icon;
                    
                    return (
                      <div key={issue.id} className="bg-card rounded-2xl shadow-card border border-border p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {Icon && <Icon className={`h-5 w-5 ${cat?.color}`} />}
                            <div>
                              <h3 className="font-semibold text-foreground">{cat?.label}</h3>
                              <p className="text-xs text-muted-foreground">By: {issue.createdByName}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {issue.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/80 mb-3">{issue.description}</p>
                        {issue.scheduledDate && (
                          <p className="text-xs text-muted-foreground mb-3">
                            Scheduled: {new Date(issue.scheduledDate).toLocaleString()}
                          </p>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleCompleteWork(issue.id)}
                          className="w-full rounded-lg bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Completed
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
                  <p className="text-muted-foreground">No active work</p>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Completed Work</h2>
              {completedIssues.length > 0 ? (
                <div className="space-y-4">
                  {completedIssues.map((issue) => {
                    const cat = problemCategories.find(c => c.id === issue.category);
                    const Icon = cat?.icon;
                    
                    return (
                      <div key={issue.id} className="bg-card rounded-2xl shadow-card border border-border p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {Icon && <Icon className={`h-5 w-5 ${cat?.color}`} />}
                            <div>
                              <h3 className="font-semibold text-foreground">{cat?.label}</h3>
                              <p className="text-xs text-muted-foreground">By: {issue.createdByName}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize bg-green-500/10 text-green-600 border-green-500">
                            {issue.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/80">{issue.description}</p>
                        {issue.paymentCompleted && (
                          <Badge className="mt-3 bg-blue-500">Payment Received</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
                  <p className="text-muted-foreground">No completed work yet</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <PaymentProfileDialog
        open={showPaymentProfile}
        onOpenChange={setShowPaymentProfile}
        onSave={(profile) => {
          if (user) {
            savePaymentProfile(user.id, profile);
            toast({ title: "Profile Saved", description: "Payment profile updated successfully" });
          }
        }}
        currentProfile={paymentProfile}
      />

      <PaymentDetailsDialog
        open={showPaymentDetails}
        onOpenChange={setShowPaymentDetails}
        onSubmit={handlePaymentDetailsSubmit}
      />

      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Worker Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Object.keys(workersByRole).map(role => (
              <div key={role}>
                <h3 className="font-semibold capitalize mb-2 text-foreground">{role.replace("_", " ")}</h3>
                <div className="space-y-2">
                  {workersByRole[role].map((worker: any) => (
                    <div key={worker.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium">{worker.name}</p>
                        <p className="text-xs text-muted-foreground">{worker.mobile}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerHome;
