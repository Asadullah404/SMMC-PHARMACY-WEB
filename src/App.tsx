import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MedicalSidebar } from "@/components/MedicalSidebar";
import { MobileNav } from "@/components/MobileNav";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Demand from "./pages/Demand";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ContactDeveloper from "./pages/ContactDeveloper";
import VideoIntro from "./components/VideoIntro";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If user is logged in but role is still being fetched, show loading
  if (user && role === null) {
    return <div className="flex items-center justify-center h-screen">Loading role...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role !== "admin") {
    return <Navigate to="/contact-developer" />;
  }

  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <MedicalSidebar />
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
};

const AppContent = () => {
  const { user, role } = useAuth();
  const [showVideo, setShowVideo] = useState(false);
  const [videoShown, setVideoShown] = useState(false);

  useEffect(() => {
    // Show video only once after admin login
    if (user && role === "admin" && !videoShown) {
      const hasSeenVideo = sessionStorage.getItem("hasSeenVideo");
      if (!hasSeenVideo) {
        setShowVideo(true);
      }
    }
  }, [user, role, videoShown]);

  const handleVideoComplete = () => {
    setShowVideo(false);
    setVideoShown(true);
    sessionStorage.setItem("hasSeenVideo", "true");
  };

  return (
    <>
      {showVideo && <VideoIntro onComplete={handleVideoComplete} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/contact-developer" element={<ContactDeveloper />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/demand" element={<Demand />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
