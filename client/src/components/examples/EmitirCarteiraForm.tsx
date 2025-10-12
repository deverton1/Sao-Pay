import EmitirCarteiraForm from "../EmitirCarteiraForm";

export default function EmitirCarteiraFormExample() {
  return (
    <div className="max-w-xl mx-auto p-8">
      <EmitirCarteiraForm
        onEmit={(valor, senha) => {
          console.log("Emitir carteira:", { valor, senha });
          alert(`Carteira emitida com R$ ${valor.toFixed(2)}`);
        }}
      />
    </div>
  );
}
