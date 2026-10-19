import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, LogOut, PhoneCall, ArrowLeft } from "lucide-react";

export const ContactDeveloper: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const whatsappNumber = "923022111051";
  const message = `Hello SMMC Support, my account (${user?.email || "User"}) is currently pending admin authorization. Please grant role access.`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md p-8 rounded-3xl bg-card border border-border shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Administrative Access Restricted
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Your authenticated account (<strong className="text-foreground">{user?.email || "Guest"}</strong>) does not have active pharmacy administrator privileges in Firestore.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Contact Lead Developer on WhatsApp</span>
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-border text-foreground hover:bg-muted text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
            <span>Sign Out &amp; Return to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
