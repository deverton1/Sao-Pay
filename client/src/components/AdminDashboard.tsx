import { useState } from "react";
import { Shield, Users, Store, Wallet, TrendingUp, Activity, LogOut, Plus } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ThemeToggle from "./ThemeToggle";
import StatsCard from "./StatsCard";
import CRUDTable, { CRUDTableColumn } from "./CRUDTable";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Usuario, Responsavel } from "@shared/schema";

interface AdminDashboardProps {
  nomeUsuario: string;
  onLogout: () => void;
}

interface UsuarioComResponsavel extends Usuario {
  responsaveis: Array<Responsavel>;
}

export default function AdminDashboard({ nomeUsuario, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UsuarioComResponsavel | null>(null);
  const [formData, setFormData] = useState({
    tipo: "caixa" as "caixa" | "barraca",
    login: "",
    senha: "",
    nome: "",
    email: "",
    telefone: "",
    responsavelNome: "",
    responsavelCpf: "",
    responsavelTelefone: "",
    responsavelEmail: "",
  });

  const { toast } = useToast();
  const token = localStorage.getItem("sao-pay-token");

  // ======== QUERIES =========

  const { data: estatisticas } = useQuery({
    queryKey: ["/api/admin/estatisticas"],
    queryFn: async () => {
      const res = await fetch("/api/admin/estatisticas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar estatísticas");
      return res.json();
    },
  });

  const { data: caixas = [], isLoading: isLoadingCaixas } = useQuery<UsuarioComResponsavel[]>({
    queryKey: ["/api/admin/usuarios", "caixa"],
    queryFn: async () => {
      const response = await fetch("/api/admin/usuarios?tipo=caixa", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao buscar caixas");
      return response.json();
    },
  });

  const { data: barracas = [], isLoading: isLoadingBarracas } = useQuery<UsuarioComResponsavel[]>({
    queryKey: ["/api/admin/usuarios", "barraca"],
    queryFn: async () => {
      const response = await fetch("/api/admin/usuarios?tipo=barraca", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao buscar barracas");
      return response.json();
    },
  });

  // ======== MUTATIONS =========

  const createUsuarioMutation = useMutation({
    mutationFn: async (data: any) =>
      apiRequest("/api/admin/usuarios", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/usuarios"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/estatisticas"] });
      toast({ title: "Sucesso", description: "Usuário criado com sucesso" });
      handleDialogClose();
    },
    onError: (error: any) =>
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar usuário",
        variant: "destructive",
      }),
  });

  const updateUsuarioMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/admin/usuarios/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/usuarios"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/estatisticas"] });
      toast({ title: "Sucesso", description: "Usuário atualizado com sucesso" });
      handleDialogClose();
    },
    onError: (error: any) =>
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário",
        variant: "destructive",
      }),
  });

  const deleteUsuarioMutation = useMutation({
    mutationFn: async (id: number) =>
      apiRequest(`/api/admin/usuarios/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/usuarios"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/estatisticas"] });
      toast({ title: "Sucesso", description: "Usuário removido com sucesso" });
    },
    onError: (error: any) =>
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover usuário",
        variant: "destructive",
      }),
  });

  // ======== HELPERS =========

  const resetForm = () => {
    setFormData({
      tipo: "caixa",
      login: "",
      senha: "",
      nome: "",
      email: "",
      telefone: "",
      responsavelNome: "",
      responsavelCpf: "",
      responsavelTelefone: "",
      responsavelEmail: "",
    });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingItem(null);
    resetForm();
  };

  const handleAdd = (tipo: "caixa" | "barraca") => {
    setEditingItem(null);
    resetForm();
    setFormData((prev) => ({ ...prev, tipo }));
    setDialogOpen(true);
  };

  const handleEdit = (item: UsuarioComResponsavel) => {
    const responsavel = item.responsaveis?.[0];
    setEditingItem(item);
    setFormData({
      tipo: item.tipo as "caixa" | "barraca",
      login: item.login,
      senha: "",
      nome: item.nome,
      email: item.email || "",
      telefone: item.telefone || "",
      responsavelNome: responsavel?.nome || "",
      responsavelCpf: responsavel?.cpf || "",
      responsavelTelefone: responsavel?.telefone || "",
      responsavelEmail: responsavel?.email || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.login || !formData.nome) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha login e nome",
        variant: "destructive",
      });
      return;
    }

    if (!editingItem && !formData.senha) {
      toast({
        title: "Senha obrigatória",
        description: "Informe uma senha para o novo usuário",
        variant: "destructive",
      });
      return;
    }

    const payload: any = {
      tipo: formData.tipo,
      login: formData.login,
      nome: formData.nome,
      email: formData.email || undefined,
      telefone: formData.telefone || undefined,
    };

    if (formData.senha) payload.senha = formData.senha;

    if (formData.responsavelNome) {
      payload.responsavel = {
        nome: formData.responsavelNome,
        cpf: formData.responsavelCpf || undefined,
        telefone: formData.responsavelTelefone || undefined,
        email: formData.responsavelEmail || undefined,
      };
    }

    if (editingItem) {
      updateUsuarioMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createUsuarioMutation.mutate(payload);
    }
  };

  // ======== COLUMNS =========

  const caixasColumns: CRUDTableColumn<UsuarioComResponsavel>[] = [
    { key: "nome", label: "Nome do Caixa" },
    { key: "responsaveis", label: "Responsável", render: (item) => item.responsaveis?.[0]?.nome || "-" },
    { key: "email", label: "Email", render: (item) => item.email || "-" },
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

  const barracasColumns: CRUDTableColumn<UsuarioComResponsavel>[] = [
    { key: "nome", label: "Nome da Barraca" },
    { key: "responsaveis", label: "Responsável", render: (item) => item.responsaveis?.[0]?.nome || "-" },
    { key: "telefone", label: "Telefone", render: (item) => item.telefone || "-" },
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

  const sidebarStyle = { "--sidebar-width": "16rem" } as React.CSSProperties;

  // ======== RENDER =========

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary-admin flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold">São Pay</h2>
                <Badge variant="secondary" className="text-xs">Admin</Badge>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab("overview")}
                  data-active={activeTab === "overview"}
                  className="data-[active=true]:bg-sidebar-accent"
                >
                  <Activity className="w-4 h-4" />
                  <span>Visão Geral</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab("caixas")}
                  data-active={activeTab === "caixas"}
                  className="data-[active=true]:bg-sidebar-accent"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Caixas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveTab("barracas")}
                  data-active={activeTab === "barracas"}
                  className="data-[active=true]:bg-sidebar-accent"
                >
                  <Store className="w-4 h-4" />
                  <span>Barracas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-medium">{nomeUsuario}</p>
                <p className="text-muted-foreground text-xs">Administrador</p>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-card">
            <SidebarTrigger />
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Visão Geral</h1>
                  <p className="text-muted-foreground">Dashboard administrativo do sistema</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatsCard
                    title="Total em Carteiras"
                    value={estatisticas ? `R$ ${estatisticas.saldoTotal.toFixed(2)}` : "R$ 0,00"}
                    icon={Wallet}
                    description={`${estatisticas?.carteirasAtivas || 0} carteiras ativas`}
                  />
                  <StatsCard
                    title="Caixas Ativos"
                    value={estatisticas?.caixasAtivos || 0}
                    icon={Users}
                    description={`De ${estatisticas?.totalCaixas || 0} cadastrados`}
                  />
                  <StatsCard
                    title="Barracas Ativas"
                    value={estatisticas?.barracasAtivas || 0}
                    icon={Store}
                    description={`De ${estatisticas?.totalBarracas || 0} cadastradas`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatsCard
                    title="Total Emitido"
                    value={`R$ ${estatisticas?.totalEmitido ? estatisticas.totalEmitido.toFixed(2) : "0,00"}`}
                    icon={TrendingUp}
                    description={`${estatisticas?.totalTransacoes || 0} transações`}
                  />
                  <StatsCard
                    title="Total Vendido"
                    value={estatisticas ? `R$ ${estatisticas.totalVendido.toFixed(2)}` : "R$ 0,00"}
                    icon={Wallet}
                    description="Vendas nas barracas"
                  />
                </div>
              </div>
            )}

            {activeTab === "caixas" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Gerenciar Caixas</h1>
                    <p className="text-muted-foreground">Cadastre e gerencie os caixas do sistema</p>
                  </div>
                  <Button onClick={() => handleAdd("caixa")}>
                    <Plus className="w-4 h-4" />
                    <span>Novo Caixa</span>
                  </Button>
                </div>
                <CRUDTable
                  title="Caixas Cadastrados"
                  data={caixas}
                  columns={caixasColumns}
                  onEdit={handleEdit}
                  onDelete={(item) => {
                    if (confirm(`Tem certeza que deseja remover ${item.nome}?`)) {
                      deleteUsuarioMutation.mutate(item.id);
                    }
                  }}
                  searchPlaceholder="Buscar por nome, responsável..."
                />
              </div>
            )}

            {activeTab === "barracas" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Gerenciar Barracas</h1>
                    <p className="text-muted-foreground">Cadastre e gerencie as barracas do sistema</p>
                  </div>
                  <Button onClick={() => handleAdd("barraca")}>
                    <Plus className="w-4 h-4" />
                    <span>Nova Barraca</span>
                  </Button>
                </div>
                <CRUDTable
                  title="Barracas Cadastradas"
                  data={barracas}
                  columns={barracasColumns}
                  onEdit={handleEdit}
                  onDelete={(item) => {
                    if (confirm(`Tem certeza que deseja remover ${item.nome}?`)) {
                      deleteUsuarioMutation.mutate(item.id);
                    }
                  }}
                  searchPlaceholder="Buscar por nome, responsável..."
                />
              </div>
            )}
          </main>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? `Editar ${formData.tipo === "caixa" ? "Caixa" : "Barraca"}`
                : `Novo ${formData.tipo === "caixa" ? "Caixa" : "Barraca"}`}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados {editingItem ? "para atualizar" : "do novo"} {formData.tipo}
            </DialogDescription>
          </DialogHeader>

          {/* FORMULARIO */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Dados de Acesso</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="login">Login *</Label>
                  <Input
                    id="login"
                    value={formData.login}
                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                    disabled={!!editingItem}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha {!editingItem && "*"}</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    placeholder={editingItem ? "Deixe em branco para manter" : ""}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">
                Dados {formData.tipo === "caixa" ? "do Caixa" : "da Barraca"}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Responsável</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavel-nome">Nome do Responsável</Label>
                  <Input
                    id="responsavel-nome"
                    value={formData.responsavelNome}
                    onChange={(e) => setFormData({ ...formData, responsavelNome: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsavel-cpf">CPF</Label>
                    <Input
                      id="responsavel-cpf"
                      value={formData.responsavelCpf}
                      onChange={(e) => setFormData({ ...formData, responsavelCpf: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsavel-telefone">Telefone</Label>
                    <Input
                      id="responsavel-telefone"
                      value={formData.responsavelTelefone}
                      onChange={(e) =>
                        setFormData({ ...formData, responsavelTelefone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsavel-email">Email</Label>
                  <Input
                    id="responsavel-email"
                    type="email"
                    value={formData.responsavelEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, responsavelEmail: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createUsuarioMutation.isPending || updateUsuarioMutation.isPending}
            >
              {createUsuarioMutation.isPending || updateUsuarioMutation.isPending
                ? "Salvando..."
                : editingItem
                ? "Atualizar"
                : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
