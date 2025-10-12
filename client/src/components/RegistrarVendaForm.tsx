import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CheckCircle2, AlertCircle } from "lucide-react";

interface RegistrarVendaFormProps {
  carteiraDetectada?: {
    numeroCarteira: string;
    saldoAtual: number;
  };
  onRegistrarVenda: (valor: number) => void;
  isLoading?: boolean;
}

export default function RegistrarVendaForm({ carteiraDetectada, onRegistrarVenda, isLoading }: RegistrarVendaFormProps) {
  const [valorCompra, setValorCompra] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(valorCompra.replace(",", "."));
    if (valor > 0) {
      onRegistrarVenda(valor);
      setValorCompra("");
    }
  };

  const saldoSuficiente = carteiraDetectada
    ? parseFloat(valorCompra || "0") <= carteiraDetectada.saldoAtual
    : true;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary-barraca/20 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary-barraca" />
          </div>
          <div>
            <CardTitle>Registrar Venda</CardTitle>
            <CardDescription>Debite o valor da compra da carteira</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {carteiraDetectada ? (
          <>
            <div className="p-4 rounded-lg bg-success/10 border border-success/20 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="font-semibold text-success">Carteira Detectada</span>
              </div>
              <p className="font-mono text-sm" data-testid="text-carteira-detectada">
                {carteiraDetectada.numeroCarteira}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground">Saldo Disponível:</span>
                <span className="text-2xl font-bold text-success" data-testid="text-saldo-disponivel">
                  R$ {carteiraDetectada.saldoAtual.toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="valor-compra">Valor da Compra (R$)</Label>
                <Input
                  id="valor-compra"
                  data-testid="input-valor-compra"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={carteiraDetectada.saldoAtual}
                  placeholder="10.00"
                  value={valorCompra}
                  onChange={(e) => setValorCompra(e.target.value)}
                  required
                />
                {!saldoSuficiente && valorCompra && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Saldo insuficiente</span>
                  </div>
                )}
              </div>

              {valorCompra && (
                <div className="p-3 rounded-lg bg-muted space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Saldo Atual:</span>
                    <span>R$ {carteiraDetectada.saldoAtual.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor da Compra:</span>
                    <span>- R$ {parseFloat(valorCompra || "0").toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-1 mt-1">
                    <div className="flex justify-between font-semibold">
                      <span>Saldo Restante:</span>
                      <span className={saldoSuficiente ? "text-success" : "text-destructive"}>
                        R$ {(carteiraDetectada.saldoAtual - parseFloat(valorCompra || "0")).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !saldoSuficiente}
                data-testid="button-registrar-venda"
                style={{ backgroundColor: "hsl(var(--primary-barraca))" }}
              >
                {isLoading ? "Processando..." : "Confirmar Venda"}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground space-y-2">
            <AlertCircle className="w-12 h-12 mx-auto opacity-50" />
            <p>Escaneie um QR Code para continuar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
