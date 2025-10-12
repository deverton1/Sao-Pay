import StatsCard from "../StatsCard";
import { Wallet, TrendingUp, Users } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <StatsCard
        title="Total em Carteiras"
        value="R$ 12.450,00"
        icon={Wallet}
        description="Saldo ativo total"
        trend={{ value: 12.5, isPositive: true }}
      />
      <StatsCard
        title="Vendas Hoje"
        value="R$ 3.280,00"
        icon={TrendingUp}
        description="89 transações"
      />
      <StatsCard
        title="Barracas Ativas"
        value={15}
        icon={Users}
        description="De 18 cadastradas"
      />
    </div>
  );
}
