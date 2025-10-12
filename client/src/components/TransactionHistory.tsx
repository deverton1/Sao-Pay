import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Transaction {
  id: number;
  numeroCarteira: string;
  tipo: "emissao" | "compra";
  valor: number;
  saldoAnterior?: number;
  saldoRestante?: number;
  data: string;
  local?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  title?: string;
}

export default function TransactionHistory({ transactions, title = "Histórico de Transações" }: TransactionHistoryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{transactions.length} transações registradas</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-start justify-between p-4 rounded-lg border hover-elevate"
                data-testid={`transaction-${transaction.id}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={transaction.tipo === "emissao" ? "default" : "secondary"}
                      data-testid={`badge-tipo-${transaction.id}`}
                    >
                      {transaction.tipo === "emissao" ? "Emissão" : "Compra"}
                    </Badge>
                    {transaction.local && (
                      <span className="text-sm text-muted-foreground">{transaction.local}</span>
                    )}
                  </div>
                  <p className="font-mono text-sm" data-testid={`text-carteira-${transaction.id}`}>
                    {transaction.numeroCarteira}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(transaction.data)}</p>
                </div>
                <div className="text-right space-y-1">
                  <p
                    className={`font-bold ${transaction.tipo === "emissao" ? "text-success" : "text-foreground"}`}
                    data-testid={`text-valor-${transaction.id}`}
                  >
                    {transaction.tipo === "emissao" ? "+" : "-"} {formatCurrency(transaction.valor)}
                  </p>
                  {transaction.saldoRestante !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Saldo: {formatCurrency(transaction.saldoRestante)}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação encontrada
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
