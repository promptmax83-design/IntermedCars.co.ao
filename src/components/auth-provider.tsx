"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import KycModal from "@/components/kyc-modal";

interface User {
  id: number;
  nome: string;
  email: string;
  telemovel: string;
  nif: string;
  verificado: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isVerified: boolean;
  showKycModal: boolean;
  setShowKycModal: (show: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  markVerified: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showKycModal, setShowKycModal] = useState(false);

  const login = (u: User) => setUser(u);
  const logout = () => setUser(null);
  const markVerified = () => {
    if (user) setUser({ ...user, verificado: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isVerified: !!user?.verificado,
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
