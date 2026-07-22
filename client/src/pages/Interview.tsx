import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import ScoreBadge from "../components/ScoreBadge";
import { api } from "../lib/api";

const ROLES = ["Frontend Developer", "Data Analyst", "Backend Engineer"];

interface TurnResult {
  question: string;
  answer: string;
  feedback: string;
  score: number;
  suggestions: string[];
}

export default function Interview() {
  const [role, setRole] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [turns, setTurns] = useState<TurnResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function beginSession(selectedRole: string) {
    setBusy(true);
    setError("");
    try {
      const res = await api.startInterview(selectedRole);
      setRole(selectedRole);
      setSessionId(res.sessionId);
      setQuestion(res.question);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the session.");
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer() {
    if (!sessionId || !question || !answer.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await api.submitAnswer(sessionId, question, answer);
      setTurns((t) => [...t, { question, answer, ...res.result }]);
      setAnswer("");
      if (res.nextQuestion) {
        setQuestion(res.nextQuestion);
      } else {
        await api.completeInterview(sessionId);
        navigate(`/summary/${sessionId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit your answer.");
    } finally {
      setBusy(false);
    }
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-ink-950">
        <Nav />
        <main className="max-w-md mx-auto px-6 pt-16 text-center">
          <h1 className="font-display text-3xl text-paper mb-3">Pick a role to practice</h1>
          <p className="text-paper/50 mb-8">Questions and feedback will be tailored to this role.</p>
          <div className="space-y-3">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => beginSession(r)}
                disabled={busy}
                className="w-full rounded-xl border border-paper/10 bg-ink-900 px-5 py-4 text-paper text-left hover:border-accent transition-colors disabled:opacity-60"
              >
                {r}
              </button>
            ))}
          </div>
          {error && <p className="text-signal text-sm mt-4">{error}</p>}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <Nav />
      <main className="max-w-2xl mx-auto px-6 pb-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal mb-2">
          {role} · Question {turns.length + 1} of 5
        </p>

        <div className="space-y-6 mb-8">
          {turns.map((t, i) => (
            <div key={i} className="rounded-xl border border-paper/10 bg-ink-900 p-5">
              <p className="font-mono text-sm text-accent-soft mb-2">Q: {t.question}</p>
              <p className="text-paper/70 text-sm mb-4">{t.answer}</p>
              <div className="flex items-start gap-4 border-t border-paper/10 pt-4">
                <ScoreBadge score={t.score} />
                <div>
                  <p className="text-paper/80 text-sm mb-2">{t.feedback}</p>
                  <ul className="text-paper/50 text-sm list-disc list-inside space-y-1">
                    {t.suggestions.map((s, j) => (
                      <li key={j}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {question && (
          <div className="rounded-xl border border-accent/30 bg-ink-900 p-5">
            <p className="font-display text-xl text-paper mb-4">{question}</p>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer…"
              rows={5}
              className="w-full rounded-lg bg-ink-950 border border-paper/10 px-4 py-3 text-paper placeholder:text-paper/30 outline-none focus:border-accent resize-none"
            />
            {error && <p className="text-signal text-sm mt-3">{error}</p>}
            <button
              onClick={submitAnswer}
              disabled={busy || !answer.trim()}
              className="mt-4 rounded-full bg-accent text-ink-950 font-semibold px-6 py-3 hover:bg-accent-soft transition-colors disabled:opacity-60"
            >
              {busy ? "Scoring…" : "Submit answer"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
