import BarracaDashboard from "../BarracaDashboard";

export default function BarracaDashboardExample() {
  return (
    <BarracaDashboard
      nomeBarraca="Barraca do Pastel"
      onLogout={() => console.log("Logout")}
    />
  );
}
