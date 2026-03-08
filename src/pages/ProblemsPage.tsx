import AppNavbar from "@/components/AppNavbar";
import ProblemCard from "@/components/ProblemCard";
import PaymentRequestDialog from "@/components/PaymentRequestDialog";
import { Link } from "react-router-dom";
import { problemCategories } from "@/data/problemCategories";
import { Plus, CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ProblemsPage = () => {
  const { user, getAllIssues, updateIssueStatus, markPaymentComplete } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const allIssues = getAllIssues();
  const serverProblems = user?.apartmentServerId
    ? allIssues.filter(p => p.serverId === user.apartmentServerId)
    : allIssues;

  const myIssues = serverProblems.filter(p => p.createdBy === user?.id);
  const completedIssues = myIssues.filter(i => i.status === "completed" && i.scope === "personal" && !i.paymentCompleted);
  const paymentPendingIssues = myIssues.filter(i => i.paymentSent && !i.paymentCompleted);
  const fullyCompletedIssues = myIssues.filter(i => i.paymentCompleted);

  const activeIssues = serverProblems.filter(i => !i.paymentCompleted);

  const filteredProblems = selectedCategory === "all"
    ? activeIssues
    : activeIssues.filter(p => p.category === selectedCategory);

  const handlePayNow = () => {
    if (selectedPayment) {
      markPaymentComplete(selectedPayment.id);
      toast({ title: "Payment Completed", description: "Work fully completed and saved" });
      setShowPaymentDialog(false);
      setSelectedPayment(null);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Issues</h1>
            <p className="text-sm text-muted-foreground mt-1">Issues from your apartment community</p>
          </div>
          <Link to="/home/problems/new">
            <Button className="rounded-xl gradient-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" /> Report Issue
            </Button>
          </Link>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === "all" 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            All
          </button>
          {problemCategories.slice(0, 5).map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {paymentPendingIssues.length > 0 && (
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment Requests</h2>
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

          {completedIssues.length > 0 && (
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-foreground mb-4">Verify Completed Work</h2>
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
            <div className="md:col-span-2">
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
        <div className="grid md:grid-cols-2 gap-4">
          {filteredProblems.length > 0 ? (
            filteredProblems.map((p) => (
              <ProblemCard key={p.id} problem={p} />
            ))
          ) : (
            <div className="col-span-2 bg-card rounded-2xl shadow-card border border-border p-8 text-center">
              <p className="text-muted-foreground">No issues found for this category</p>
            </div>
          )}
        </div>
      </main>

      <PaymentRequestDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        paymentDetails={selectedPayment?.paymentDetails}
        onPayNow={handlePayNow}
      />
    </div>
  );
};

export default ProblemsPage;
