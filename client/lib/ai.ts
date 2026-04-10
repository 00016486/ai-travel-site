import { getJson, postJson, getApiBase } from "@/lib/api";

export type Lang = "uz" | "ru" | "en";

export const AUTH_KEY = "tourly_auth";

export async function getAiAuthStatus(): Promise<{ hasServerKey: boolean }> {
  return getJson<{ hasServerKey: boolean }>("/api/ai/auth/status");
}

export type ChatHistoryItem = { role: "user" | "assistant"; text: string };

export type ChatWithAiResponse = {
  reply: string;
  imageUrls?: string[];
  tour?: {
    slug: string;
    title: string;
    heroImageUrl: string;
    days: number;
    priceFromUsd: number;
  };
};

export type GeneratedTourPreview = {
  slug: string;
  title: string;
  heroImageUrl: string;
  days: number;
  priceFromUsd: number;
};

export async function generateTourFromBuilder(params: {
  lang: Lang;
  selectedRegions: string[];
  selectedInterests: string[];
  selectedDuration: string | null;
  selectedDays?: number | null;
  budgetUsd: number | null;
  userMessage: string;
  history?: ChatHistoryItem[];
  tierId?: string;
  imageMode?: string;
}): Promise<{ slug: string; tour: GeneratedTourPreview; imageUrls?: string[] }> {
  const token = getAuthTokenFromStorage();
  return postJson<{ slug: string; tour: GeneratedTourPreview; imageUrls?: string[] }>(
    "/api/ai/tours/generate",
    params,
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
}

export async function chatWithAi(params: {
  message: string;
  /** Same as message; server accepts either field */
  userMessage?: string;
  lang: Lang;
  step: number;
  selectedRegions: string[];
  selectedInterests: string[];
  selectedDuration: string | null;
  selectedDays?: number | null;
  history: ChatHistoryItem[];
  budgetUsd?: number | null;
  tierId?: string;
  imageMode?: string;
}): Promise<ChatWithAiResponse> {
  const token = getAuthTokenFromStorage();
  return postJson<ChatWithAiResponse>(
    "/api/ai/chat",
    params,
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
}

export type ProStatus = {
  active: boolean;
  tier: string | null;
  generationsUsed: number;
  generationsLimit: number;
  generationsLeft: number;
  proActivatedAt: string | null;
  proExpiresAt: string | null;
};

export async function getMyProStatus(token: string): Promise<ProStatus> {
  return getJson<ProStatus>("/api/me/pro-status", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function activateMyPro(token: string): Promise<ProStatus> {
  return postJson<ProStatus>(
    "/api/me/pro/activate",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export type ChatSession = {
  id: string;
  userId: string;
  title: string;
  sessionNumber?: number | null;
  tourSlug?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StoredChatMessage = {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
};

export function getAuthTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed?.token || null;
  } catch {
    return null;
  }
}

export async function listChatSessions(token: string): Promise<ChatSession[]> {
  return getJson<ChatSession[]>("/api/chat/sessions", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function createChatSession(token: string, title = "New Trip"): Promise<ChatSession> {
  return postJson<ChatSession>(
    "/api/chat/sessions",
    { title },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function listChatMessages(token: string, sessionId: string): Promise<StoredChatMessage[]> {
  return getJson<StoredChatMessage[]>(`/api/chat/sessions/${sessionId}/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function appendChatMessage(
  token: string,
  sessionId: string,
  role: "user" | "assistant",
  text: string
): Promise<StoredChatMessage> {
  return postJson<StoredChatMessage>(
    `/api/chat/sessions/${sessionId}/messages`,
    { role, text },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function updateChatSession(
  token: string,
  sessionId: string,
  updates: { tourSlug?: string; title?: string }
): Promise<ChatSession> {
  const res = await fetch(`${getApiBase()}/api/chat/sessions/${sessionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updates),
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`PATCH session failed: ${res.status}`);
  return res.json() as Promise<ChatSession>;
}

