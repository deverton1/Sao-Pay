import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyRound, User } from "lucide-react";

type UserRole = "admin" | "caixa" | "barraca";

interface LoginPageProps {
  onLogin: (role: UserRole, username: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [role, setRole] = useState<UserRole>("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login tentativa:", { role, username });
    onLogin(role, username);
  };

  const getRoleColor = (r: UserRole) => {
    if (r === "admin") return "bg-primary-admin";
    if (r === "caixa") return "bg-primary-caixa";
    return "bg-primary-barraca";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className={`mx-auto w-16 h-16 rounded-full ${getRoleColor(role)} flex items-center justify-center mb-2`}>
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">São Pay</CardTitle>
          <CardDescription>Sistema de Carteiras Virtuais</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Acesso</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger id="role" data-testid="select-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="caixa">Caixa</SelectItem>
                  <SelectItem value="barraca">Barraca</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  data-testid="input-username"
                  className="pl-9"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                data-testid="input-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              data-testid="button-login"
              style={{
                backgroundColor: role === "admin" ? "hsl(var(--primary-admin))" :
                               role === "caixa" ? "hsl(var(--primary-caixa))" :
                               "hsl(var(--primary-barraca))",
              }}
            >
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
