export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`요청에 실패했습니다 (${response.status})`);
  return (await response.json()) as T;
}
