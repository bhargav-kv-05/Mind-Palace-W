import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Placeholder from "./pages/Placeholder";
import RootLayout from "./components/layout/RootLayout";
import DashboardStudent from "./pages/DashboardStudent";
import DashboardCounsellor from "./pages/DashboardCounsellor";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ChatPage from "./pages/Chat";
import ScreeningPage from "./pages/Screening";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <RootLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/chat" element={<ProtectedRoute role="student"><ChatPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<Placeholder />} />
              <Route path="/screening" element={<ProtectedRoute role="student"><ScreeningPage /></ProtectedRoute>} />
              <Route path="/dashboard/student" element={<ProtectedRoute role="student"><DashboardStudent /></ProtectedRoute>} />
              <Route path="/dashboard/counsellor" element={<ProtectedRoute role="counsellor"><DashboardCounsellor /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RootLayout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
