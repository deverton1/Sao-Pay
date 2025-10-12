import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage, UsuarioTipo } from "./storage";
import { hashPassword, verifyPassword, generateToken } from "./utils/auth";
import { requireAuth, requireRole, type AuthRequest } from "./middleware/auth";
import { loginSchema, emitirCarteiraSchema, registrarVendaSchema } from "@shared/schema";
import { nanoid } from "nanoid";
import { initializeData } from "./init-data";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(express.json());

  // Inicializar dados de teste
  await initializeData();

  // ============================================
  // ROTA DE AUTENTICAÇÃO
  // ============================================
  app.post("/api/auth/login", async (req, res) => {
    console.log(req.body)
    try {
      const { login, senha, tipo } = loginSchema.parse(req.body);

      const usuario = await storage.getUsuarioByLogin(login, tipo);
      if (!usuario) return res.status(401).json({ error: "Credenciais inválidas" });

      const senhaValida = await verifyPassword(senha, usuario.senhaHash);
      if (!senhaValida) return res.status(401).json({ error: "Credenciais inválidas" });

      if (usuario.status !== "ativo") return res.status(403).json({ error: "Usuário inativo" });

      const token = generateToken(usuario);
      const responsaveis = await storage.getResponsaveisByUsuario(usuario.id);

      res.json({
        token,
        usuario: {
          id: usuario.id,
          tipo: usuario.tipo,
          login: usuario.login,
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone,
          status: usuario.status,
        },
        responsaveis,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erro ao fazer login" });
    }
  });

  // ============================================
  // ROTAS DO ADMIN
  // ============================================

  // Listar todos os usuários
  app.get("/api/admin/usuarios", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const tipoRaw = req.query.tipo;
      const tipo: UsuarioTipo | undefined =
        tipoRaw === "admin" || tipoRaw === "caixa" || tipoRaw === "barraca" ? tipoRaw : undefined;

      const usuarios = await storage.listUsuarios(tipo);

      const usuariosComResponsaveis = await Promise.all(
        usuarios.map(async (usuario) => {
          const responsaveis = await storage.getResponsaveisByUsuario(usuario.id);
          return {
            ...usuario,
            responsaveis,
          };
        })
      );

      res.json(usuariosComResponsaveis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Criar usuário
  app.post("/api/admin/usuarios", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const { senha, responsavel, ...dadosUsuario } = req.body;

      if (!senha || senha.length < 4)
        return res.status(400).json({ error: "Senha deve ter no mínimo 4 caracteres" });

      const senhaHash = await hashPassword(senha);
      const usuario = await storage.createUsuario({
        ...dadosUsuario,
        senhaHash,
      });

      let responsavelCriado = null;
      if (responsavel) {
        responsavelCriado = await storage.createResponsavel({
          usuarioId: usuario.id,
          ...responsavel,
        });
      }

      res.status(201).json({
        ...usuario,
        responsaveis: responsavelCriado ? [responsavelCriado] : [],
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Atualizar usuário
  app.put("/api/admin/usuarios/:id", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { senha, ...dadosUsuario } = req.body;

      const dadosAtualizacao: any = { ...dadosUsuario };

      if (senha && senha.length >= 4) {
        dadosAtualizacao.senhaHash = await hashPassword(senha);
      }

      const usuario = await storage.updateUsuario(id, dadosAtualizacao);
      if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

      const responsaveis = await storage.getResponsaveisByUsuario(usuario.id);
      res.json({ ...usuario, responsaveis });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Deletar usuário
  app.delete("/api/admin/usuarios/:id", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const sucesso = await storage.deleteUsuario(id);
      if (!sucesso) return res.status(404).json({ error: "Usuário não encontrado" });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Estatísticas gerais (Admin)
  app.get("/api/admin/estatisticas", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const carteiras = await storage.listCarteiras();
      const caixas = await storage.listUsuarios("caixa");
      const barracas = await storage.listUsuarios("barraca");
      const vendasCaixa = await storage.listVendasCaixa();
      const vendasBarracas = await storage.listVendasBarraca();

      const saldoTotal = carteiras.reduce((acc, c) => acc + Number(c.saldo), 0);
      const totalEmitido = vendasCaixa.reduce((acc, v) => acc + Number(v.valorCarregado), 0);
      const totalVendido = vendasBarracas.reduce((acc, v) => acc + Number(v.valorCompra), 0);

      res.json({
        totalCarteiras: carteiras.length,
        carteirasAtivas: carteiras.filter(c => c.status === "ativo").length,
        saldoTotal,
        totalCaixas: caixas.length,
        caixasAtivos: caixas.filter(c => c.status === "ativo").length,
        totalBarracas: barracas.length,
        barracasAtivas: barracas.filter(c => c.status === "ativo").length,
        totalEmitido,
        totalVendido,
        totalTransacoes: vendasCaixa.length + vendasBarracas.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // ROTAS DO CAIXA
  // ============================================

  app.post("/api/caixa/emitir-carteira", requireAuth, requireRole("caixa"), async (req: AuthRequest, res) => {
    try {
      const { valor, senhaRecuperacao, atendenteNome } = emitirCarteiraSchema.parse(req.body);

      const numeroCarteira = `SP-${new Date().getFullYear()}-${nanoid(10).toUpperCase()}`;
      const senhaRecuperacaoHash = await hashPassword(senhaRecuperacao);

      // Cria a carteira
      const carteira = await storage.createCarteira({
        numeroCarteira,
        saldo: valor,
        saldoInicial: valor,
        senhaRecuperacaoHash,
        caixaId: req.user!.id,
        atendenteNome: atendenteNome || req.user!.nome,
        status: "ativo", // garante que o status exista
      });

      // Cria o registro da venda no caixa
      await storage.createVendaCaixa({
        numeroCarteira,
        valorCarregado: valor,
        caixaId: req.user!.id,
        atendenteNome: atendenteNome || req.user!.nome,
      });

      // Retorna apenas os campos que o frontend vai usar
      res.status(201).json({
        numeroCarteira: carteira.numeroCarteira,
        saldo: carteira.saldo,
        saldoInicial: carteira.saldoInicial,
        caixaId: carteira.caixaId,
        atendenteNome: carteira.atendenteNome,
        status: carteira.status,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erro ao emitir carteira" });
    }
  });


  app.get("/api/caixa/saldo/:numeroCarteira", requireAuth, requireRole("caixa"), async (req: AuthRequest, res) => {
    try {
      const carteira = await storage.getCarteiraByNumero(req.params.numeroCarteira);
      if (!carteira) return res.status(404).json({ error: "Carteira não encontrada" });

      res.json(carteira);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/caixa/emissoes", requireAuth, requireRole("caixa"), async (req: AuthRequest, res) => {
    try {
      const vendas = await storage.listVendasCaixa(req.user!.id);
      res.json(vendas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/caixa/carteiras", requireAuth, requireRole("caixa"), async (req: AuthRequest, res) => {
    try {
      const carteiras = await storage.listCarteirasByCaixa(req.user!.id);
      res.json(carteiras);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // ROTAS DA BARRACA
  // ============================================

  app.get("/api/barraca/saldo/:numeroCarteira", requireAuth, requireRole("barraca"), async (req: AuthRequest, res) => {
    try {
      const carteira = await storage.getCarteiraByNumero(req.params.numeroCarteira);
      if (!carteira) return res.status(404).json({ error: "Carteira não encontrada" });

      if (carteira.status !== "ativo") return res.status(400).json({ error: `Carteira está ${carteira.status}` });

      res.json(carteira);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/barraca/registrar-venda", requireAuth, requireRole("barraca"), async (req: AuthRequest, res) => {
    try {
      const { numeroCarteira, valorCompra } = registrarVendaSchema.parse(req.body);

      const carteira = await storage.getCarteiraByNumero(numeroCarteira);
      if (!carteira) return res.status(404).json({ error: "Carteira não encontrada" });

      if (carteira.status !== "ativo") return res.status(400).json({ error: `Carteira está ${carteira.status}` });

      const saldoAtual = Number(carteira.saldo);
      if (saldoAtual < valorCompra) return res.status(400).json({ error: "Saldo insuficiente" });

      const novoSaldo = saldoAtual - valorCompra;

      await storage.updateCarteira(numeroCarteira, { saldo: novoSaldo });

      const venda = await storage.createVendaBarraca({
        numeroCarteira,
        barracaId: req.user!.id,
        valorCompra,
        saldoAnterior: saldoAtual,
        saldoRestante: novoSaldo,
      });

      const carteiraAtualizada = await storage.getCarteiraByNumero(numeroCarteira);

      res.status(201).json({ venda, carteira: carteiraAtualizada });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/barraca/vendas", requireAuth, requireRole("barraca"), async (req: AuthRequest, res) => {
    try {
      const vendas = await storage.listVendasBarraca(req.user!.id);
      res.json(vendas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/barraca/abrir-camera/:numeroCarteira", requireAuth, requireRole("barraca"), async (req: AuthRequest, res) => {
    try {
      const { numeroCarteira } = req.params;
      const carteira = await storage.getCarteiraByNumero(numeroCarteira);

      if (!carteira) return res.status(404).json({ error: "Carteira não encontrada" });
      if (carteira.status !== "ativo") return res.status(400).json({ error: `Carteira está ${carteira.status}` });

      res.json({ ok: true, numeroCarteira: carteira.numeroCarteira, saldo: carteira.saldo, status: carteira.status });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/barraca/estatisticas", requireAuth, requireRole("barraca"), async (req: AuthRequest, res) => {
    try {
      const vendas = await storage.listVendasBarraca(req.user!.id);

      const totalVendido = vendas.reduce((acc, v) => acc + Number(v.valorCompra), 0);
      const ticketMedio = vendas.length > 0 ? totalVendido / vendas.length : 0;

      res.json({ totalVendas: vendas.length, totalVendido, ticketMedio });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
