import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export const Login: React.FC = () => {
  const { signInWithGoogle, user, loading, isFirebaseAvailable } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseAvailable) {
      toast.error(
        "Firebase environment variables are missing. Please configure VITE_FIREBASE_* in your deployment settings."
      );
      return;
    }

    try {
      setSubmitting(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Google Authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-background">
      {/* Background radial gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="p-8 md:p-10 rounded-3xl bg-card border border-border/80 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Logo & Clinical Brand Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 p-0.5 shadow-xl shadow-primary/25 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="SMMC"
                  className="w-full h-full object-contain rounded-[14px] bg-card p-1.5"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-card rounded-full" />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                SMMC Pharmacy
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                Healthcare &amp; Clinical Medical Store ERP
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Certified Pharmacy Access Gateway</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Secure authentication restricted to authorized store managers, doctors, and pharmacy personnel.
            </p>
          </div>

          {!isFirebaseAvailable && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Production Configuration Notice</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Connect your Firebase project credentials via <code className="font-mono bg-muted/70 px-1 py-0.5 rounded text-foreground">VITE_FIREBASE_*</code> environment variables to activate Google Sign-In.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Google Login (Production) */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting || loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-card hover:bg-muted border border-border text-foreground font-bold text-sm shadow-xs hover:border-primary/50 flex items-center justify-center gap-3 transition-all transform active:scale-98 disabled:opacity-50 disabled:pointer-events-none group"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span>{submitting ? "Signing in..." : "Continue with Google"}</span>
              {!submitting && (
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform ml-auto" />
              )}
            </button>
          </div>

          <div className="pt-2 text-center text-[11px] text-muted-foreground">
            SMMC Pharmacy System v2.0 • HIPAA &amp; Clinical Compliance Ready
          </div>
        </div>
      </div>
    </div>
  );
};
