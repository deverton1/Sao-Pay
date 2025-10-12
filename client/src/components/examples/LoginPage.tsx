import LoginPage from "../LoginPage";

export default function LoginPageExample() {
  return (
    <LoginPage
      onLogin={(role, username) => {
        console.log("Login realizado:", role, username);
        alert(`Login como ${role}: ${username}`);
      }}
    />
  );
}
