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
}

export abstract class BaseRuleStruct {
  abstract id: string;
  abstract wcagLevel: Issue["wcagLevel"];
  abstract wcagCriterion: string;
  abstract rule: string;
  abstract description: string;
  protected severity: Issue["severity"] = "moderate";

  abstract examine(page: Page): Promise<Issue[]>;

  public createIssue(
    element: string,
    selector: string,
    impact: string,
    recommendation: string
  ): Issue {
    return {
      id: this.id,
      severity: this.severity,
      wcagLevel: this.wcagLevel,
      wcagCriterion: this.wcagCriterion,
      rule: this.rule,
      description: this.description,
      element,
      selector,
      impact,
      recommendation,
    };
  }
}

export interface Report {
  // dashboard
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
  score: number; // 0-100
}
