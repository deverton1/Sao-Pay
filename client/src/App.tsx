import { useState, useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "@/pages/LoginPage";
import AdminDashboard from "@/components/AdminDashboard";
import CaixaDashboard from "@/components/CaixaDashboard";
import BarracaDashboard from "@/components/BarracaDashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("sao-pay-token");
    const tipo = localStorage.getItem("sao-pay-tipo");
    if (token && tipo) {
      setIsAuthenticated(true);
      setUserType(tipo);
    }
  }, []);

  const handleLogin = (token: string, tipo: string) => {
    setIsAuthenticated(true);
    setUserType(tipo);
  };

  const handleLogout = () => {
    localStorage.removeItem("sao-pay-token");
    localStorage.removeItem("sao-pay-tipo");
    localStorage.removeItem("sao-pay-usuario");
    setIsAuthenticated(false);
    setUserType(null);
    queryClient.clear();
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const usuario = localStorage.getItem("sao-pay-usuario");
  const usuarioData = usuario ? JSON.parse(usuario) : null;

  return (
    <Switch>
      <Route path="/">
        {() => {
          if (userType === "admin") {
            return <AdminDashboard onLogout={handleLogout} nomeUsuario={usuarioData?.nome || "Admin"} />;
          } else if (userType === "caixa") {
            return <CaixaDashboard onLogout={handleLogout} nomeUsuario={usuarioData?.nome || "Caixa"} />;
          } else if (userType === "barraca") {
            return <BarracaDashboard onLogout={handleLogout} nomeBarraca={usuarioData?.nome || "Barraca"} />;
          }
          return <Redirect to="/404" />;
        }}
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
