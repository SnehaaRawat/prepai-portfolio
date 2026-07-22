import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Nav from "../components/Nav";
import ScoreBadge from "../components/ScoreBadge";
import { api } from "../lib/api";

interface Session {
  _id: string;
  role: string;
  averageScore: number;
  completedAt: string;
}

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .history()
      .then((data) => setSessions(data))
      .finally(() => setLoading(false));
  }, []);

  const chartData = [...sessions]
    .reverse()
    .map((s, i) => ({ session: `#${i + 1}`, score: s.averageScore }));

  return (
    <div className="min-h-screen bg-ink-950">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 pb-24">
        <h1 className="font-display text-3xl text-paper mb-8">Your progress</h1>

        {!loading && sessions.length === 0 && (
          <div className="rounded-xl border border-paper/10 bg-ink-900 p-8 text-center">
            <p className="text-paper/60 mb-4">No sessions yet — your first one is the best place to start.</p>
            <Link to="/interview" className="rounded-full bg-accent text-ink-950 font-semibold px-6 py-3 hover:bg-accent-soft transition-colors">
              Start a mock interview
            </Link>
          </div>
        )}

        {sessions.length > 0 && (
          <>
            <div className="rounded-xl border border-paper/10 bg-ink-900 p-5 mb-8 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2F33" />
                  <XAxis dataKey="session" stroke="#F6F5F1" opacity={0.4} fontSize={12} />
                  <YAxis domain={[0, 10]} stroke="#F6F5F1" opacity={0.4} fontSize={12} />
                  <Tooltip contentStyle={{ background: "#1D2124", border: "1px solid #2A2F33", color: "#F6F5F1" }} />
                  <Line type="monotone" dataKey="score" stroke="#4C7FFF" strokeWidth={2} dot={{ fill: "#F2B84B" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {sessions.map((s) => (
                <Link
                  key={s._id}
                  to={`/summary/${s._id}`}
                  className="flex items-center justify-between rounded-xl border border-paper/10 bg-ink-900 px-5 py-4 hover:border-accent transition-colors"
                >
                  <div>
                    <p className="text-paper">{s.role}</p>
                    <p className="text-paper/40 text-sm">{new Date(s.completedAt).toLocaleDateString()}</p>
                  </div>
                  <ScoreBadge score={s.averageScore} />
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
