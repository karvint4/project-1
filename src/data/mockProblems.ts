export type ProblemScope = "personal" | "common";
export type ProblemStatus = "waiting" | "seen" | "accepted" | "started" | "in_progress" | "completed";
export type PaymentStatus = "none" | "pending" | "paid";

export interface Problem {
  id: string;
  category: string;
  description: string;
  imageUrl: string;
  scope: ProblemScope;
  status: ProblemStatus;
  scheduledDate?: string;
  paymentStatus: PaymentStatus;
  paymentAmount?: number;
  rating?: number;
  feedback?: string;
  createdBy: string;
  createdByName: string;
  apartmentId: string;
  serverId?: string;
  createdAt: string;
}

export const mockProblems: Problem[] = [
  {
    id: "p1",
    category: "water",
    description: "Leaking tap in kitchen. Water dripping constantly, causing wastage.",
    imageUrl: "",
    scope: "personal",
    status: "in_progress",
    scheduledDate: "2026-03-01T10:00",
    paymentStatus: "none",
    createdBy: "u1",
    createdByName: "Rahul Sharma",
    apartmentId: "apt1",
    createdAt: "2026-02-24",
  },
  {
    id: "p2",
    category: "elevator",
    description: "Main elevator making unusual noise and stopping between floors.",
    imageUrl: "",
    scope: "common",
    status: "seen",
    paymentStatus: "none",
    createdBy: "u2",
    createdByName: "Anita Desai",
    apartmentId: "apt1",
    createdAt: "2026-02-25",
  },
  {
    id: "p3",
    category: "electricity",
    description: "Power outage on 3rd floor corridor lights since last week.",
    imageUrl: "",
    scope: "common",
    status: "completed",
    paymentStatus: "paid",
    paymentAmount: 2500,
    rating: 4,
    feedback: "Good work, fixed promptly.",
    createdBy: "u1",
    createdByName: "Rahul Sharma",
    apartmentId: "apt1",
    createdAt: "2026-02-20",
  },
];
