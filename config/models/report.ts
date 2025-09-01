import mongoose, { Schema, Document } from "mongoose";

interface Issue {
  rule: string;       // e.g. "color-contrast"
  description: string;
  element: string;    // the DOM element affected
  severity: string;   // critical | serious | moderate | minor
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
  rule: { type: String, required: true },
  description: String,
  element: String,
  severity: { type: String, enum: ["critical", "serious", "moderate", "minor"] }
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

export default mongoose.models.Report || mongoose.model<ReportDoc>("Report", reportSchema);
