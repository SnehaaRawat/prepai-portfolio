export default function ScoreBadge({ score }: { score: number }) {
  const tone = score >= 8 ? "text-signal border-signal/40" : score >= 5 ? "text-accent-soft border-accent/40" : "text-paper/60 border-paper/20";
  return (
    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full border font-mono text-sm ${tone}`}>
      {score}/10
    </span>
  );
}
