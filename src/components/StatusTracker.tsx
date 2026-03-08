import { Check, Clock, Eye, Play, Loader2, CheckCircle2 } from "lucide-react";
import { ProblemStatus } from "@/data/mockProblems";

const steps: { key: ProblemStatus; label: string; icon: React.ElementType }[] = [
  { key: "waiting", label: "Waiting", icon: Clock },
  { key: "read", label: "Read", icon: Eye },
  { key: "accepted", label: "Accepted", icon: Check },
  { key: "started", label: "Started", icon: Play },
  { key: "in_progress", label: "In Progress", icon: Loader2 },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
  { key: "verified", label: "Verified", icon: CheckCircle2 },
];

const statusOrder: ProblemStatus[] = ["waiting", "read", "accepted", "started", "in_progress", "completed", "verified"];

interface StatusTrackerProps {
  currentStatus: ProblemStatus;
  isPaymentCompleted?: boolean;
}

const StatusTracker = ({ currentStatus, isPaymentCompleted }: StatusTrackerProps) => {
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isFullyCompleted = isPaymentCompleted || currentStatus === "verified";

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isCompleted = isFullyCompleted ? true : i < currentIndex;
        const isCurrent = !isFullyCompleted && i === currentIndex;
        const isInProgress = step.key === "in_progress" && isCurrent;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center min-w-[56px]">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                  isCompleted || isFullyCompleted
                    ? "bg-success text-success-foreground"
                    : isCurrent
                    ? "gradient-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${isInProgress ? "animate-spin" : ""}`} />
              </div>
              <span
                className={`text-[10px] mt-1 font-medium ${
                  isCurrent ? "text-primary" : (isCompleted || isFullyCompleted) ? "text-success" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-4 mx-0.5 rounded-full transition-colors ${
                  isFullyCompleted || i < currentIndex ? "bg-success" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusTracker;
