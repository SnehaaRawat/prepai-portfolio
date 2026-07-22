import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  isGuest: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  isGuest: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default model<IUser>("User", userSchema);
