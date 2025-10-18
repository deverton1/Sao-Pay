import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { LoginInput } from "@shared/schema";
import { ArrowLeft, User, Store, DollarSign } from "lucide-react";

interface LoginPageProps {
  onLogin: (token: string, tipo: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"select" | "login">("select");
  const [selectedTipo, setSelectedTipo] = useState<"admin" | "caixa" | "barraca" | null>(null);

  const [adminCredentials, setAdminCredentials] = useState({ login: "", senha: "" });
  const [caixaCredentials, setCaixaCredentials] = useState({ login: "", senha: "" });
  const [barracaCredentials, setBarracaCredentials] = useState({ login: "", senha: "" });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      return apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      localStorage.setItem("sao-pay-token", data.token);
      localStorage.setItem("sao-pay-tipo", data.usuario.tipo);
      localStorage.setItem("sao-pay-usuario", JSON.stringify(data.usuario));
      onLogin(data.token, data.usuario.tipo);
      toast({
        title: "Login realizado",
        description: `Bem-vindo, ${data.usuario.nome}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (tipo: "admin" | "caixa" | "barraca") => {
    let credentials;
    if (tipo === "admin") credentials = adminCredentials;
    else if (tipo === "caixa") credentials = caixaCredentials;
    else credentials = barracaCredentials;

    if (!credentials.login || !credentials.senha) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha login e senha",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate({
      login: credentials.login,
      senha: credentials.senha,
      tipo,
    });
  };

  const profileData = {
    admin: { label: "Administrador", color: "bg-blue-600", icon: <User className="w-5 h-5" /> },
    caixa: { label: "Caixa", color: "bg-green-600", icon: <DollarSign className="w-5 h-5" /> },
    barraca: { label: "Barraca", color: "bg-orange-600", icon: <Store className="w-5 h-5" /> },
  };

  const renderLoginForm = (tipo: "admin" | "caixa" | "barraca") => {
    const cred = tipo === "admin" ? adminCredentials : tipo === "caixa" ? caixaCredentials : barracaCredentials;
    const setCred = tipo === "admin" ? setAdminCredentials : tipo === "caixa" ? setCaixaCredentials : setBarracaCredentials;

    return (
      <motion.div
        key={tipo}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-5"
      >
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setStep("select")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <h2 className="text-lg font-semibold">{profileData[tipo].label}</h2>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${tipo}-login`}>Login</Label>
          <Input
            id={`${tipo}-login`}
            placeholder="Digite seu login"
            value={cred.login}
            onChange={(e) => setCred({ ...cred, login: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleLogin(tipo)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${tipo}-senha`}>Senha</Label>
          <Input
            id={`${tipo}-senha`}
            type="password"
            placeholder="Digite sua senha"
            value={cred.senha}
            onChange={(e) => setCred({ ...cred, senha: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleLogin(tipo)}
          />
        </div>

        <Button
          className={`w-full ${profileData[tipo].color} hover:opacity-90 transition`}
          onClick={() => handleLogin(tipo)}
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Entrando..." : `Entrar como ${profileData[tipo].label}`}
        </Button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted to-background p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">São Pay</CardTitle>
          <CardDescription className="text-base mt-1">
            Sistema de Gestão de Eventos com Carteira Virtual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {step === "select" ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <p className="text-center text-muted-foreground">Escolha o tipo de perfil para entrar:</p>
                <div className="grid grid-cols-3 gap-4">
                  {(["admin", "caixa", "barraca"] as const).map((tipo) => (
                    <motion.button
                      key={tipo}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedTipo(tipo);
                        setStep("login");
                      }}
                      className={`p-4 rounded-xl flex flex-col items-center gap-2 text-white font-medium shadow-md ${profileData[tipo].color}`}
                    >
                      {profileData[tipo].icon}
                      {profileData[tipo].label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              selectedTipo && renderLoginForm(selectedTipo)
            )}
          </AnimatePresence>

          <div className="mt-6 p-3 rounded-md bg-muted text-sm text-muted-foreground">
            <p className="font-medium mb-1">Credenciais de teste:</p>
            <p>Admin: admin / 123456</p>
            <p>Caixa: caixa1 / 123456</p>
            <p>Barraca: barraca1 / 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
