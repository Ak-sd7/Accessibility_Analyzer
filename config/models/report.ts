import mongoose, { Schema, Document } from "mongoose";

interface Issue {
  id: string;
  severity: string; // critical | serious | moderate | minor
  wcagLevel: string;
  wcagCriterion: string;
  rule: string; // e.g. "color-contrast"
  description: string;
  element: string; // the DOM element affected
  selector: string;
  impact: string;
  recommendation: string;
}

export interface ReportDoc extends Document {
  userId: mongoose.Types.ObjectId; // link to NextAuth users._id
  url: string;
  time: Date;
  summary: {
    totalIssues: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  issues: Issue[];
  score: number;
}

const issueSchema = new Schema<Issue>({
  id: { type: String, required: true },
  severity: {
    type: String,
    enum: ["critical", "serious", "moderate", "minor"],
  },
  wcagLevel: String,
  wcagCriterion: String,
  rule: String,
  description: String,
  element: String,
  selector: String,
  impact: String,
  recommendation: String,
});

const reportSchema = new Schema<ReportDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true }, // links to NextAuth users
    url: { type: String, required: true },
    time: { type: Date, default: Date.now },
    summary: {
      totalIssues: Number,
      critical: Number,
      serious: Number,
      moderate: Number,
      minor: Number,
    },
    issues: [issueSchema],
    score: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true }
);

export default mongoose.models.Report ||
  mongoose.model<ReportDoc>("Report", reportSchema);
