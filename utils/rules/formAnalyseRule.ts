import { Page } from "puppeteer";
import { BaseRuleStruct, Issue } from "../types/analysisStruct";

export class FormAnalyseRule extends BaseRuleStruct {
  id = "form_labels";
  description = "Ensures every form element has a associated labels with them";
  rule = "form elements should contain labels";
  wcagLevel: "A" = "A";
  wcagCriterion = "1.3.1, 3.3.2, 4.1.2";
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
	  if (formElements.length === 0) {
		return [];
	  }

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
		  ariaDescribedby = element.getAttribute("aria-describedby"),
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
			  "Screen reader users cannot determine the purpose of this form without labels",
			recommendation: `Associate this ${tagName}${elementType ? ` [type="${elementType}"]` : ""}${role ? ` [role="${role}"]` : ""} with a label element, aria-label, or aria-labelledby`,
		  });
		}

		// input issues
		if (placeholder && placeholder.trim() && !hasLabel) {
		  issues.push({
			element: htmlElement.outerHTML,
			selector,
			impact: "Placeholder text used as the only form of labeling",
			recommendation:
			  "Provide a proper label in addition to placeholder text",
		  });
		}

		if (htmlElement.hasAttribute("required")) {
		  const ariaRequired = htmlElement.getAttribute("aria-required");
		  const hasRequiredIndication =
			ariaRequired === "true" ||
			(ariaLabel && /required|mandatory|\*/i.test(ariaLabel)) ||
			(title && /required|mandatory|\*/i.test(title));

		  if (!hasRequiredIndication) {
			issues.push({
			  element: htmlElement.outerHTML,
			  selector,
			  impact:
				"Required status is not communicated to assistive technologies",
			  recommendation:
				'Add aria-required="true" or include "required" indicator in the name',
			});
		  }
		}

		const ariaInvalid = htmlElement.getAttribute("aria-invalid");
			if (
			ariaInvalid === "true" &&
			(!ariaDescribedby || !ariaDescribedby.trim())
			) {
			issues.push({
				element: htmlElement.outerHTML,
				selector,
				impact:
				"Field marked as invalid but no error message is associated",
				recommendation:
				"Add aria-describedby to associate error message with invalid field",
			});
			}

			this.checkInputType(element, selector, elementType, issues);
	  	});

		const submitButtons = document.querySelectorAll(
			'button[type="submit"], input[type="submit"]'
		);

		submitButtons.forEach((button, index) => {
			const hasAccessibleName =
			button.getAttribute("aria-label") ||
			button.getAttribute("value") ||
			button.textContent?.trim();

			if (!hasAccessibleName) {
			issues.push({
				element: button.outerHTML,
				selector: `${button.tagName.toLowerCase()}:nth-child(${index + 1})`,
				impact: "Submit button has no accessible name",
				recommendation:
				"Add descriptive text, value, or aria-label to submit button",
				});
			}
		});
	  return issues;
	});
  }

  private checkInputType(
	element: HTMLElement,
	selector: string,
	type: string,
	issues: any[]
  ): void {
	switch (type) {
	  case "email":
		if (
		  !element.getAttribute("autocomplete") &&
		  !element.getAttribute("spellcheck")
		) {
		  issues.push({
			element: element.outerHTML,
			selector,
			impact:
			  "Email input missing autocomplete and spellcheck attributes",
			recommendation: 'Add autocomplete="email" and spellcheck="false"',
		  });
		}
		break;

	  case "password":
		if (!element.getAttribute("autocomplete")) {
		  issues.push({
			element: element.outerHTML,
			selector,
			impact: "Password input missing autocomplete attribute",
			recommendation:
			  'Add appropriate autocomplete value (e.g., "current-password", "new-password")',
		  });
		}
		break;

	  case "tel":
		if (!element.getAttribute("autocomplete")) {
		  issues.push({
			element: element.outerHTML,
			selector,
			impact: "Phone input missing autocomplete attribute",
			recommendation: 'Add autocomplete="tel"',
		  });
		}
		break;

	  case "url":
		if (!element.getAttribute("spellcheck")) {
		  issues.push({
			element: element.outerHTML,
			selector,
			impact: "URL input should disable spellcheck",
			recommendation: 'Add spellcheck="false"',
		  });
		}
		break;

	  case "number":
	  case "range":
		const min = element.getAttribute("min");
		const max = element.getAttribute("max");
		const step = element.getAttribute("step");

		if ((min || max || step) && !element.getAttribute("aria-describedby")) {
		  issues.push({
			element: element.outerHTML,
			selector,
			impact:
			  "Numeric constraints not communicated to assistive technologies",
			recommendation:
			  "Use aria-describedby to reference text explaining min/max/step values",
		  });
		}
		break;
	}
  }
}
