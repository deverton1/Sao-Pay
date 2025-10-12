import CRUDTable, { CRUDTableColumn } from "../CRUDTable";
import { Badge } from "@/components/ui/badge";

interface Barraca {
  id: number;
  nome: string;
  responsavel: string;
  telefone: string;
  status: "ativo" | "inativo";
}

export default function CRUDTableExample() {
  const mockBarracas: Barraca[] = [
    { id: 1, nome: "Barraca do Pastel", responsavel: "João Silva", telefone: "(11) 98765-4321", status: "ativo" },
    { id: 2, nome: "Barraca de Bebidas", responsavel: "Maria Santos", telefone: "(11) 97654-3210", status: "ativo" },
    { id: 3, nome: "Doces e Salgados", responsavel: "Pedro Costa", telefone: "(11) 96543-2109", status: "inativo" },
  ];

  const columns: CRUDTableColumn<Barraca>[] = [
    { key: "nome", label: "Nome da Barraca" },
    { key: "responsavel", label: "Responsável" },
    { key: "telefone", label: "Telefone" },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge variant={item.status === "ativo" ? "default" : "secondary"}>
          {item.status === "ativo" ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-8">
      <CRUDTable
        title="Gerenciar Barracas"
        description="Visualize e gerencie todas as barracas cadastradas"
        data={mockBarracas}
        columns={columns}
        onAdd={() => console.log("Adicionar barraca")}
        onEdit={(item) => console.log("Editar barraca:", item)}
        onDelete={(item) => console.log("Deletar barraca:", item)}
        searchPlaceholder="Buscar por nome, responsável..."
        addButtonLabel="Nova Barraca"
      />
    </div>
  );
}
