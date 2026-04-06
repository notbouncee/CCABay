// App.tsx - Root component with routing and providers
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ExplorePage from "@/pages/ExplorePage";
import CCADetailPage from "@/pages/CCADetailPage";
import MatchMePage from "@/pages/MatchMePage";
import PlannerPage from "@/pages/PlannerPage";
import SavedCCAsPage from "@/pages/SavedCCAsPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Layout wrapper that includes navbar for authenticated pages
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

// Main App component with all routes
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes without navbar */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Routes with navbar */}
            <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
            <Route path="/explore" element={<AppLayout><ExplorePage /></AppLayout>} />
            <Route path="/cca/:id" element={<AppLayout><CCADetailPage /></AppLayout>} />

            {/* Protected routes with navbar */}
            <Route path="/matchme" element={<AppLayout><ProtectedRoute><MatchMePage /></ProtectedRoute></AppLayout>} />
            <Route path="/planner" element={<AppLayout><ProtectedRoute><PlannerPage /></ProtectedRoute></AppLayout>} />
            <Route path="/saved" element={<AppLayout><ProtectedRoute><SavedCCAsPage /></ProtectedRoute></AppLayout>} />
            <Route path="/profile" element={<AppLayout><ProtectedRoute><ProfilePage /></ProtectedRoute></AppLayout>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
