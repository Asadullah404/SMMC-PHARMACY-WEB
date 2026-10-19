import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PharmacyProvider } from "./context/PharmacyContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "sonner";

import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { MobileNavbar } from "./components/MobileNavbar";
import { CommandPalette } from "./components/CommandPalette";
import { ReorderModal } from "./components/ReorderModal";
import { VideoIntroModal } from "./components/VideoIntroModal";

import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { Sales } from "./pages/Sales";
import { Reports } from "./pages/Reports";
import { Demand } from "./pages/Demand";
import { Login } from "./pages/Login";
import { ContactDeveloper } from "./pages/ContactDeveloper";
import { NotFound } from "./pages/NotFound";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground space-y-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">
          Authenticating SMMC Pharmacy Session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/contact-developer" replace />;
  }

  return <>{children}</>;
};

const MainLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [reorderPreloadItems, setReorderPreloadItems] = useState<any[]>([]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const location = useLocation();

  // Determine current page header details
  const getHeaderInfo = () => {
    switch (location.pathname) {
      case "/":
        return {
          title: "Dashboard Overview",
          subtitle: "Real-time key metrics, stock alerts, and financial overview",
        };
      case "/inventory":
        return {
          title: "Medicine Inventory",
          subtitle: "Complete pharmaceutical stock, valuations, and replenishment",
        };
      case "/sales":
        return {
          title: "Sales & POS Terminal",
          subtitle: "Fast register billing, prescription intake, and receipt printing",
        };
      case "/reports":
        return {
          title: "Financial Reports",
          subtitle: "Transaction audits, net margins, and doctor fees analytics",
        };
      case "/demand":
        return {
          title: "Demand Analytics",
          subtitle: "Medicine sales velocity and volume share rankings",
        };
      default:
        return { title: "SMMC Pharmacy", subtitle: "" };
    }
  };

  const headerInfo = getHeaderInfo();

  // One-time tour trigger per session
  useEffect(() => {
    const hasSeen = sessionStorage.getItem("smmc_v2_hasSeenTour");
    if (!hasSeen) {
      // Optional: prompt or start video tour once
      sessionStorage.setItem("smmc_v2_hasSeenTour", "true");
    }
  }, []);

  const handleOpenReorderWithItems = (items: any[]) => {
    setReorderPreloadItems(items);
    setIsReorderOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex w-full overflow-hidden">
      {/* Sidebar for Desktop/Tablet */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Header */}
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onOpenCommand={() => setIsCommandOpen(true)}
          onOpenReorder={() => {
            setReorderPreloadItems([]);
            setIsReorderOpen(true);
          }}
          onOpenVideo={() => setIsVideoOpen(true)}
        />

        {/* Scrollable Page Body with padding bottom on mobile */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  onOpenReorderWithItems={handleOpenReorderWithItems}
                  onOpenAddMed={() => {
                    // Navigate to inventory with add trigger
                    window.location.hash = "add-med";
                  }}
                />
              }
            />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/demand" element={<Demand />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Mobile Navigation Bar */}
        <MobileNavbar
          onOpenReorder={() => {
            setReorderPreloadItems([]);
            setIsReorderOpen(true);
          }}
        />
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenReorder={() => {
          setReorderPreloadItems([]);
          setIsReorderOpen(true);
        }}
      />

      <ReorderModal
        isOpen={isReorderOpen}
        onClose={() => {
          setIsReorderOpen(false);
          setReorderPreloadItems([]);
        }}
        initialItems={reorderPreloadItems}
      />

      <VideoIntroModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PharmacyProvider>
          <Toaster position="top-right" richColors closeButton />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/contact-developer" element={<ContactDeveloper />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </PharmacyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
