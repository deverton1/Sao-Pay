import AdminDashboard from "../AdminDashboard";

export default function AdminDashboardExample() {
  return (
    <AdminDashboard
      nomeUsuario="Administrador"
      onLogout={() => console.log("Logout")}
    />
  );
}
