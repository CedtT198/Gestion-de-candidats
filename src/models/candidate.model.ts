import mongoose, { Schema, Document } from "mongoose";

export interface ICandidate extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
    deletedAt: Date;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: "pending"
    },
    deletedAt: {
      type: Date,
      default: null
    },
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ICandidate>("Candidate", CandidateSchema);