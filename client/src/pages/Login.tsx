import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { api } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = mode === "login" ? await api.login(email, password) : await api.signup(name, email, password);
      setUser(user);
      navigate("/interview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <Nav />
      <main className="max-w-sm mx-auto px-6 pt-16">
        <h1 className="font-display text-3xl text-paper mb-8">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg bg-ink-900 border border-paper/10 px-4 py-3 text-paper placeholder:text-paper/30 outline-none focus:border-accent"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg bg-ink-900 border border-paper/10 px-4 py-3 text-paper placeholder:text-paper/30 outline-none focus:border-accent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg bg-ink-900 border border-paper/10 px-4 py-3 text-paper placeholder:text-paper/30 outline-none focus:border-accent"
          />

          {error && <p className="text-signal text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-accent text-ink-950 font-semibold py-3 hover:bg-accent-soft transition-colors disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-6 text-sm text-paper/50 hover:text-paper transition-colors"
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </main>
    </div>
  );
}
