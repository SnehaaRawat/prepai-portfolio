const BASE = "/api/v1";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Something went wrong." }));
    throw new Error(body.error || "Request failed.");
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  signup: (name: string, email: string, password: string) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  guest: () => request("/auth/guest", { method: "POST" }),
  logout: () => request("/auth/logout", { method: "POST" }),

  startInterview: (role: string) =>
    request("/interview/start", { method: "POST", body: JSON.stringify({ role }) }),
  submitAnswer: (sessionId: string, question: string, answer: string) =>
    request(`/interview/${sessionId}/answer`, {
      method: "POST",
      body: JSON.stringify({ question, answer }),
    }),
  completeInterview: (sessionId: string) =>
    request(`/interview/${sessionId}/complete`, { method: "POST" }),
  history: () => request("/interview/history"),
};
