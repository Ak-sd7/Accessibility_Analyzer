import { Page } from "puppeteer";
import { BaseRuleStruct, Issue } from "../types/analysisStruct";

export class FormAnalyseRule extends BaseRuleStruct {
  id = "form_labels";
  description = "Ensures every form element has a associated labels with them";
  rule = "form elements should contain labels";
  wcagLevel: "A" = "A";
  wcagCriterion = "1.3.1, 3.3.2";
  severity: Issue["severity"] = "critical";

  async examine(page: Page): Promise<Issue[]> {
    return page.evaluate(() => {
      const issues: any[] = [];
      const formElements = document.querySelectorAll(
        `input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]),
		textarea,
		button[type="submit],
		[role="textbox"],
        [role="spinbutton"],
        [role="slider"],
        [role="searchbox"],
        [role="switch"],
		`
      );

      formElements.forEach((htmlElement: Element, ind: number) => {
        const element = htmlElement as HTMLElement;
        const id = element.getAttribute("id");
        const tagName = element.tagName.toLowerCase();
        const elementType = element.getAttribute("type") || "";
        const role = element.getAttribute("role");

        const label = document.querySelector(`label[for="${id}"]`);
        const tagLabel = element.closest("label");
        let hasLabel: boolean = false;

        const ariaLabel = element.getAttribute("aria-label"),
          ariaLabelledby = element.getAttribute("aria-labelledby"),
          title = element.getAttribute("title"),
          name = element.getAttribute("title"),
          placeholder = element.getAttribute("placeholder");

        const selector = `${tagName}:nth-child(${ind + 1})`;

        if (id && label && label.textContent?.trim() !== "") {
          hasLabel = true;
        }

        if (
          !hasLabel &&
          ((tagLabel && tagLabel.textContent?.trim() !== "") ||
            (ariaLabel && ariaLabel.trim() !== "") ||
            (title && title.trim() !== ""))
        ) {
          hasLabel = true;
        }

        if (!hasLabel && ariaLabelledby && ariaLabelledby.trim() !== "") {
          const labelNames = ariaLabelledby.split(/\s+/);
          const labelIds = labelNames.filter((id) => {
            const labelElement = document.getElementById(id);
            return labelElement && labelElement.textContent?.trim();
          });
          if (labelIds.length > 0) {
            hasLabel = true;
          }
        }

        if (!hasLabel) {
          issues.push({
            element: element.outerHTML,
            selector,
            impact:
              "Screen reader users cannot determine the purpose of this form control",
            recommendation: `Associate this ${tagName}${elementType ? ` [type="${elementType}"]` : ""}${role ? ` [role="${role}"]` : ""} with a label element, aria-label, or aria-labelledby`,
          });
        }
      });
      return issues;
    });
  }
}
