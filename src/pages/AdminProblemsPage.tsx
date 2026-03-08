import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import PaymentRequestDialog from "@/components/PaymentRequestDialog";
import { problemCategories } from "@/data/problemCategories";
import StatusTracker from "@/components/StatusTracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, CheckCircle2, Play, Star, User, Calendar, X, Check, UserPlus, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type ProblemStatus = "waiting" | "read" | "accepted" | "rejected" | "started" | "in_progress" | "completed" | "verified";
const statusOrder: ProblemStatus[] = ["waiting", "read", "accepted", "started", "in_progress", "completed", "verified"];

const AdminProblemsPage = () => {
  const { toast } = useToast();
  const { user, getApartmentServers, getAllIssues, updateIssueStatus, getWorkersByRole, assignWorkerToIssue, markPaymentComplete } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedServer, setSelectedServer] = useState<string>("all");
  const [showWorkerDialog, setShowWorkerDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const statusFilter = searchParams.get('status');

  const servers = getApartmentServers().filter(s => s.adminId === user?.id);
  const allIssues = getAllIssues();
  const workerServer = servers.find(s => s.serverType === "worker");
  const workersByRole = workerServer ? getWorkersByRole(workerServer.id) : {};

  const completedCommonIssues = allIssues.filter(i => i.status === "completed" && i.scope === "common" && !i.paymentCompleted && (selectedServer === "all" || i.serverId === selectedServer));
  const paymentPendingIssues = allIssues.filter(i => i.paymentSent && !i.paymentCompleted && i.scope === "common" && (selectedServer === "all" || i.serverId === selectedServer));
  const fullyCompletedIssues = allIssues.filter(i => i.paymentCompleted && (selectedServer === "all" || i.serverId === selectedServer));

  const activeIssues = allIssues.filter(i => !i.paymentCompleted);

  const filteredProblems = activeIssues.filter(p => {
    const serverMatch = selectedServer === "all" || p.serverId === selectedServer;
    if (!statusFilter) return serverMatch;
    
    if (statusFilter === 'open') {
      return serverMatch && !['completed'].includes(p.status);
    }
    if (statusFilter === 'resolved') {
      return serverMatch && p.status === 'completed';
    }
    if (statusFilter === 'pending') {
      return serverMatch && p.status === 'waiting';
    }
    return serverMatch;
  });

  const advanceStatus = (id: string, currentStatus: ProblemStatus) => {
    if (currentStatus === "accepted") {
      const issue = allIssues.find(i => i.id === id);
      setSelectedIssue(issue);
      setShowWorkerDialog(true);
      return;
    }
    const currentIdx = statusOrder.indexOf(currentStatus);
    if (currentIdx >= statusOrder.length - 1) return;
    const newStatus = statusOrder[currentIdx + 1];
    updateIssueStatus(id, newStatus);
    toast({ title: `Status Updated`, description: `Issue marked as "${newStatus.replace("-", " ")}"` });
  };

  const handleAssignWorker = (workerId: string) => {
    if (selectedIssue) {
      assignWorkerToIssue(selectedIssue.id, workerId);
      setShowWorkerDialog(false);
      setSelectedIssue(null);
      toast({ title: "Worker Assigned", description: "Work started and assigned to worker" });
    }
  };

  const handleAccept = (id: string) => {
    updateIssueStatus(id, "accepted");
    toast({ title: "Issue Accepted", description: "Issue has been accepted" });
  };

  const handleReject = (id: string) => {
    updateIssueStatus(id, "rejected");
    toast({ title: "Issue Rejected", description: "Issue has been rejected" });
  };

  const handlePayNow = () => {
    if (selectedPayment) {
      markPaymentComplete(selectedPayment.id);
      toast({ title: "Payment Completed", description: "Work fully completed and saved" });
      setShowPaymentDialog(false);
      setSelectedPayment(null);
    }
  };

  const getNextLabel = (status: ProblemStatus) => {
    if (status === 'pending') return null;
    if (status === 'read') return null;
    if (status === 'accepted') return 'Start Work';
    if (status === 'start-work') return 'Assign Worker';
    if (status === 'in-progress') return 'Complete';
    if (status === 'rejected') return null;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Issue Management</h1>
          {servers.length > 0 && (
            <Tabs value={selectedServer} onValueChange={setSelectedServer} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All Servers</TabsTrigger>
                {servers.map(s => (
                  <TabsTrigger key={s.id} value={s.id}>{s.name}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>

        {statusFilter && (
          <div className="mb-4 p-3 bg-primary/10 rounded-xl">
            <p className="text-sm text-foreground">
              Showing: <span className="font-semibold capitalize">{statusFilter}</span> issues
            </p>
          </div>
        )}

        <div className="space-y-4">
          {paymentPendingIssues.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment Requests (Common Issues)</h2>
              <div className="space-y-4">
                {paymentPendingIssues.map((issue) => {
                  const cat = problemCategories.find(c => c.id === issue.category);
                  const Icon = cat?.icon;
                  
                  return (
                    <div key={issue.id} className="bg-card rounded-2xl shadow-card border border-border p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {Icon && <Icon className={`h-5 w-5 ${cat?.color}`} />}
                          <div>
                            <h3 className="font-semibold text-foreground">{cat?.label}</h3>
                            <p className="text-xs text-muted-foreground">{issue.description}</p>
                          </div>
                        </div>
                        <Badge className="bg-orange-500">Payment Pending</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-foreground">₹{issue.paymentDetails?.amount}</p>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(issue);
                            setShowPaymentDialog(true);
                          }}
                          className="rounded-lg gradient-primary text-primary-foreground"
                        >
                          <CreditCard className="h-4 w-4 mr-2" /> Pay Now
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {completedCommonIssues.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Verify Completed Work (Common Issues)</h2>
              <div className="space-y-4">
                {completedCommonIssues.map((issue) => {
                  const cat = problemCategories.find(c => c.id === issue.category);
                  const Icon = cat?.icon;
                  
                  return (
                    <div key={issue.id} className="bg-card rounded-2xl shadow-card border border-border p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {Icon && <Icon className={`h-5 w-5 ${cat?.color}`} />}
                          <div>
                            <h3 className="font-semibold text-foreground">{cat?.label}</h3>
                            <p className="text-xs text-muted-foreground">{issue.description}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500">Completed</Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => updateIssueStatus(issue.id, "verified")}
                        className="w-full rounded-lg bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Verify Completion
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {fullyCompletedIssues.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Completed Work</h2>
              <div className="space-y-4">
                {fullyCompletedIssues.map((issue) => {
                  const cat = problemCategories.find(c => c.id === issue.category);
                  const Icon = cat?.icon;
                  
                  return (
                    <div key={issue.id} className="bg-card rounded-2xl shadow-card border border-border p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {Icon && <Icon className={`h-5 w-5 ${cat?.color}`} />}
                          <div>
                            <h3 className="font-semibold text-foreground">{cat?.label}</h3>
                            <p className="text-xs text-muted-foreground">{issue.description}</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-500">Fully Completed</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">All Issues</h2>
        <div className="space-y-4">
          {filteredProblems.map((p) => {
            const cat = problemCategories.find((c) => c.id === p.category);
            const Icon = cat?.icon;
            const nextLabel = getNextLabel(p.status);

            return (
              <div key={p.id} className="bg-card rounded-2xl shadow-card border border-border p-5 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className={`h-5 w-5 ${cat?.color}`} />}
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{cat?.label}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <User className="h-3 w-3" /> {p.createdByName}
                        <span>•</span>
                        <Calendar className="h-3 w-3" /> {p.createdAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.scope === "common" ? "secondary" : "outline"} className="rounded-lg text-xs capitalize">
                      {p.scope}
                    </Badge>
                    {p.status === "waiting" && (
                      <Button
                        size="sm"
                        onClick={() => updateIssueStatus(p.id, "read")}
                        className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs gap-1"
                      >
                        <Eye className="h-3 w-3" /> Mark as Read
                      </Button>
                    )}
                    {p.status === "read" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAccept(p.id)}
                          className="rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs gap-1"
                        >
                          <Check className="h-3 w-3" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(p.id)}
                          className="rounded-lg text-xs gap-1"
                        >
                          <X className="h-3 w-3" /> Reject
                        </Button>
                      </>
                    )}
                    {p.status === "accepted" && (
                      <Button
                        size="sm"
                        onClick={() => advanceStatus(p.id, p.status)}
                        className="rounded-lg gradient-primary text-primary-foreground text-xs gap-1"
                      >
                        <UserPlus className="h-3 w-3" /> Assign Worker
                      </Button>
                    )}
                    {p.status === "started" && (
                      <Button
                        size="sm"
                        onClick={() => updateIssueStatus(p.id, "in_progress")}
                        className="rounded-lg gradient-primary text-primary-foreground text-xs gap-1"
                      >
                        <Play className="h-3 w-3" /> In Progress
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-foreground/80">{p.description}</p>

                <StatusTracker currentStatus={p.status} isPaymentCompleted={p.paymentCompleted} />

                {p.status === "completed" && p.rating && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Rating:</span>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < p.rating! ? "text-warning fill-warning" : "text-muted"}`} />
                    ))}
                    {p.feedback && <span className="ml-2 italic">"{p.feedback}"</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Worker Assignment Dialog */}
        <Dialog open={showWorkerDialog} onOpenChange={setShowWorkerDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Worker</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(() => {
                if (!selectedIssue) return null;
                
                const issueCategory = selectedIssue.category;
                let requiredRole = "";
                
                if (issueCategory === "water") requiredRole = "plumber";
                else if (issueCategory === "electricity") requiredRole = "electrician";
                else if (issueCategory === "maintenance") requiredRole = "carpenter";
                else if (issueCategory === "cleaning") requiredRole = "cleaner";
                else if (issueCategory === "security") requiredRole = "security";
                
                const availableWorkers = workersByRole[requiredRole] || [];
                const assignedWorkerIds = allIssues
                  .filter(i => i.status === "started" || i.status === "in_progress")
                  .map(i => i.assignedWorkerId)
                  .filter(Boolean);
                
                const unassignedWorkers = availableWorkers.filter(w => !assignedWorkerIds.includes(w.id));
                
                if (unassignedWorkers.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {availableWorkers.length === 0 
                          ? `No ${requiredRole}s available. Add workers to the worker server first.`
                          : `All ${requiredRole}s are currently assigned to other tasks.`
                        }
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div>
                    <h3 className="font-semibold capitalize mb-2 text-foreground">{requiredRole}s</h3>
                    <div className="space-y-2">
                      {unassignedWorkers.map((worker, idx) => (
                        <div key={worker.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <div>
                            <p className="font-medium">{worker.name} (Worker {availableWorkers.indexOf(worker) + 1})</p>
                            <p className="text-xs text-muted-foreground">{worker.mobile}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAssignWorker(worker.id)}
                            className="rounded-lg gradient-primary text-primary-foreground"
                          >
                            Assign
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>

        <PaymentRequestDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          paymentDetails={selectedPayment?.paymentDetails}
          onPayNow={handlePayNow}
        />
      </main>
    </div>
  );
};

export default AdminProblemsPage;
