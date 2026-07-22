import { Schema, model, Document, Types } from "mongoose";

export interface IExchange {
  question: string;
  answer: string;
  feedback: string;
  score: number; // 0-10
  suggestions: string[];
}

export interface IInterviewSession extends Document {
  user: Types.ObjectId;
  role: string;
  exchanges: IExchange[];
  averageScore: number;
  status: "in_progress" | "completed";
  createdAt: Date;
  completedAt?: Date;
}

const exchangeSchema = new Schema<IExchange>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    feedback: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 10 },
    suggestions: [{ type: String }],
  },
  { _id: false }
);

const interviewSessionSchema = new Schema<IInterviewSession>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  role: { type: String, required: true },
  exchanges: [exchangeSchema],
  averageScore: { type: Number, default: 0 },
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export default model<IInterviewSession>("InterviewSession", interviewSessionSchema);
