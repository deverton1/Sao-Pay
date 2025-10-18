// storage.ts
import { Pool } from "pg";
import "dotenv/config";

export type UsuarioTipo = "admin" | "caixa" | "barraca";
export type UsuarioStatus = "ativo" | "inativo";

export interface Usuario {
  id: number;
  tipo: UsuarioTipo;
  login: string;
  nome: string;
  email: string;
  telefone: string;
  senhaHash: string;
  status: UsuarioStatus;
  dataCriacao: Date;
}

export interface Responsavel {
  id: number;
  usuarioId: number;
  nome: string;
  email?: string;
  telefone?: string;
  cpf?: string;
}

export interface Carteira {
  numeroCarteira: string;
  saldo: number;
  saldoInicial: number;
  senhaRecuperacaoHash: string;
  status: "ativo" | "inativo";
  caixaId: number;
  atendenteNome: string;
}

export interface VendaCaixa {
  id: number;
  numeroCarteira: string;
  valorCarregado: number;
  caixaId: number;
  atendenteNome: string;
  dataVenda: Date | string;
}

export interface VendaBarraca {
  id: number;
  numeroCarteira: string;
  barracaId: number;
  valorCompra: number;
  saldoAnterior: number;
  saldoRestante: number;
  dataCompra: Date | string;
}

class PostgresStorage {
  private pool: Pool;

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ||
      "postgres://postgres:1234@localhost:5432/saobenedito";

