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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Check, Plus, Users, AlertTriangle, CheckCircle2, Eye, Wrench, Zap, Hammer, Sparkles, Shield, MoreHorizontal, UserPlus, X, Edit } from "lucide-react";
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
  const { createApartmentServer, user, getApartmentServers, getServerMembers, deleteApartmentServer, getAllIssues, getPendingJoinRequests, acceptJoinRequest, rejectJoinRequest, updateUserFamilyMembers } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [aptName, setAptName] = useState("");
  const [aptAddress, setAptAddress] = useState("");
  const [aptDesc, setAptDesc] = useState("");
  const [server, setServer] = useState<any>(null);
  const [workerServer, setWorkerServer] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showServerInfo, setShowServerInfo] = useState(false);
  const [showWorkerServerInfo, setShowWorkerServerInfo] = useState(false);
  const [copiedWorkerCode, setCopiedWorkerCode] = useState(false);
  const [workerMembers, setWorkerMembers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [workerPendingRequests, setWorkerPendingRequests] = useState<any[]>([]);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<{name: string; age: string; mobile: string}[]>([]);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

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
      const requests = getPendingJoinRequests(adminUserServer.id);
      setPendingRequests(requests);
    }
    
    if (adminWorkerServer) {
      setWorkerServer(adminWorkerServer);
      const wMembers = getServerMembers(adminWorkerServer.id).filter(m => m.role === "worker");
      setWorkerMembers(wMembers);
      const wRequests = getPendingJoinRequests(adminWorkerServer.id);
      setWorkerPendingRequests(wRequests);
    }
  }, [user, getApartmentServers, getServerMembers, getPendingJoinRequests]);

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
      const requests = getPendingJoinRequests(server.id);
      setPendingRequests(requests);
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    acceptJoinRequest(requestId);
    toast({ title: "Request Accepted", description: "User has been added to the server" });
    handleRefreshMembers();
  };

  const handleRejectRequest = (requestId: string) => {
    rejectJoinRequest(requestId);
    toast({ title: "Request Rejected", description: "Join request has been declined" });
    handleRefreshMembers();
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setFamilyMembers(member.familyMembers || []);
  };

  const handleSaveFamilyMembers = () => {
    if (editingMember) {
      updateUserFamilyMembers(editingMember.id, familyMembers);
      toast({ title: "Updated", description: "Family members updated successfully" });
      setEditingMember(null);
      handleRefreshMembers();
    }
  };

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { name: "", age: "", mobile: "" }]);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const updateFamilyMember = (index: number, field: 'name' | 'age' | 'mobile', value: string) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    setFamilyMembers(updated);
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

  const stats = [
    { label: "Total Residents", value: members.length.toString(), icon: Users, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>

        <div className="grid sm:grid-cols-1 gap-4">
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
                <TabsTrigger value="requests">Join Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}</TabsTrigger>
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
              
              <TabsContent value="requests" className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <UserPlus className="h-5 w-5" /> Pending Join Requests ({pendingRequests.length})
                  </h3>
                  {pendingRequests.length > 0 ? (
                    <div className="space-y-2">
                      {pendingRequests.map((request) => (
                        <div key={request.id} className="bg-background p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium text-foreground">{request.userName}</p>
                              <p className="text-xs text-muted-foreground">{request.userEmail}</p>
                              <p className="text-xs text-muted-foreground">{request.userMobile}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-foreground">Room {request.roomNumber || "N/A"}, Floor {request.floorNumber || "N/A"}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleAcceptRequest(request.id)}
                              className="rounded-lg gradient-primary text-primary-foreground flex-1"
                            >
                              <Check className="h-4 w-4 mr-1" /> Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRejectRequest(request.id)}
                              className="rounded-lg flex-1"
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No pending join requests</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="members" className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <h3 className="font-semibold text-foreground mb-3">Residents ({members.length})</h3>
                  {members.length > 0 ? (
                    <div className="space-y-2">
                      {members.map((member, idx) => (
                        <div key={idx} className="bg-background rounded-lg">
                          <div 
                            className="p-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-lg"
                            onClick={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-foreground">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              </div>
                              <div className="text-right flex items-center gap-2">
                                <div>
                                  <p className="text-sm text-foreground">Room {member.roomNumber}, Floor {member.floorNumber}</p>
                                  <p className="text-xs text-muted-foreground">{member.mobile}</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={(e) => { e.stopPropagation(); handleEditMember(member); }} 
                                  className="rounded-lg"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          {expandedMemberId === member.id && (
                            <div className="px-3 pb-3 pt-0">
                              <div className="mt-2 pt-3 border-t border-border">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Family Members:</p>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Age</TableHead>
                                      <TableHead>Mobile</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    <TableRow className="bg-primary/5">
                                      <TableCell className="font-medium">{member.name}</TableCell>
                                      <TableCell>-</TableCell>
                                      <TableCell>{member.mobile}</TableCell>
                                    </TableRow>
                                    {member.familyMembers && member.familyMembers.map((fm: any, i: number) => (
                                      <TableRow key={i}>
                                        <TableCell className="font-medium">{fm.name}</TableCell>
                                        <TableCell>{fm.age}</TableCell>
                                        <TableCell>{fm.mobile}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )}
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
                  <p className="text-sm text-muted-foreground">No issues reported yet</p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {!showCreate && !server && (
            <p className="text-sm text-muted-foreground">Create a server to get started with your apartment community</p>
          )}
        </section>

        <section className="bg-card rounded-2xl shadow-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Wrench className="h-5 w-5" /> Worker Server
            </h2>
            <div className="flex gap-2">
              {workerServer && (
                <Button onClick={() => setShowWorkerServerInfo(!showWorkerServerInfo)} variant="outline" className="rounded-xl gap-2">
                  <Eye className="h-4 w-4" /> {showWorkerServerInfo ? 'Hide' : 'View'} Info
                </Button>
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
                <TabsTrigger value="requests">Join Requests {workerPendingRequests.length > 0 && `(${workerPendingRequests.length})`}</TabsTrigger>
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
              
              <TabsContent value="requests" className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <UserPlus className="h-5 w-5" /> Pending Worker Requests ({workerPendingRequests.length})
                  </h3>
                  {workerPendingRequests.length > 0 ? (
                    <div className="space-y-2">
                      {workerPendingRequests.map((request) => (
                        <div key={request.id} className="bg-background p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium text-foreground">{request.userName}</p>
                              <p className="text-xs text-muted-foreground">{request.userEmail}</p>
                              <p className="text-xs text-muted-foreground">{request.userMobile}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{workerRoleLabels[request.workerRole || "other"]}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => { acceptJoinRequest(request.id); toast({ title: "Worker Accepted" }); }}
                              className="rounded-lg gradient-primary text-primary-foreground flex-1"
                            >
                              <Check className="h-4 w-4 mr-1" /> Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => { rejectJoinRequest(request.id); toast({ title: "Worker Rejected" }); }}
                              className="rounded-lg flex-1"
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No pending worker requests</p>
                  )}
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

        <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Family Members - {editingMember?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {familyMembers.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {familyMembers.map((fm, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Input
                            placeholder="Name"
                            value={fm.name}
                            onChange={(e) => updateFamilyMember(idx, 'name', e.target.value)}
                            className="rounded-xl"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Age"
                            value={fm.age}
                            onChange={(e) => updateFamilyMember(idx, 'age', e.target.value)}
                            className="rounded-xl"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Mobile"
                            value={fm.mobile}
                            onChange={(e) => updateFamilyMember(idx, 'mobile', e.target.value)}
                            className="rounded-xl"
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" onClick={() => removeFamilyMember(idx)} className="rounded-xl">
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <Button onClick={addFamilyMember} variant="outline" className="w-full rounded-xl">
                <Plus className="h-4 w-4 mr-2" /> Add Family Member
              </Button>
              <Button onClick={handleSaveFamilyMembers} className="w-full rounded-xl gradient-primary text-primary-foreground">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminHome;
