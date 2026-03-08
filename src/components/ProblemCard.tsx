import { Problem } from "@/data/mockProblems";
import { problemCategories } from "@/data/problemCategories";
import StatusTracker from "./StatusTracker";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar } from "lucide-react";

interface ProblemCardProps {
  problem: Problem;
}

const ProblemCard = ({ problem }: ProblemCardProps) => {
  const category = problemCategories.find((c) => c.id === problem.category);
  const Icon = category?.icon;

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border p-5 space-y-4 animate-fade-in hover:shadow-soft transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {Icon && <Icon className={`h-5 w-5 ${category?.color}`} />}
          <div>
            <h3 className="font-semibold text-foreground text-sm">{category?.label}</h3>
            <p className="text-xs text-muted-foreground">{problem.createdAt}</p>
          </div>
        </div>
        <Badge
          variant={problem.scope === "common" ? "secondary" : "outline"}
          className="rounded-lg text-xs"
        >
          {problem.scope === "common" ? "Common" : "Personal"}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground/80">{problem.description}</p>

      {/* Schedule */}
      {problem.scheduledDate && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          Scheduled: {new Date(problem.scheduledDate).toLocaleString()}
        </div>
      )}

      {/* Status */}
      <StatusTracker currentStatus={problem.status} isPaymentCompleted={problem.paymentCompleted} />

      {/* Payment & Rating */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="text-xs text-muted-foreground">
          {problem.paymentStatus === "paid" && problem.paymentAmount && (
            <span className="text-success font-medium">₹{problem.paymentAmount} Paid</span>
          )}
          {problem.paymentStatus === "pending" && (
            <span className="text-warning font-medium">Payment Pending</span>
          )}
          {problem.paymentStatus === "none" && problem.status !== "completed" && (
            <span>No payment yet</span>
          )}
        </div>
        {problem.rating && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < problem.rating! ? "text-warning fill-warning" : "text-muted"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemCard;
