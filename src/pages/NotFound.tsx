import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <div className="medical-card p-8">
          <AlertCircle className="w-16 h-16 text-warning mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <h2 className="text-xl font-semibold text-foreground mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist in the Medical Store Management System.
          </p>
          <Button asChild className="gap-2">
            <a href="/">
              <Home className="w-4 h-4" />
              Return to Dashboard
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
