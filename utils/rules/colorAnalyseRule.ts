import { Page } from "puppeteer";
import { BaseRuleStruct, Issue } from "../types/analysisStruct";

export class ColorAnalyseRule extends BaseRuleStruct {
  id = "color_contrast";
  rule = "text must have adequate contrast against background";
  description =
    "Ensures the contrast between foreground and background colors according WCAG standards";
  wcagLevel: "AA" = "AA";
  wcagCriterion = "1.4.3, 1.4.6";
  severity: Issue["severity"] = "serious";

  private getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  private getContrastRatio = (l1: number, l2: number): number => {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  private parseColor = (color: string): [number, number, number] | null => {
    // Handle hex colors
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      if (hex.length === 3) {
        return [
          parseInt(hex[0] + hex[0], 16),
          parseInt(hex[1] + hex[1], 16),
          parseInt(hex[2] + hex[2], 16),
        ];
      } else if (hex.length === 6) {
        return [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16),
        ];
      }
    }

    // Handle rgb/rgba colors
    const rgbMatch = color.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
    );
	
    if (rgbMatch) {
      return [
        parseInt(rgbMatch[1]),
        parseInt(rgbMatch[2]),
        parseInt(rgbMatch[3]),
      ];
    }

    // Handle named colors (basic set)
    const namedColors: { [key: string]: [number, number, number] } = {
      black: [0, 0, 0],
      white: [255, 255, 255],
      red: [255, 0, 0],
      green: [0, 128, 0],
      blue: [0, 0, 255],
      yellow: [255, 255, 0],
      cyan: [0, 255, 255],
      magenta: [255, 0, 255],
      silver: [192, 192, 192],
      gray: [128, 128, 128],
      maroon: [128, 0, 0],
      olive: [128, 128, 0],
      lime: [0, 255, 0],
      aqua: [0, 255, 255],
      teal: [0, 128, 128],
      navy: [0, 0, 128],
      fuchsia: [255, 0, 255],
      purple: [128, 0, 128],
    };

    const normalizedColor = color.toLowerCase().trim();
    return namedColors[normalizedColor] || null;
  };

	private getBackgroundColor = (element:HTMLElement): [number, number, number] => {
		let currElement: HTMLElement | null= element;
		while(currElement) {
			const style = window.getComputedStyle(currElement);
			
			if(style && style.display!=="hidden") {
				const bgColor = style.backgroundColor;
				if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
					const parsed = this.parseColor(bgColor);
					if (parsed) return parsed;
				}
			}
			if (currElement === document.documentElement) break;
          	currElement = currElement.parentElement;
		}
		return [255, 255, 255];
	}

  async examine(page: Page): Promise<Issue[]> {
    return await page.evaluate(() => {
      const issues: any[] = [];

      return issues;
    });
  }
}
