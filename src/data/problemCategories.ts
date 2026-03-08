import {
  Droplets,
  Zap,
  Wrench,
  Building,
  ArrowUpDown,
  Shield,
  Waves,
  Bug,
  ParkingCircle,
  HelpCircle,
  LucideIcon,
} from "lucide-react";

export interface ProblemCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export const problemCategories: ProblemCategory[] = [
  { id: "water", label: "Water Issue", icon: Droplets, color: "text-info" },
  { id: "electricity", label: "Electricity Issue", icon: Zap, color: "text-warning" },
  { id: "plumbing", label: "Plumbing Issue", icon: Wrench, color: "text-primary" },
  { id: "structural", label: "Structural & Civil", icon: Building, color: "text-foreground" },
  { id: "elevator", label: "Elevator Issue", icon: ArrowUpDown, color: "text-muted-foreground" },
  { id: "security", label: "Security Issue", icon: Shield, color: "text-destructive" },
  { id: "drainage", label: "Drainage Issue", icon: Waves, color: "text-info" },
  { id: "pest", label: "Pest Control", icon: Bug, color: "text-warning" },
  { id: "parking", label: "Parking & Common Area", icon: ParkingCircle, color: "text-success" },
  { id: "other", label: "Other Issue", icon: HelpCircle, color: "text-muted-foreground" },
];
