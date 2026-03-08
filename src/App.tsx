import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import UserHome from "./pages/UserHome";
import ProblemsPage from "./pages/ProblemsPage";
import NewProblemPage from "./pages/NewProblemPage";
import ChatPage from "./pages/ChatPage";
import AboutPage from "./pages/AboutPage";
import AdminHome from "./pages/AdminHome";
import AdminProblemsPage from "./pages/AdminProblemsPage";
import WorkerHome from "./pages/WorkerHome";
import WorkerServerPage from "./pages/WorkerServerPage";
import JoinApartmentPage from "./pages/JoinApartmentPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: "user" | "admin" | "worker" }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/signup" element={<SignUpPage />} />
    <Route path="/join/:serverId" element={<JoinApartmentPage />} />
    <Route path="/home" element={<ProtectedRoute requiredRole="user"><UserHome /></ProtectedRoute>} />
    <Route path="/home/problems" element={<ProtectedRoute requiredRole="user"><ProblemsPage /></ProtectedRoute>} />
    <Route path="/home/problems/new" element={<ProtectedRoute requiredRole="user"><NewProblemPage /></ProtectedRoute>} />
    <Route path="/home/chat" element={<ProtectedRoute requiredRole="user"><ChatPage /></ProtectedRoute>} />
    <Route path="/about" element={<ProtectedRoute requiredRole="user"><AboutPage /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminHome /></ProtectedRoute>} />
    <Route path="/admin/problems" element={<ProtectedRoute requiredRole="admin"><AdminProblemsPage /></ProtectedRoute>} />
    <Route path="/admin/workers" element={<ProtectedRoute requiredRole="admin"><WorkerServerPage /></ProtectedRoute>} />
    <Route path="/admin/chat" element={<ProtectedRoute requiredRole="admin"><ChatPage /></ProtectedRoute>} />
    <Route path="/worker" element={<ProtectedRoute requiredRole="worker"><WorkerHome /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
