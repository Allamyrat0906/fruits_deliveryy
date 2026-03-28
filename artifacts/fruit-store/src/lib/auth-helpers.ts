export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("fruit_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
