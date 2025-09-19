export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, "") ||
  "";
export function api(path: string) {
  return `${API_BASE}${path}`;
}
