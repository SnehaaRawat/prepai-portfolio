import { Router } from "express";
import { z } from "zod";
import InterviewSession from "../models/InterviewSession";
import { generateQuestion, evaluateAnswer } from "../services/groqService";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middleware/errorHandler";

const router = Router();
router.use(requireAuth);

// Start a new session and get the first question
router.post(
  "/start",
  asyncHandler(async (req: AuthRequest, res) => {
    const { role } = z.object({ role: z.string().min(2).max(80) }).parse(req.body);

    const session = await InterviewSession.create({ user: req.userId, role, exchanges: [] });
    const question = await generateQuestion(role, []);

    res.status(201).json({ sessionId: session._id, question });
  })
);

// Submit an answer, get feedback + the next question (or null if session is over)
router.post(
  "/:sessionId/answer",
  asyncHandler(async (req: AuthRequest, res) => {
    const { question, answer } = z
      .object({ question: z.string().min(1), answer: z.string().min(1) })
      .parse(req.body);

    const session = await InterviewSession.findOne({ _id: req.params.sessionId, user: req.userId });
    if (!session) throw new AppError("Session not found.", 404);

    const result = await evaluateAnswer(session.role, question, answer);
    session.exchanges.push({ question, answer, ...result });
    await session.save();

    const MAX_QUESTIONS = 5;
    let nextQuestion: string | null = null;
    if (session.exchanges.length < MAX_QUESTIONS) {
      nextQuestion = await generateQuestion(
        session.role,
        session.exchanges.map((e) => e.question)
      );
    }

    res.json({ result, nextQuestion });
  })
);

// Finalize a session — compute average score and mark complete
router.post(
  "/:sessionId/complete",
  asyncHandler(async (req: AuthRequest, res) => {
    const session = await InterviewSession.findOne({ _id: req.params.sessionId, user: req.userId });
    if (!session) throw new AppError("Session not found.", 404);

    const avg = session.exchanges.reduce((sum, e) => sum + e.score, 0) / (session.exchanges.length || 1);
    session.averageScore = Math.round(avg * 10) / 10;
    session.status = "completed";
    session.completedAt = new Date();
    await session.save();

    res.json(session);
  })
);

router.get(
  "/history",
  asyncHandler(async (req: AuthRequest, res) => {
    const sessions = await InterviewSession.find({ user: req.userId, status: "completed" })
      .sort({ completedAt: -1 })
      .limit(50);
    res.json(sessions);
  })
);

export default router;
