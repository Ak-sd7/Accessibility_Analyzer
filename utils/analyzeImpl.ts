import {Page} from "puppeteer";
import { BaseRuleStruct, Issue, Report } from "./types/analysisStruct";
import { ImageAnalyseRule } from "./rules/imageAnalyseRule";
import { ColorAnalyseRule } from "./rules/colorAnalyseRule";
import { FormAnalyseRule } from "./rules/formAnalyseRule";

export class AnalyzeImpl {
	private rules: BaseRuleStruct[] = [];

	constructor() {
		this.initialize();
	}

	private initialize(): void {
		this.rules = [
			new ImageAnalyseRule(),
			new ColorAnalyseRule(),
			new FormAnalyseRule()
		]
	}

	public async analyze (page: Page): Promise<Report> {
		const url = page.url();
		const time = new Date();

		let overallIssues : Issue[] = [];

		// Parallel processing (faster)
		const allResults = await Promise.all(
			this.rules.map(async (rule) => {
				try {
					const issues = await rule.examine(page);
					return issues.map(issue => rule.createIssue(
						issue.element,
						issue.selector,
						issue.impact,
						issue.recommendation
					));
				} catch (error) {
					console.log("error in analyze:", error);
					return [];
				}
			})
		);

			overallIssues = allResults.flat();
		const summary = {
			totalIssues: overallIssues.length,
			critical: overallIssues.filter(i => i.severity === 'critical').length,
			serious: overallIssues.filter(i => i.severity === 'serious').length,
			moderate: overallIssues.filter(i => i.severity === 'moderate').length,
			minor: overallIssues.filter(i => i.severity === 'minor').length
		};

		const maxPossibleScore = 100;
		const criticalPenalty = summary.critical * 20;
		const seriousPenalty = summary.serious * 10;
		const moderatePenalty = summary.moderate * 5;
		const minorPenalty = summary.minor * 2;
		
		const totalPenalty = criticalPenalty + seriousPenalty + moderatePenalty + minorPenalty;
		const score = Math.max(0, maxPossibleScore - totalPenalty);

		return {
			url,
			time,
			summary,
			issues: overallIssues,
			score
		};
	}

}