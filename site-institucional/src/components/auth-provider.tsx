"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import KycModal from "@/components/kyc-modal";

interface User {
  id: number;
  nome: string;
  email: string;
  verificado: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isVerified: boolean;
  isLoading: boolean;
  showKycModal: boolean;
  setShowKycModal: (show: boolean) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  markVerified: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

function readAuthFromStorage(): { token: string | null; user: User | null } {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      const payload = decodeJwtPayload(storedToken);
      if (
        payload &&
        typeof payload.exp === "number" &&
        payload.exp > Date.now() / 1000
      ) {
        return { token: storedToken, user: JSON.parse(storedUser) };
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readAuthFromStorage().user);
  const [token, setToken] = useState<string | null>(() => readAuthFromStorage().token);
  const [isLoading] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const markVerified = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, verificado: true };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user && !!token,
        isVerified: !!user?.verificado,
        isLoading,
        showKycModal,
        setShowKycModal,
        login,
        logout,
        markVerified,
      }}
    >
      {children}
      <KycModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        onComplete={markVerified}
      />
    </AuthContext.Provider>
  );
}
