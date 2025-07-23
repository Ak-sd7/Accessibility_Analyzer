import { Page } from "puppeteer";
import { BaseRuleStruct, Issue } from "../types/analysisStruct";

export class FormAnalyseRule extends BaseRuleStruct {
	id = "form";
  	description = "Ensures every form element has a associated labels with them";
	rule = "form elements should contain labels";
	wcagLevel: 'A' = 'A';
	wcagCriterion = '1.3.1, 3.3.2';
	severity: Issue['severity'] = 'critical';

	async exaamine(page: Page): Promise<Issue[]>{
		return page.evaluate(()=>{
			const issue: any[] = [];
			const formElement = document.querySelectorAll()
		})
	}
}