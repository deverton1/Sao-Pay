import TransactionHistory from "../TransactionHistory";

export default function TransactionHistoryExample() {
  const mockTransactions = [
    {
      id: 1,
      numeroCarteira: "SP-2025-0001234",
      tipo: "emissao" as const,
      valor: 50.00,
      data: new Date().toISOString(),
    },
    {
      id: 2,
      numeroCarteira: "SP-2025-0001234",
      tipo: "compra" as const,
      valor: 15.50,
      saldoAnterior: 50.00,
      saldoRestante: 34.50,
      data: new Date(Date.now() - 3600000).toISOString(),
      local: "Barraca do Pastel",
    },
    {
      id: 3,
      numeroCarteira: "SP-2025-0001234",
      tipo: "compra" as const,
      valor: 8.00,
      saldoAnterior: 34.50,
      saldoRestante: 26.50,
      data: new Date(Date.now() - 7200000).toISOString(),
      local: "Barraca de Bebidas",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <TransactionHistory transactions={mockTransactions} />
    </div>
  );
}
