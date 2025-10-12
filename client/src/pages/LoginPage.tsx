import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { LoginInput } from "@shared/schema";

interface LoginPageProps {
  onLogin: (token: string, tipo: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { toast } = useToast();
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">São Pay</CardTitle>
          <CardDescription className="text-center">
            Sistema de Gestão de Eventos com Carteira Virtual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="admin">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="admin" data-testid="tab-admin">Admin</TabsTrigger>
              <TabsTrigger value="caixa" data-testid="tab-caixa">Caixa</TabsTrigger>
              <TabsTrigger value="barraca" data-testid="tab-barraca">Barraca</TabsTrigger>
            </TabsList>

            <TabsContent value="admin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-login">Login</Label>
                <Input
                  id="admin-login"
                  data-testid="input-admin-login"
                  placeholder="Digite seu login"
                  value={adminCredentials.login}
                  onChange={(e) => setAdminCredentials({ ...adminCredentials, login: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin("admin")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-senha">Senha</Label>
                <Input
                  id="admin-senha"
                  data-testid="input-admin-senha"
                  type="password"
                  placeholder="Digite sua senha"
                  value={adminCredentials.senha}
                  onChange={(e) => setAdminCredentials({ ...adminCredentials, senha: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin("admin")}
                />
              </div>
              <Button
                data-testid="button-admin-login"
                className="w-full"
                onClick={() => handleLogin("admin")}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar como Admin"}
              </Button>
            </TabsContent>

            <TabsContent value="caixa" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="caixa-login">Login</Label>
                <Input
                  id="caixa-login"
                  data-testid="input-caixa-login"
                  placeholder="Digite seu login"
                  value={caixaCredentials.login}
                  onChange={(e) => setCaixaCredentials({ ...caixaCredentials, login: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin("caixa")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caixa-senha">Senha</Label>
                <Input
                  id="caixa-senha"
                  data-testid="input-caixa-senha"
                  type="password"
                  placeholder="Digite sua senha"
                  value={caixaCredentials.senha}
                  onChange={(e) => setCaixaCredentials({ ...caixaCredentials, senha: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin("caixa")}
                />
              </div>
              <Button
                data-testid="button-caixa-login"
                className="w-full"
                onClick={() => handleLogin("caixa")}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar como Caixa"}
              </Button>
            </TabsContent>

            <TabsContent value="barraca" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barraca-login">Login</Label>
                <Input
                  id="barraca-login"
                  data-testid="input-barraca-login"
                  placeholder="Digite seu login"
                  value={barracaCredentials.login}
                  onChange={(e) => setBarracaCredentials({ ...barracaCredentials, login: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin("barraca")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barraca-senha">Senha</Label>
                <Input
                  id="barraca-senha"
                  data-testid="input-barraca-senha"
                  type="password"
                  placeholder="Digite sua senha"
                  value={barracaCredentials.senha}
                  onChange={(e) => setBarracaCredentials({ ...barracaCredentials, senha: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin("barraca")}
                />
              </div>
              <Button
                data-testid="button-barraca-login"
                className="w-full"
                onClick={() => handleLogin("barraca")}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar como Barraca"}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-3 rounded-md bg-muted text-sm text-muted-foreground">
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
