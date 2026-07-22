import Anthropic from "@anthropic-ai/sdk";
import { AppError } from "../middleware/errorHandler";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

// All prompt templates live here so scoring/question style can be tuned in one place.

export async function generateQuestion(role: string, previousExchanges: string[]): Promise<string> {
  const history = previousExchanges.length
    ? `Previously asked questions in this session:\n${previousExchanges.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nDo not repeat these.`
    : "This is the first question of the session.";

  const system = `You are an experienced technical interviewer conducting a mock interview for a "${role}" position. Ask one clear, realistic interview question at a time — mix behavioral and role-specific technical questions. Respond with ONLY the question text, no preamble, no numbering.`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 200,
    system,
    messages: [{ role: "user", content: history }],
  });

  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new AppError("Failed to generate a question.", 502);
  return block.text.trim();
}

export interface FeedbackResult {
  feedback: string;
  score: number;
  suggestions: string[];
}

export async function evaluateAnswer(role: string, question: string, answer: string): Promise<FeedbackResult> {
  const system = `You are an experienced technical interviewer evaluating a candidate's answer for a "${role}" position. Respond ONLY with valid JSON, no markdown fences, matching this shape exactly:
{"feedback": "2-3 sentence assessment of the answer", "score": <integer 0-10>, "suggestions": ["short concrete suggestion", "short concrete suggestion"]}`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    system,
    messages: [{ role: "user", content: `Question: ${question}\n\nCandidate's answer: ${answer}` }],
  });

  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new AppError("Failed to generate feedback.", 502);

  try {
    const cleaned = block.text.replace(/```json|```/g, "").trim();
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
