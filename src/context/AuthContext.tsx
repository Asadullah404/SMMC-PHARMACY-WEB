import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, db, isFirebaseConfigured } from "../firebase";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: "admin" | "guest" | "staff";
}

interface AuthContextType {
  user: AppUser | null;
  role: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isFirebaseAvailable: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const envAdmins = import.meta.env.VITE_ADMIN_EMAILS
  ? String(import.meta.env.VITE_ADMIN_EMAILS)
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  : [];

const ADMIN_EMAILS = [
  "admin@example.com",
  "asadullah@example.com",
  "smmcpharmacy@gmail.com",
  "asadullah404@gmail.com",
  ...envAdmins,
];

const LOCAL_STORAGE_USER_KEY = "smmc_v2_active_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState<string | null>(() => user?.role || null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        let userRole: "admin" | "guest" | "staff" = "guest";
        const emailLower = firebaseUser.email?.toLowerCase();

        // 1. Check if email is in whitelist of administrators
        if (emailLower && ADMIN_EMAILS.includes(emailLower)) {
          userRole = "admin";
        } else {
          // 2. Query Firestore users collection for assigned role
          try {
            const userRef = doc(db, "users", firebaseUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              userRole = (userDoc.data()?.role as any) || "guest";
            } else {
              // Create new user profile document in Firestore
              await setDoc(userRef, {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: "guest",
                createdAt: serverTimestamp(),
              });
              userRole = "guest";
            }
          } catch (e) {
            console.error("Firestore user role query error:", e);
            userRole = "guest";
          }
        }

        const appUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || "Pharmacy Operator",
          photoURL: firebaseUser.photoURL,
          role: userRole,
        };

        setUser(appUser);
        setRole(userRole);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(appUser));
      } else {
        setUser(null);
        setRole(null);
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      console.warn("Firebase credentials missing in deployment environment.");
      return;
    }

    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Google sign in error:", error);
      if (error?.code !== "auth/popup-closed-by-user" && error?.code !== "auth/cancelled-popup-request") {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isFirebaseConfigured) {
        await signOut(auth);
      }
    } catch (e) {
      console.error("Sign out error", e);
    }
    setUser(null);
    setRole(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signInWithGoogle,
        logout,
        isFirebaseAvailable: isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
