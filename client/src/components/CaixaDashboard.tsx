import { useState } from "react";
import { LogOut, Wallet, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import StatsCard from "./StatsCard";
import EmitirCarteiraForm from "./EmitirCarteiraForm";
import QRCodeDisplay from "./QRCodeDisplay";
import TransactionHistory from "./TransactionHistory";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Carteira, VendaCaixa } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CaixaDashboardProps {
 nomeUsuario: string;
 onLogout: () => void;
}

export default function CaixaDashboard({ nomeUsuario, onLogout }: CaixaDashboardProps) {
 const [carteiraGerada, setCarteiraGerada] = useState<Carteira | null>(null);
 const { toast } = useToast();

 const { data: emissoes = [] } = useQuery<VendaCaixa[]>({
  queryKey: ["/api/caixa/emissoes"],
 });

 const { data: carteiras = [] } = useQuery<Carteira[]>({
  queryKey: ["/api/caixa/carteiras"],
  queryFn: async () => apiRequest("/api/caixa/carteiras"),
 });

 const emitirCarteiraMutation = useMutation({
  mutationFn: async (data: { valor: number; senhaRecuperacao: string; atendenteNome?: string }) => {
   return apiRequest("/api/caixa/emitir-carteira", {
    method: "POST",
    body: JSON.stringify(data),
   });
  },
  onSuccess: (carteira: Carteira) => {
   if (!carteira || !carteira.numeroCarteira) {
    toast({
     title: "Erro",
     description: "Carteira inválida recebida do servidor",
     variant: "destructive",
    });
    return;
   }

   queryClient.invalidateQueries({ queryKey: ["/api/caixa/emissoes"] });
   queryClient.invalidateQueries({ queryKey: ["/api/caixa/carteiras"] });
   setCarteiraGerada(carteira);

   toast({
    title: "Carteira emitida",
    description: `Número: ${carteira.numeroCarteira}`,
   });
  },
  onError: (error: any) => {
   toast({
    title: "Erro",
    description: error?.message || "Erro ao emitir carteira",
    variant: "destructive",
   });
  },
 });

 const handleEmitirCarteira = (valor: number, senha: string) => {
  emitirCarteiraMutation.mutate({
   valor,
   senhaRecuperacao: senha,
   atendenteNome: nomeUsuario,
  });
 };

 const hoje = new Date();
 hoje.setHours(0, 0, 0, 0);
 const emissoesHoje = emissoes.filter((e) => new Date(e.dataVenda || 0) >= hoje);
 const valorTotalHoje = emissoesHoje.reduce((acc, e) => acc + Number(e.valorCarregado || 0),0);

 const ultimaEmissao = emissoes.length > 0 ? emissoes[emissoes.length - 1] : null;
 const tempoUltimaEmissao = ultimaEmissao
  ? formatDistanceToNow(new Date(ultimaEmissao.dataVenda || 0), { locale: ptBR, addSuffix: true })
  : "-";

 const transactions = emissoes.map((e) => ({
  id: e.id,
  numeroCarteira: e.numeroCarteira || "",
  tipo: "emissao" as const,
  valor: Number(e.valorCarregado || 0),
  data: e.dataVenda?.toString() || new Date().toISOString(),
 }));

 return (
  <div className="min-h-screen bg-background">
   <header className="border-b bg-card sticky top-0 z-50">
    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
     <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary-caixa flex items-center justify-center">
       <Wallet className="w-5 h-5 text-white" />
      </div>
      <div>
       <h1 className="font-bold text-lg">São Pay - Caixa</h1>
       <p className="text-sm text-muted-foreground">{nomeUsuario}</p>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
     <StatsCard
      title="Carteiras Emitidas Hoje"
      value={emissoes.length}
      icon={Wallet}
      description="Total de emissões"
      data-testid="stat-carteiras-hoje"
     />
     <StatsCard
      title="Valor Total Emitido Hoje"
      value={`R$ ${valorTotalHoje.toFixed(2)}`}
      icon={TrendingUp}
      description="Hoje"
      data-testid="stat-valor-hoje"
     />
     <StatsCard
      title="Última Emissão"
      value={emissoes.length > 0 ? tempoUltimaEmissao : "-"}
      icon={Clock}
      description="Tempo decorrido"
      data-testid="stat-ultima-emissao"
     />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
     <div className="space-y-6">
      <EmitirCarteiraForm
       onEmit={handleEmitirCarteira}
       isLoading={emitirCarteiraMutation.isPending}
      />
     </div>

     <div>
      {carteiraGerada && carteiraGerada.numeroCarteira ? (
       <QRCodeDisplay
        numeroCarteira={carteiraGerada.numeroCarteira}
        saldo={Number(carteiraGerada.saldo) || 0}
       />
      ) : (
       <div className="h-full flex items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
        Emita uma carteira para visualizar o QR Code
       </div>
      )}
     </div>
    </div>
    <TransactionHistory transactions={transactions} title="Emissões Recentes" />
   </main>
  </div>
 );
}