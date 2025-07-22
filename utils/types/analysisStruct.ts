import { Page } from "puppeteer";

export interface Issue {
  id: string;
  severity: "critical" | "serious" | "moderate" | "minor";
  wcagLevel: "A" | "AA" | "AAA";
  wcagCriterion: string;
  rule: string;
  description: string;
  element: string;
  selector: string;
  impact: string;
  recommendation: string;
  helpUrl?: string;
}

export abstract class BaseRuleStruct {
  abstract id: string;
  abstract wcagLevel: Issue["wcagLevel"];
  abstract wcagCriterion: string;
  abstract name: string;
  abstract description: string;
  protected severity: Issue["severity"] = "moderate";

  abstract examine(page: Page): Promise<Issue[]>;

  protected createIssue(
    element: string,
    selector: string,
    impact: string,
    recommendation: string,
    helpUrl?: string
  ): Issue {
    return {
      id: this.id,
      severity: this.severity,
      wcagLevel: this.wcagLevel,
      wcagCriterion: this.wcagCriterion,
      rule: this.name,
      description: this.description,
      element,
      selector,
      impact,
      recommendation,
      helpUrl,
    };
  }
}

export interface Report { // dashboard
  url: string;
  timestamp: Date;
  summary: {
	totalIssues: number;
	critical: number;
	serious: number;
	moderate: number;
	minor: number;
  };
  issues: Issue[];
  score: number; // 0-100
}
