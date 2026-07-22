import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Nav from "../components/Nav";
import ScoreBadge from "../components/ScoreBadge";
import { api } from "../lib/api";

interface Exchange {
  question: string;
  score: number;
  feedback: string;
  suggestions: string[];
}
interface Session {
  role: string;
  averageScore: number;
  exchanges: Exchange[];
}

export default function SessionSummary() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Session data is fetched via history since /complete already returned it once;
    // for a real app you'd add a GET /interview/:id route — kept simple here.
    api.history().then((sessions: any[]) => {
      const match = sessions.find((s) => s._id === sessionId);
      if (match) setSession(match);
    });
  }, [sessionId]);

  if (!session) {
    return (
      <div className="min-h-screen bg-ink-950">
        <Nav />
        <p className="text-paper/50 text-center pt-16">Loading summary…</p>
      </div>
    );
  }

  const strengths = session.exchanges.filter((e) => e.score >= 7);
  const gaps = session.exchanges.filter((e) => e.score < 7);

  return (
    <div className="min-h-screen bg-ink-950">
      <Nav />
      <main className="max-w-2xl mx-auto px-6 pb-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal mb-3">Session complete</p>
        <h1 className="font-display text-4xl text-paper mb-2">{session.role}</h1>
        <div className="flex justify-center my-6">
          <ScoreBadge score={session.averageScore} />
        </div>
        <p className="text-paper/50 mb-12">Average score across {session.exchanges.length} questions</p>

        <div className="grid sm:grid-cols-2 gap-6 text-left">
          <div className="rounded-xl border border-paper/10 bg-ink-900 p-5">
            <h3 className="font-display text-lg text-paper mb-3">Strengths</h3>
            {strengths.length === 0 && <p className="text-paper/40 text-sm">None scored 7+ this round.</p>}
            <ul className="space-y-2 text-sm text-paper/70">
              {strengths.map((e, i) => (
                <li key={i}>{e.question}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-paper/10 bg-ink-900 p-5">
            <h3 className="font-display text-lg text-paper mb-3">Areas to improve</h3>
            <ul className="space-y-2 text-sm text-paper/70">
              {gaps.map((e, i) => (
                <li key={i}>{e.suggestions[0] || e.feedback}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-12">
          <Link to="/interview" className="rounded-full bg-accent text-ink-950 font-semibold px-6 py-3 hover:bg-accent-soft transition-colors">
            Practice again
          </Link>
          <Link to="/dashboard" className="text-sm text-paper/60 hover:text-paper transition-colors self-center">
            View dashboard →
          </Link>
        </div>
      </main>
    </div>
  );
}
