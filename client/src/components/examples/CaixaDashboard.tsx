import CaixaDashboard from "../CaixaDashboard";

export default function CaixaDashboardExample() {
  return (
    <CaixaDashboard
      nomeUsuario="Caixa Principal"
      onLogout={() => console.log("Logout")}
    />
  );
}
