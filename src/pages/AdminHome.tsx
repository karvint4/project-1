import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Plus, Users, AlertTriangle, CheckCircle2, Link as LinkIcon, Eye, Wrench, Zap, Hammer, Sparkles, Shield, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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

const AdminHome = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createApartmentServer, user, getApartmentServers, getServerMembers, deleteApartmentServer, getAllIssues } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [aptName, setAptName] = useState("");
  const [aptAddress, setAptAddress] = useState("");
  const [aptDesc, setAptDesc] = useState("");
  const [server, setServer] = useState<any>(null);
  const [workerServer, setWorkerServer] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showServerInfo, setShowServerInfo] = useState(false);
  const [showWorkerServerInfo, setShowWorkerServerInfo] = useState(false);
  const [copiedWorkerCode, setCopiedWorkerCode] = useState(false);
  const [workerMembers, setWorkerMembers] = useState<any[]>([]);

  const allIssues = getAllIssues();
  const getWorkerAssignedCount = (workerId: string) => {
    return allIssues.filter(i => i.assignedWorkerId === workerId && (i.status === "started" || i.status === "in_progress")).length;
  };
  const getWorkerCompletedCount = (workerId: string) => {
    return allIssues.filter(i => i.assignedWorkerId === workerId && i.paymentCompleted).length;
  };

  useEffect(() => {
    const servers = getApartmentServers();
    const adminUserServer = servers.find(s => s.adminId === user?.id && s.serverType === "user");
    const adminWorkerServer = servers.find(s => s.adminId === user?.id && s.serverType === "worker");
    
    if (adminUserServer) {
      setServer(adminUserServer);
      const serverMembers = getServerMembers(adminUserServer.id);
      setMembers(serverMembers);
    }
    
    if (adminWorkerServer) {
      setWorkerServer(adminWorkerServer);
      const wMembers = getServerMembers(adminWorkerServer.id).filter(m => m.role === "worker");
      setWorkerMembers(wMembers);
    }
  }, [user, getApartmentServers, getServerMembers]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newServer = createApartmentServer(aptName, aptAddress, aptDesc, "user");
    setServer(newServer);
    setShowCreate(false);
    setMembers([]);
    toast({ title: "User Server Created! 🎉", description: "Share the code with your residents." });
  };

  const handleCreateWorkerServer = (e: React.FormEvent) => {
    e.preventDefault();
    const newServer = createApartmentServer(aptName, aptAddress, aptDesc, "worker");
    setWorkerServer(newServer);
    setShowCreate(false);
    toast({ title: "Worker Server Created! 🎉", description: "Share the code with workers." });
  };

  const handleCopyWorkerCode = async () => {
    if (workerServer?.code) {
      try {
        await navigator.clipboard.writeText(workerServer.code);
        setCopiedWorkerCode(true);
        toast({ title: "Copied!", description: `Code: ${workerServer.code}` });
        setTimeout(() => setCopiedWorkerCode(false), 2000);
      } catch (err) {
        toast({ title: "Copy Failed", description: "Please select and copy manually", variant: "destructive" });
      }
    }
  };

  const handleRefreshMembers = () => {
    if (server) {
      const serverMembers = getServerMembers(server.id);
      setMembers(serverMembers);
    }
  };

  const handleDeleteServer = () => {
    if (server && window.confirm('Are you sure you want to delete this server?')) {
      deleteApartmentServer(server.id);
      setServer(null);
      setMembers([]);
      toast({ title: "Server Deleted", description: "Apartment server has been removed" });
    }
  };

  const handleCopyCode = async () => {
    if (server?.code) {
      try {
        await navigator.clipboard.writeText(server.code);
        setCopiedCode(true);
        toast({ title: "Copied!", description: `Code: ${server.code}` });
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (err) {
        toast({ title: "Copy Failed", description: "Please select and copy manually", variant: "destructive" });
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(server.link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const stats = [
    { label: "Total Residents", value: members.length.toString(), icon: Users, color: "text-primary" },
    { label: "Open Issues", value: "7", icon: AlertTriangle, color: "text-warning" },
    { label: "Resolved", value: "28", icon: CheckCircle2, color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-card rounded-2xl shadow-card border border-border p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Server */}
        <section className="bg-card rounded-2xl shadow-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">User Server</h2>
            <div className="flex gap-2">
              {server && (
                <>
                  <Button onClick={() => setShowServerInfo(!showServerInfo)} variant="outline" className="rounded-xl gap-2">
                    <Eye className="h-4 w-4" /> {showServerInfo ? 'Hide' : 'View'} Info
                  </Button>
                  <Button onClick={handleRefreshMembers} variant="outline" className="rounded-xl">
                    Refresh
                  </Button>
                  <Button onClick={handleDeleteServer} variant="destructive" className="rounded-xl">
                    Delete
                  </Button>
                </>
              )}
              {!showCreate && (
                <Button onClick={() => setShowCreate(true)} className="rounded-xl gradient-primary text-primary-foreground gap-2">
                  <Plus className="h-4 w-4" /> {server ? 'Create Another' : 'Create Server'}
                </Button>
              )}
            </div>
          </div>

          {showCreate && (
            <form onSubmit={handleCreate} className="space-y-4 max-w-md">
              <div>
                <Label className="text-sm font-medium">Apartment Name</Label>
                <Input value={aptName} onChange={(e) => setAptName(e.target.value)} placeholder="Sunrise Heights" className="mt-1 rounded-xl" required />
              </div>
              <div>
                <Label className="text-sm font-medium">Address</Label>
                <Input value={aptAddress} onChange={(e) => setAptAddress(e.target.value)} placeholder="123 Main St" className="mt-1 rounded-xl" required />
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <Textarea value={aptDesc} onChange={(e) => setAptDesc(e.target.value)} placeholder="Brief description..." className="mt-1 rounded-xl" />
              </div>
              <Button type="submit" className="rounded-xl gradient-primary text-primary-foreground">
                Generate Invite Link
              </Button>
            </form>
          )}

          {server && showServerInfo && (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">Server Details</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <h3 className="font-semibold text-foreground mb-3">Server: {server.name}</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Apartment Code</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={server.code}
                          readOnly
                          onClick={(e) => e.currentTarget.select()}
                          className="bg-background px-3 py-2 rounded-lg text-lg font-mono font-bold text-primary flex-1"
                        />
                        <Button size="icon" variant="ghost" onClick={handleCopyCode}>
                          {copiedCode ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Click to select, then copy</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                      <p className="text-sm text-foreground mt-1">{server.address}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <p className="text-sm text-foreground mt-1">{server.description || 'No description'}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="members" className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <h3 className="font-semibold text-foreground mb-3">Residents ({members.length})</h3>
                  {members.length > 0 ? (
                    <div className="space-y-2">
                      {members.map((member, idx) => (
                        <div key={idx} className="bg-background p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium text-foreground">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-foreground">Room {member.roomNumber}, Floor {member.floorNumber}</p>
                            <p className="text-xs text-muted-foreground">{member.mobile}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No residents have joined yet</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="issues" className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <h3 className="font-semibold text-foreground mb-3">Issues by Server</h3>
                  <div className="space-y-2">
                    <div 
                      className="bg-background p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => navigate('/admin/problems?status=open')}
                    >
                      <p className="text-sm font-medium text-foreground">Open Issues: 7</p>
                      <p className="text-xs text-muted-foreground mt-1">Plumbing (3), Electrical (2), Maintenance (2)</p>
                    </div>
                    <div 
                      className="bg-background p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => navigate('/admin/problems?status=resolved')}
                    >
                      <p className="text-sm font-medium text-foreground">Resolved Issues: 28</p>
                      <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                    </div>
                    <div 
                      className="bg-background p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => navigate('/admin/problems?status=pending')}
                    >
                      <p className="text-sm font-medium text-foreground">Pending Review: 3</p>
                      <p className="text-xs text-muted-foreground mt-1">Awaiting admin approval</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {!showCreate && !server && (
            <p className="text-sm text-muted-foreground">Create a server to get started with your apartment community</p>
          )}
        </section>

        {/* Worker Server */}
        <section className="bg-card rounded-2xl shadow-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Wrench className="h-5 w-5" /> Worker Server
            </h2>
            <div className="flex gap-2">
              {workerServer && (
                <>
                  <Button onClick={() => setShowWorkerServerInfo(!showWorkerServerInfo)} variant="outline" className="rounded-xl gap-2">
                    <Eye className="h-4 w-4" /> {showWorkerServerInfo ? 'Hide' : 'View'} Info
                  </Button>
                </>
              )}
              {!showCreate && (
                <Button onClick={() => setShowCreate(true)} className="rounded-xl gradient-primary text-primary-foreground gap-2">
                  <Plus className="h-4 w-4" /> {workerServer ? 'Create Another' : 'Create Worker Server'}
                </Button>
              )}
            </div>
          </div>

          {showCreate && (
            <form onSubmit={handleCreateWorkerServer} className="space-y-4 max-w-md">
              <div>
                <Label className="text-sm font-medium">Server Name</Label>
                <Input value={aptName} onChange={(e) => setAptName(e.target.value)} placeholder="Worker Hub" className="mt-1 rounded-xl" required />
              </div>
              <div>
                <Label className="text-sm font-medium">Address</Label>
                <Input value={aptAddress} onChange={(e) => setAptAddress(e.target.value)} placeholder="123 Main St" className="mt-1 rounded-xl" required />
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <Textarea value={aptDesc} onChange={(e) => setAptDesc(e.target.value)} placeholder="Brief description..." className="mt-1 rounded-xl" />
              </div>
              <Button type="submit" className="rounded-xl gradient-primary text-primary-foreground">
                Generate Worker Code
              </Button>
            </form>
          )}

          {workerServer && showWorkerServerInfo && (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">Server Details</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <h3 className="font-semibold text-foreground mb-3">Worker Server: {workerServer.name}</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Worker Code</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={workerServer.code}
                          readOnly
                          onClick={(e) => e.currentTarget.select()}
                          className="bg-background px-3 py-2 rounded-lg text-lg font-mono font-bold text-primary flex-1"
                        />
                        <Button size="icon" variant="ghost" onClick={handleCopyWorkerCode}>
                          {copiedWorkerCode ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Share this code with workers to join</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="members" className="space-y-4">
                {(() => {
                  const workersByRole = workerMembers.reduce((acc, worker) => {
                    const role = worker.workerRole || "other";
                    if (!acc[role]) acc[role] = [];
                    acc[role].push(worker);
                    return acc;
                  }, {} as Record<string, any[]>);

                  return (
                    <div className="space-y-6">
                      {Object.keys(workerRoleLabels).map(role => {
                        const roleWorkers = workersByRole[role] || [];
                        const Icon = workerRoleIcons[role];
                        
                        if (roleWorkers.length === 0) return null;
                        
                        return (
                          <div key={role} className="bg-secondary/50 p-4 rounded-xl">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">{workerRoleLabels[role]}</h3>
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
                          </div>
                        );
                      })}
                      {workerMembers.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No workers have joined yet</p>
                      )}
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>
          )}

          {!showCreate && !workerServer && (
            <p className="text-sm text-muted-foreground">Create a worker server to manage your service providers</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminHome;
