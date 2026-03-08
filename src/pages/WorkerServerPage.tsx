import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Users, Wrench, Zap, Hammer, Sparkles, Shield, MoreHorizontal, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const workerRoleIcons: Record<string, any> = {
  plumber: Wrench,
  electrician: Zap,
  carpenter: Hammer,
  cleaner: Sparkles,
  security: Shield,
  pest_control: MoreHorizontal,
  elevator_technician: MoreHorizontal,
  civil_engineer: MoreHorizontal,
  other: MoreHorizontal
};

const workerRoleLabels: Record<string, string> = {
  plumber: "Plumber",
  electrician: "Electrician",
  carpenter: "Carpenter",
  cleaner: "Cleaner",
  security: "Security",
  pest_control: "Pest Control",
  elevator_technician: "Elevator Technician",
  civil_engineer: "Civil Engineer",
  other: "Other"
};

interface WorkerServerPageProps {
  issueToAssign?: any;
}

const WorkerServerPage = ({ issueToAssign }: WorkerServerPageProps) => {
  const { user, getApartmentServers, getServerMembers, getAllIssues } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [workerServer, setWorkerServer] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"assign" | "view">("assign");

  const allIssues = getAllIssues();
  const getWorkerAssignedCount = (workerId: string) => {
    return allIssues.filter(i => i.assignedWorkerId === workerId && (i.status === "started" || i.status === "in_progress")).length;
  };
  const getWorkerCompletedCount = (workerId: string) => {
    return allIssues.filter(i => i.assignedWorkerId === workerId && i.paymentCompleted).length;
  };

  useEffect(() => {
    const servers = getApartmentServers();
    const wServer = servers.find(s => s.serverType === "worker" && s.adminId === user?.id);
    if (wServer) {
      setWorkerServer(wServer);
      const members = getServerMembers(wServer.id);
      setWorkers(members.filter(m => m.role === "worker"));
    }
  }, [user, getApartmentServers, getServerMembers]);

  const handleAssign = (workerId: string, workerName: string) => {
    if (issueToAssign) {
      toast({ title: "Work Assigned!", description: `Assigned to ${workerName}` });
      navigate("/admin/problems");
    }
  };

  const groupedWorkers = workers.reduce((acc, worker) => {
    const role = worker.workerRole || "other";
    if (!acc[role]) acc[role] = [];
    acc[role].push(worker);
    return acc;
  }, {} as Record<string, any[]>);

  if (!workerServer) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Worker Server</h2>
            <p className="text-muted-foreground mb-6">Create a worker server first</p>
            <Button onClick={() => navigate("/admin")} className="rounded-xl gradient-primary text-primary-foreground">
              Go to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (viewMode === "view") {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <main className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Worker Members</h1>
              <p className="text-muted-foreground">{workerServer.name}</p>
            </div>
            <Button onClick={() => setViewMode("assign")} variant="outline" className="rounded-xl">
              Back
            </Button>
          </div>

          {Object.keys(workerRoleLabels).map(role => {
            const roleWorkers = groupedWorkers[role] || [];
            const Icon = workerRoleIcons[role];
            
            if (roleWorkers.length === 0) return null;
            
            return (
              <section key={role} className="bg-card rounded-2xl shadow-card border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{workerRoleLabels[role]}</h2>
                    <p className="text-xs text-muted-foreground">{roleWorkers.length} workers</p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker Details</TableHead>
                      <TableHead className="text-center">Assigned Works</TableHead>
                      <TableHead className="text-center">Completed Works</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roleWorkers.map((worker) => {
                      const assignedCount = getWorkerAssignedCount(worker.id);
                      const completedCount = getWorkerCompletedCount(worker.id);
                      
                      return (
                        <TableRow key={worker.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{worker.name}</p>
                              <p className="text-xs text-muted-foreground">{worker.mobile}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{assignedCount}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-green-500/10 text-green-600">{completedCount}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => navigate("/admin/problems")}
                              className="rounded-lg gradient-primary text-primary-foreground"
                            >
                              <Plus className="h-3 w-3 mr-1" /> Assign Work
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </section>
            );
          })}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Worker Server</h1>
            <p className="text-muted-foreground">{workerServer.name}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setViewMode("view")} variant="outline" className="rounded-xl gap-2">
              <Users className="h-4 w-4" /> View Members
            </Button>
            {issueToAssign && (
              <Badge variant="outline" className="text-sm">
                Assigning: {issueToAssign.title}
              </Badge>
            )}
          </div>
        </div>

        {Object.keys(workerRoleLabels).map(role => {
          const roleWorkers = groupedWorkers[role] || [];
          const Icon = workerRoleIcons[role];
          
          return (
            <section key={role} className="bg-card rounded-2xl shadow-card border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{workerRoleLabels[role]}</h2>
                  <p className="text-xs text-muted-foreground">{roleWorkers.length}/5 workers</p>
                </div>
              </div>

              {roleWorkers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No workers in this role yet</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {roleWorkers.map((worker) => {
                    const assignedCount = getWorkerAssignedCount(worker.id);
                    return (
                      <div key={worker.id} className="bg-secondary/50 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-foreground">{worker.name}</p>
                            <p className="text-xs text-muted-foreground">{worker.mobile}</p>
                          </div>
                          {issueToAssign && (
                            <Button 
                              size="sm" 
                              onClick={() => handleAssign(worker.id, worker.name)}
                              className="rounded-lg gradient-primary text-primary-foreground"
                            >
                              Assign
                            </Button>
                          )}
                        </div>
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            Assigned Work: <span className="font-semibold text-foreground">{assignedCount}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default WorkerServerPage;
