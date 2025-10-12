export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("sao-pay-token");
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function getUsuario() {
  const usuario = localStorage.getItem("sao-pay-usuario");
  if (!usuario) return null;
  return JSON.parse(usuario);
}

export function logout() {
  localStorage.removeItem("sao-pay-token");
  localStorage.removeItem("sao-pay-tipo");
  localStorage.removeItem("sao-pay-usuario");
  window.location.href = "/";
}
