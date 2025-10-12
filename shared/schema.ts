import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  decimal,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// -----------------------------
// TABELAS
// -----------------------------

// Usuários (admin, caixas, barracas)
export const usuarios = pgTable("usuarios", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tipo: text("tipo").notNull(), // 'admin' | 'caixa' | 'barraca'
  login: text("login").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  nome: text("nome").notNull(),
  email: text("email"),
  telefone: text("telefone"),
  status: text("status").notNull().default("ativo"), // 'ativo' | 'inativo'
  dataCriacao: timestamp("data_criacao").defaultNow(),
});

// Responsáveis
export const responsaveis = pgTable("responsaveis", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  usuarioId: integer("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  cpf: text("cpf"),
  telefone: text("telefone"),
  email: text("email"),
});

// Carteiras virtuais
export const carteiras = pgTable("carteiras", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  numeroCarteira: text("numero_carteira").notNull().unique(),
  saldo: decimal("saldo", { precision: 10, scale: 2 }).notNull(),
  saldoInicial: decimal("saldo_inicial", { precision: 10, scale: 2 }).notNull(),
  senhaRecuperacaoHash: text("senha_recuperacao_hash"),
  status: text("status").notNull().default("ativo"), // 'ativo' | 'usado' | 'expirado'
  dataEmissao: timestamp("data_emissao").defaultNow(),
  dataValidade: timestamp("data_validade"),
  caixaId: integer("caixa_id").references(() => usuarios.id),
  atendenteNome: text("atendente_nome"),
});

// Vendas no caixa
export const vendasCaixa = pgTable("vendas_caixa", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  numeroCarteira: text("numero_carteira")
    .notNull()
    .references(() => carteiras.numeroCarteira),
  valorCarregado: decimal("valor_carregado", { precision: 10, scale: 2 }).notNull(),
  dataVenda: timestamp("data_venda").defaultNow(),
  caixaId: integer("caixa_id").references(() => usuarios.id),
  atendenteNome: text("atendente_nome"),
});

// Vendas nas barracas
export const vendasBarracas = pgTable("vendas_barracas", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  numeroCarteira: text("numero_carteira")
    .notNull()
    .references(() => carteiras.numeroCarteira),
  barracaId: integer("barraca_id").notNull().references(() => usuarios.id),
  valorCompra: decimal("valor_compra", { precision: 10, scale: 2 }).notNull(),
  saldoAnterior: decimal("saldo_anterior", { precision: 10, scale: 2 }).notNull(),
  saldoRestante: decimal("saldo_restante", { precision: 10, scale: 2 }).notNull(),
  dataCompra: timestamp("data_compra").defaultNow(),
});

// -----------------------------
// SCHEMAS DE INSERÇÃO
// -----------------------------
export const insertUsuarioSchema = createInsertSchema(usuarios);
export const insertResponsavelSchema = createInsertSchema(responsaveis);
export const insertCarteiraSchema = createInsertSchema(carteiras);
export const insertVendaCaixaSchema = createInsertSchema(vendasCaixa);
export const insertVendaBarracaSchema = createInsertSchema(vendasBarracas);

// -----------------------------
// TIPOS TS
// -----------------------------
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;
export type Usuario = typeof usuarios.$inferSelect;

export type InsertResponsavel = z.infer<typeof insertResponsavelSchema>;
export type Responsavel = typeof responsaveis.$inferSelect;

export type InsertCarteira = z.infer<typeof insertCarteiraSchema>;
export type Carteira = typeof carteiras.$inferSelect;

export type InsertVendaCaixa = z.infer<typeof insertVendaCaixaSchema>;
export type VendaCaixa = typeof vendasCaixa.$inferSelect;

export type InsertVendaBarraca = z.infer<typeof insertVendaBarracaSchema>;
export type VendaBarraca = typeof vendasBarracas.$inferSelect;

// -----------------------------
// SCHEMAS DE API
// -----------------------------
export const loginSchema = z.object({
  login: z.string().min(3),
  senha: z.string().min(4),
  tipo: z.enum(["admin", "caixa", "barraca"]),
});

export const emitirCarteiraSchema = z.object({
  valor: z.number().positive(),
  senhaRecuperacao: z.string().min(4),
  atendenteNome: z.string().optional(),
});

export const registrarVendaSchema = z.object({
  numeroCarteira: z.string(),
  valorCompra: z.number().positive(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type EmitirCarteiraInput = z.infer<typeof emitirCarteiraSchema>;
export type RegistrarVendaInput = z.infer<typeof registrarVendaSchema>;
