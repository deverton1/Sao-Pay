import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";

interface EmitirCarteiraFormProps {
  onEmit: (valor: number, senhaRecuperacao: string) => void;
  isLoading?: boolean;
}

export default function EmitirCarteiraForm({ onEmit, isLoading }: EmitirCarteiraFormProps) {
  const [valor, setValor] = useState("");
  const [senhaRecuperacao, setSenhaRecuperacao] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNumerico = parseFloat(valor.replace(",", "."));
    if (valorNumerico > 0 && senhaRecuperacao.length >= 4) {
      onEmit(valorNumerico, senhaRecuperacao);
      setValor("");
      setSenhaRecuperacao("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary-caixa/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-caixa" />
          </div>
          <div>
            <CardTitle>Emitir Nova Carteira</CardTitle>
            <CardDescription>Crie uma carteira virtual com saldo</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor do Saldo (R$)</Label>
            <Input
              id="valor"
              data-testid="input-valor"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="50.00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha-recuperacao">Senha de Recuperação</Label>
            <Input
              id="senha-recuperacao"
              data-testid="input-senha-recuperacao"
              type="password"
              placeholder="Mínimo 4 dígitos"
              value={senhaRecuperacao}
              onChange={(e) => setSenhaRecuperacao(e.target.value)}
              minLength={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Esta senha será usada para recuperar a carteira se necessário
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="button-emitir-carteira"
            style={{ backgroundColor: "hsl(var(--primary-caixa))" }}
          >
            {isLoading ? "Gerando..." : "Emitir Carteira"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
