import { storage } from "./storage";
import { hashPassword } from "./utils/auth";

export async function initializeData() {
  try {
    // Verificar se já tem dados
    const usuarios = await storage.listUsuarios();
    if (usuarios.length > 0) {
      console.log("✅ Dados já inicializados");
      return;
    }

    console.log("🔄 Inicializando dados de teste...");

    // Criar Admin
    const senhaHashAdmin = await hashPassword("123456");
    const admin = await storage.createUsuario({
      tipo: "admin",
      login: "admin",
      senhaHash: senhaHashAdmin,
      nome: "Administrador Sistema",
      email: "admin@igreja.com",
      telefone: "(11) 99999-9999",
      status: "ativo",
    });

    await storage.createResponsavel({
      usuarioId: admin.id,
      nome: "José Administrador",
      cpf: "123.456.789-00",
      telefone: "(11) 99999-9999",
      email: "admin@igreja.com",
    });

    // Criar Caixas
    const senhaHashCaixa = await hashPassword("123456");
    
    const caixa1 = await storage.createUsuario({
      tipo: "caixa",
      login: "caixa1",
      senhaHash: senhaHashCaixa,
      nome: "Caixa Principal",
      email: "caixa1@igreja.com",
      telefone: "(11) 98888-8888",
      status: "ativo",
    });

    await storage.createResponsavel({
      usuarioId: caixa1.id,
      nome: "Ana Silva",
      cpf: "234.567.890-11",
      telefone: "(11) 98888-8888",
      email: "ana@igreja.com",
    });

    const caixa2 = await storage.createUsuario({
      tipo: "caixa",
      login: "caixa2",
      senhaHash: senhaHashCaixa,
      nome: "Caixa Secundário",
      email: "caixa2@igreja.com",
      telefone: "(11) 97777-7777",
      status: "ativo",
    });

    await storage.createResponsavel({
      usuarioId: caixa2.id,
      nome: "Carlos Santos",
      cpf: "345.678.901-22",
      telefone: "(11) 97777-7777",
      email: "carlos@igreja.com",
    });

    // Criar Barracas
    const senhaHashBarraca = await hashPassword("123456");

    const barraca1 = await storage.createUsuario({
      tipo: "barraca",
      login: "barraca1",
      senhaHash: senhaHashBarraca,
      nome: "Barraca do Pastel",
      email: "email@exemplo.com",
      telefone: "(11) 96666-6666",
      status: "ativo",
    });

    await storage.createResponsavel({
      usuarioId: barraca1.id,
      nome: "João Silva",
      cpf: "456.789.012-33",
      telefone: "(11) 96666-6666",
      email: "joao@pastel.com",
    });

    const barraca2 = await storage.createUsuario({
      tipo: "barraca",
      login: "barraca2",
      senhaHash: senhaHashBarraca,
      nome: "Barraca de Bebidas",
      email: "email@email.com",
      telefone: "(11) 95555-5555",
      status: "ativo",
    });

    await storage.createResponsavel({
      usuarioId: barraca2.id,
      nome: "Maria Santos",
      cpf: "567.890.123-44",
      telefone: "(11) 95555-5555",
      email: "maria@bebidas.com",
    });

    const barraca3 = await storage.createUsuario({
      tipo: "barraca",
      login: "barraca3",
      senhaHash: senhaHashBarraca,
      nome: "Doces e Salgados",
      email: "emai21l@email.com",
      telefone: "(11) 94444-4444",
      status: "ativo",
    });

    await storage.createResponsavel({
      usuarioId: barraca3.id,
      nome: "Pedro Costa",
      cpf: "678.901.234-55",
      telefone: "(11) 94444-4444",
      email: "pedro@doces.com",
    });

    console.log("✅ Dados inicializados com sucesso!");
    console.log("\n📝 Credenciais de acesso:");
    console.log("Admin: login=admin, senha=123456");
    console.log("Caixa1: login=caixa1, senha=123456");
    console.log("Caixa2: login=caixa2, senha=123456");
    console.log("Barraca1: login=barraca1, senha=123456");
    console.log("Barraca2: login=barraca2, senha=123456");
    console.log("Barraca3: login=barraca3, senha=123456\n");
  } catch (error) {
    console.error("❌ Erro ao inicializar dados:", error);
  }
}
