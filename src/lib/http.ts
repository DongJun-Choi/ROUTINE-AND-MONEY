export type MutationResult = { ok: true } | { ok: false; message: string };

export const NETWORK_ERROR_MESSAGE = "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.";

// 서버 오류(5xx) 메시지는 영어 내부 문구라서 사용자에게는 정해 둔 안내 문구를 보여 준다.
export async function responseErrorMessage(response: Response, fallback: string): Promise<string> {
  if (response.status >= 500) return fallback;
  const body = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;
  return body?.message ?? body?.error ?? fallback;
}

export async function sendMutation(url: string, init: RequestInit, fallback: string): Promise<MutationResult> {
  try {
    const response = await fetch(url, init);
    if (response.ok) return { ok: true };
    return { ok: false, message: await responseErrorMessage(response, fallback) };
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
}

export function jsonRequest(method: string, body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
