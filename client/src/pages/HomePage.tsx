import { useState } from "react";
import LoginPage from "@/components/LoginPage";
import AdminDashboard from "@/components/AdminDashboard";
import CaixaDashboard from "@/components/CaixaDashboard";
import BarracaDashboard from "@/components/BarracaDashboard";

type UserRole = "admin" | "caixa" | "barraca";

interface UserSession {
  role: UserRole;
  username: string;
}

export default function HomePage() {
  const [session, setSession] = useState<UserSession | null>(null);

  const handleLogin = (role: UserRole, username: string) => {
    setSession({ role, username });
  };

  const handleLogout = () => {
    setSession(null);
  };

  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (session.role === "admin") {
    return <AdminDashboard nomeUsuario={session.username} onLogout={handleLogout} />;
  }

  if (session.role === "caixa") {
    return <CaixaDashboard nomeUsuario={session.username} onLogout={handleLogout} />;
  }

  return <BarracaDashboard nomeBarraca={session.username} onLogout={handleLogout} />;
}
