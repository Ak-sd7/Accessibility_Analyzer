import { Page } from "puppeteer";
import { Issue, BaseRuleStruct } from "../types/analysisStruct";

export class ImageAnalyseRule extends BaseRuleStruct {
  id = "image";
  rule = "image tag must have alt attribute";
  description =
    "Ensures <img> elements have alternate text or a role of none or presentation";
  wcagLevel: "A" = "A";
  wcagCriterion = "1.1.1";
  severity: Issue["severity"] = "critical";

  async examine(page: Page): Promise<Issue[]> {
    return await page.evaluate(() => {
      let issues: any[] = [];
      const images = document.querySelectorAll("img");

      if (images.length === 0) return [];

      images.forEach((image: HTMLImageElement, ind: number) => {
        const hasAltAtrr = image.hasAttribute("alt");
        const altValue = image.getAttribute("alt") || "";
        const role = image.getAttribute("role");
        const ariaLabel = image.getAttribute("aria-label");
        const ariaLabelledby = image.getAttribute("aria-labelledby");
        const spareString = [
          "image of",
          "picture of",
          "photo of",
          "graphic of",
          "video of",
        ];
        let isDecorativeImg: boolean = false;

        if (role === "presentation" || role === "none") isDecorativeImg = true;

        if (isDecorativeImg && altValue === "") return;

        if (!hasAltAtrr && !ariaLabel && !ariaLabelledby) {
          issues.push({
            element: image.outerHTML,
            selector: `img:nth-child(${ind + 1})`,
            impact:
              "Assistive screen readers cannot describe this image to users",
            recommendation:
              'Add descriptive alt text or mark as decorative with role="presentation" and alt=""',
          });
        }

        if (hasAltAtrr && altValue.trim() === "" && !ariaLabel) {
          issues.push({
            element: image.outerHTML,
            selector: `img:nth-child(${ind + 1})`,
            impact: "Image appears to be informative but has empty alt text",
            recommendation:
              "Provide descriptive alt text that conveys the purpose and content of the image",
          });
        }

        if (
          hasAltAtrr &&
          spareString.some((phrase) => altValue.toLowerCase().includes(phrase))
        ) {
          issues.push({
            element: image.outerHTML,
            selector: `img:nth-child(${ind + 1})`,
            impact: "Alt text contains spare phrases",
            recommendation:
              'Remove redundant phrases like "image of" from alt text',
          });
        }
      });
      return issues;
    });
  }
}
