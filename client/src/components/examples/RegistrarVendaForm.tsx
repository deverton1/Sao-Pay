import RegistrarVendaForm from "../RegistrarVendaForm";

export default function RegistrarVendaFormExample() {
  return (
    <div className="max-w-xl mx-auto p-8">
      <RegistrarVendaForm
        carteiraDetectada={{
          numeroCarteira: "SP-2025-0001234",
          saldoAtual: 50.00,
        }}
        onRegistrarVenda={(valor) => {
          console.log("Registrar venda:", valor);
          alert(`Venda de R$ ${valor.toFixed(2)} registrada com sucesso!`);
        }}
      />
    </div>
  );
}
