import { AppError } from "../middleware/errorHandler";

// Free-tier drop-in replacement for claudeService.ts — same function signatures,
// so routes never need to change. Uses Groq's OpenAI-compatible endpoint.
// Free tier: no credit card required. Get a key at https://console.groq.com/keys

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

async function callGroq(system: string, userMessage: string, maxTokens: number): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new AppError(`Groq request failed (${res.status}): ${body.slice(0, 200)}`, 502);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new AppError("Groq returned an empty response.", 502);
  return text.trim();
}

export async function generateQuestion(role: string, previousExchanges: string[]): Promise<string> {
  const history = previousExchanges.length
    ? `Previously asked questions in this session:\n${previousExchanges.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nDo not repeat these.`
    : "This is the first question of the session.";

  const system = `You are an experienced technical interviewer conducting a mock interview for a "${role}" position. Ask one clear, realistic interview question at a time — mix behavioral and role-specific technical questions. Respond with ONLY the question text, no preamble, no numbering, no quotation marks.`;

  return callGroq(system, history, 200);
}

export interface FeedbackResult {
  feedback: string;
  score: number;
  suggestions: string[];
}

export async function evaluateAnswer(role: string, question: string, answer: string): Promise<FeedbackResult> {
  const system = `You are an experienced technical interviewer evaluating a candidate's answer for a "${role}" position. Respond ONLY with valid JSON, no markdown fences, no preamble, matching this shape exactly:
{"feedback": "2-3 sentence assessment of the answer", "score": <integer 0-10>, "suggestions": ["short concrete suggestion", "short concrete suggestion"]}`;

  const raw = await callGroq(system, `Question: ${question}\n\nCandidate's answer: ${answer}`, 400);

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      feedback: String(parsed.feedback),
      score: Math.max(0, Math.min(10, Number(parsed.score))),
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : [],
    };
  } catch {
    throw new AppError("Received an unexpected response while scoring your answer.", 502);
  }
}
