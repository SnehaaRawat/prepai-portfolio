import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Nav from "../components/Nav";
import { api } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";

const TRANSCRIPT = [
  { speaker: "PrepAI", line: "Tell me about a time you disagreed with a teammate's approach." },
  { speaker: "You", line: "On a recent project, I noticed our caching strategy would cause..." },
  { speaker: "PrepAI", line: "Score: 8/10 — Clear structure. Try naming the tradeoff explicitly next time." },
];

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  async function startDemo() {
    setLoading(true);
    try {
      const user = await api.guest();
      setUser(user);
      navigate("/interview");
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <Nav />

      <main className="px-6 md:px-10 pt-10 md:pt-16 pb-24 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal mb-5">
              Mock interviews, scored in real time
            </p>
            <h1 className="font-display text-4xl md:text-5xl leading-[1.1] text-paper mb-6">
              Practice the interview before it counts.
            </h1>
            <p className="text-paper/60 text-base md:text-lg leading-relaxed mb-9 max-w-md">
              PrepAI runs a live mock interview for your target role, then scores every answer
              with specific, actionable feedback — the way a good hiring manager would.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={startDemo}
                disabled={loading}
                className="rounded-full bg-accent text-ink-950 font-semibold px-6 py-3 hover:bg-accent-soft transition-colors disabled:opacity-60"
              >
                {loading ? "Starting…" : "Try the demo — no signup"}
              </button>
              <Link to="/login" className="text-sm text-paper/60 hover:text-paper transition-colors">
                or create an account →
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-paper/10 bg-ink-900 p-6 font-mono text-sm shadow-2xl shadow-black/40">
            <div className="flex gap-1.5 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-paper/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-paper/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-paper/20" />
            </div>
            <div className="space-y-4">
              {TRANSCRIPT.map((t, i) => (
                <div key={i}>
                  <div className={`text-xs mb-1 ${t.speaker === "You" ? "text-accent-soft" : "text-signal"}`}>
                    {t.speaker}
                  </div>
                  <div className="text-paper/80 leading-relaxed">{t.line}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mt-24 border-t border-paper/10 pt-12">
          <div>
            <h3 className="font-display text-lg text-paper mb-2">Role-specific questions</h3>
            <p className="text-paper/50 text-sm leading-relaxed">
              Choose your target role and get behavioral and technical questions built for it.
            </p>
          </div>
          <div>
            <h3 className="font-display text-lg text-paper mb-2">Instant, specific feedback</h3>
            <p className="text-paper/50 text-sm leading-relaxed">
              Every answer gets a score and concrete suggestions — not generic encouragement.
            </p>
          </div>
          <div>
            <h3 className="font-display text-lg text-paper mb-2">Track your progress</h3>
            <p className="text-paper/50 text-sm leading-relaxed">
              See your score trend across sessions and know what to work on next.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
