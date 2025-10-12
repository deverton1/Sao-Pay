import { useState } from "react";
import { LogOut, ShoppingCart, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import StatsCard from "./StatsCard";
import QRCodeScanner from "./QRCodeScanner";
import RegistrarVendaForm from "./RegistrarVendaForm";
import TransactionHistory from "./TransactionHistory";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Carteira, VendaBarraca } from "@shared/schema";

interface BarracaDashboardProps {
  nomeBarraca: string;
  onLogout: () => void;
}

export default function BarracaDashboard({ nomeBarraca, onLogout }: BarracaDashboardProps) {
  const [carteiraDetectada, setCarteiraDetectada] = useState<Carteira | undefined>(undefined);
  const [isConsultingSaldo, setIsConsultingSaldo] = useState(false);
  const { toast } = useToast();

  const { data: vendas = [] } = useQuery<VendaBarraca[]>({
    queryKey: ["/api/barraca/vendas"],
  });

  const { data: estatisticas } = useQuery<any>({
    queryKey: ["/api/barraca/estatisticas"],
  });

  // Mutation para consultar saldo via backend
  const consultarSaldoMutation = useMutation({
    mutationFn: async (numeroCarteira: string) => {
      // Chamada à rota que valida carteira e retorna dados
      return apiRequest(`/api/barraca/abrir-camera/${encodeURIComponent(numeroCarteira)}`);
    },
    onSuccess: (carteira: Carteira) => {
      setCarteiraDetectada(carteira);
      toast({
        title: "Carteira encontrada",
        description: `Saldo: R$ ${parseFloat(carteira.saldo).toFixed(2)}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao consultar saldo",
        variant: "destructive",
      });
      setCarteiraDetectada(undefined);
    },
  });

  // Mutation para registrar venda
  const registrarVendaMutation = useMutation({
    mutationFn: async (data: { numeroCarteira: string; valorCompra: number }) => {
      return apiRequest("/api/barraca/registrar-venda", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/barraca/vendas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/barraca/estatisticas"] });
      setCarteiraDetectada(response.carteira);
      toast({
        title: "Venda registrada",
        description: `Novo saldo: R$ ${parseFloat(response.carteira.saldo).toFixed(2)}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar venda",
        variant: "destructive",
      });
    },
  });

  // Função chamada pelo QRCodeScanner
  const handleScan = async (numeroCarteira: string) => {
    setIsConsultingSaldo(true);
    try {
      await consultarSaldoMutation.mutateAsync(numeroCarteira);
    } finally {
      setIsConsultingSaldo(false);
    }
  };

  // Função para registrar venda a partir da carteira detectada
  const handleRegistrarVenda = (valor: number) => {
    if (carteiraDetectada) {
      registrarVendaMutation.mutate({
        numeroCarteira: carteiraDetectada.numeroCarteira,
        valorCompra: valor,
      });
    }
  };

  // Estatísticas e vendas do dia
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vendasHoje = vendas.filter((v) => new Date(v.dataCompra || 0) >= hoje);
  const totalVendidoHoje = vendasHoje.reduce((acc, v) => acc + parseFloat(v.valorCompra), 0);
  const ticketMedio = vendasHoje.length > 0 ? totalVendidoHoje / vendasHoje.length : 0;

  // Histórico de transações formatado
  const transactions = vendas.map((v) => ({
    id: v.id,
    numeroCarteira: v.numeroCarteira,
    tipo: "compra" as const,
    valor: parseFloat(v.valorCompra),
    saldoAnterior: parseFloat(v.saldoAnterior),
    saldoRestante: parseFloat(v.saldoRestante),
    data: v.dataCompra?.toString() || new Date().toISOString(),
    local: nomeBarraca,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-barraca flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">São Pay - Barraca</h1>
              <p className="text-sm text-muted-foreground">{nomeBarraca}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={onLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Vendas Hoje"
            value={vendasHoje.length}
            icon={ShoppingCart}
            description="Transações realizadas"
            data-testid="stat-vendas-hoje"
          />
          <StatsCard
            title="Total Vendido Hoje"
            value={`R$ ${totalVendidoHoje.toFixed(2)}`}
            icon={TrendingUp}
            description="Hoje"
            data-testid="stat-total-vendido"
          />
          <StatsCard
            title="Ticket Médio"
            value={`R$ ${ticketMedio.toFixed(2)}`}
            icon={DollarSign}
            description="Por transação"
            data-testid="stat-ticket-medio"
          />
        </div>

        {/* Scanner de QR e formulário de venda */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <QRCodeScanner onScan={handleScan} isLoading={isConsultingSaldo} />
          <RegistrarVendaForm
            carteiraDetectada={
              carteiraDetectada
                ? {
                    numeroCarteira: carteiraDetectada.numeroCarteira,
                    saldoAtual: parseFloat(carteiraDetectada.saldo),
                  }
                : undefined
            }
            onRegistrarVenda={handleRegistrarVenda}
            isLoading={registrarVendaMutation.isPending}
          />
        </div>

        {/* Histórico de vendas */}
        <TransactionHistory transactions={transactions} title="Vendas Recentes" />
      </main>
    </div>
  );
}