    this.pool = new Pool({
      connectionString,
      ssl: connectionString.includes("render.com") ? { rejectUnauthorized: false } : false,
    });
  }

  // ===============================
  // USUÁRIOS
  // ===============================
  async getUsuarioByLogin(login: string, tipo?: UsuarioTipo): Promise<Usuario | undefined> {
    const query = tipo
      ? `SELECT * FROM usuarios WHERE login=$1 AND tipo=$2`
      : `SELECT * FROM usuarios WHERE login=$1`;
    const values = tipo ? [login, tipo] : [login];
    const res = await this.pool.query(query, values);
    return res.rows[0] ? this.formatUsuario(res.rows[0]) : undefined;
  }

  async listUsuarios(tipo?: UsuarioTipo): Promise<Usuario[]> {
    const query = tipo ? `SELECT * FROM usuarios WHERE tipo=$1` : `SELECT * FROM usuarios`;
    const values = tipo ? [tipo] : [];
    const res = await this.pool.query(query, values);
    return res.rows.map(this.formatUsuario);
  }

  async createUsuario(data: Omit<Usuario, "id" | "dataCriacao">): Promise<Usuario> {
    const { tipo, login, nome, email, telefone, senhaHash, status } = data;
    const res = await this.pool.query(
      `INSERT INTO usuarios (tipo, login, nome, email, telefone, senha_hash, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [tipo, login, nome, email, telefone, senhaHash, status]
    );
    return this.formatUsuario(res.rows[0]);
  }

  async updateUsuario(id: number, data: Partial<Omit<Usuario, "id" | "dataCriacao">>): Promise<Usuario | undefined> {
    const fields = Object.keys(data);
    if (!fields.length) return undefined;

    const setString = fields.map((f, idx) => `"${f}"=$${idx + 1}`).join(",");
    const values = Object.values(data);
    values.push(id.toString());

    const res = await this.pool.query(
      `UPDATE usuarios SET ${setString} WHERE id=$${values.length} RETURNING *`,
      values
    );
    return res.rows[0] ? this.formatUsuario(res.rows[0]) : undefined;
  }

  async deleteUsuario(id: number): Promise<boolean> {
    const res = await this.pool.query(`DELETE FROM usuarios WHERE id=$1`, [id]);
    return res.rowCount > 0;
  }

  // ===============================
  // RESPONSÁVEIS
  // ===============================
  async getResponsaveisByUsuario(usuarioId: number): Promise<Responsavel[]> {
    const res = await this.pool.query(`SELECT * FROM responsaveis WHERE usuario_id=$1`, [usuarioId]);
    return res.rows;
  }

  async createResponsavel(data: Omit<Responsavel, "id">): Promise<Responsavel> {
    const { usuarioId, nome, email, telefone, cpf } = data;
    const res = await this.pool.query(
      `INSERT INTO responsaveis (usuario_id, nome, email, telefone, cpf)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [usuarioId, nome, email || null, telefone || null, cpf || null]
    );
    return res.rows[0];
  }

  // ===============================
  // CARTEIRAS
  // ===============================
  async listCarteiras(): Promise<Carteira[]> {
    const res = await this.pool.query(`SELECT * FROM carteiras`);
    return res.rows.map(row => this.formatCarteira(row));
  }

  async listCarteirasByCaixa(caixaId: number): Promise<Carteira[]> {
    const res = await this.pool.query(`SELECT * FROM carteiras WHERE caixa_id=$1`, [caixaId]);
    return res.rows.map(row => this.formatCarteira(row));
  }

  async createCarteira(data: Omit<Carteira, "status"> & { status?: "ativo" | "inativo" }): Promise<Carteira> {
    const { numeroCarteira, saldo, saldoInicial, senhaRecuperacaoHash, caixaId, atendenteNome, status = "ativo" } = data;
    const res = await this.pool.query(
      `INSERT INTO carteiras (numero_carteira, saldo, saldo_inicial, senha_recuperacao_hash, caixa_id, atendente_nome, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [numeroCarteira, saldo, saldoInicial, senhaRecuperacaoHash, caixaId, atendenteNome, status]
    );
    return this.formatCarteira(res.rows[0]);
  }

  async updateCarteira(numeroCarteira: string, data: Partial<Omit<Carteira, "numeroCarteira">>): Promise<Carteira | undefined> {
    const fields = Object.keys(data);
    if (!fields.length) return undefined;

    const setString = fields.map((f, idx) => `"${f}"=$${idx + 1}`).join(",");
    const values = Object.values(data);
    values.push(numeroCarteira);

    const res = await this.pool.query(
      `UPDATE carteiras SET ${setString} WHERE numero_carteira=$${values.length} RETURNING *`,
      values
    );
    return res.rows[0] ? this.formatCarteira(res.rows[0]) : undefined;
  }

  async getCarteiraByNumero(numeroCarteira: string): Promise<Carteira | undefined> {
    const res = await this.pool.query(`SELECT * FROM carteiras WHERE numero_carteira=$1`, [numeroCarteira]);
    return res.rows[0] ? this.formatCarteira(res.rows[0]) : undefined;
  }

  // ===============================
  // VENDAS CAIXA
  // ===============================
  async listVendasCaixa(caixaId?: number): Promise<VendaCaixa[]> {
    const res = caixaId
      ? await this.pool.query(`SELECT * FROM vendas_caixa WHERE caixa_id=$1`, [caixaId])
      : await this.pool.query(`SELECT * FROM vendas_caixa`);
    return res.rows.map(row => this.formatVendaCaixa(row));
  }

  async createVendaCaixa(data: Omit<VendaCaixa, "id" | "dataVenda">): Promise<VendaCaixa> {
    const { numeroCarteira, valorCarregado, caixaId, atendenteNome } = data;
    const res = await this.pool.query(
      `INSERT INTO vendas_caixa (numero_carteira, valor_carregado, caixa_id, atendente_nome)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [numeroCarteira, valorCarregado, caixaId, atendenteNome]
    );
    return this.formatVendaCaixa(res.rows[0]);
  }

  // ===============================
  // VENDAS BARRACAS
  // ===============================
  async listVendasBarraca(barracaId?: number): Promise<VendaBarraca[]> {
    const res = barracaId
      ? await this.pool.query(`SELECT * FROM vendas_barracas WHERE barraca_id=$1`, [barracaId])
      : await this.pool.query(`SELECT * FROM vendas_barracas`);
    return res.rows.map(row => this.formatVendaBarraca(row));
  }

  async createVendaBarraca(data: Omit<VendaBarraca, "id" | "dataCompra">): Promise<VendaBarraca> {
    const { numeroCarteira, barracaId, valorCompra, saldoAnterior, saldoRestante } = data;
    const res = await this.pool.query(
      `INSERT INTO vendas_barracas (numero_carteira, barraca_id, valor_compra, saldo_anterior, saldo_restante)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [numeroCarteira, barracaId, valorCompra, saldoAnterior, saldoRestante]
    );
    return this.formatVendaBarraca(res.rows[0]);
  }

  // ===============================
  // HELPERS
  // ===============================
  private formatUsuario(row: any): Usuario {
    return {
      id: row.id,
      tipo: row.tipo,
      login: row.login,
      nome: row.nome,
      email: row.email,
      telefone: row.telefone,
      senhaHash: row.senha_hash,
      status: row.status,
      dataCriacao: row.data_criacao,
    };
  }

  private formatCarteira(row: any): Carteira {
    return {
      numeroCarteira: row.numero_carteira,
      saldo: parseFloat(row.saldo),
      saldoInicial: parseFloat(row.saldo_inicial),
      senhaRecuperacaoHash: row.senha_recuperacao_hash,
      status: row.status,
      caixaId: row.caixa_id,
      atendenteNome: row.atendente_nome,
    };
  }

  private formatVendaCaixa(row: any): VendaCaixa {
    return {
      id: row.id,
      numeroCarteira: row.numero_carteira,
      valorCarregado: parseFloat(row.valor_carregado),
      caixaId: row.caixa_id,
      atendenteNome: row.atendente_nome,
      dataVenda: row.data_venda,
    };
  }

  private formatVendaBarraca(row: any): VendaBarraca {
    return {
      id: row.id,
      numeroCarteira: row.numero_carteira,
      barracaId: row.barraca_id,
      valorCompra: parseFloat(row.valor_compra),
      saldoAnterior: parseFloat(row.saldo_anterior),
      saldoRestante: parseFloat(row.saldo_restante),
      dataCompra: row.data_compra,
    };
  }
}

export const storage = new PostgresStorage();
