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

  async examine(page: Page): Promise<Issue[]> {
    return await page.evaluate(() => {
      const issues: any[] = [];
      const getLuminance = (r: number, g: number, b: number): number => {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };

      const getContrastRatio = (l1: number, l2: number): number => {
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      };

      const parseColor = (color: string): [number, number, number] | null => {
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

      const getBackgroundColor = (
        element: HTMLElement
      ): [number, number, number] => {
        let currElement: HTMLElement | null = element;
        while (currElement) {
          const style = window.getComputedStyle(currElement);

          if (style && style.display !== "hidden") {
            const bgColor = style.backgroundColor;
            if (
              bgColor &&
              bgColor !== "rgba(0, 0, 0, 0)" &&
              bgColor !== "transparent"
            ) {
              const parsed = parseColor(bgColor);
              if (parsed) return parsed;
            }
          }
          if (currElement === document.documentElement) break;
          currElement = currElement.parentElement;
        }
        return [255, 255, 255];
      };

      const isLargeText = (element: HTMLElement): boolean => {
        const style = window.getComputedStyle(element);
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = style.fontWeight;
        const isLargeSize = fontSize >= 24; // 18pt ~ 24px
        const isBoldAndMedium = fontSize >= 18.7 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700); // 14pt ≈ 18.7px
        
        return isLargeSize || isBoldAndMedium;
      };

      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label, td, th, li, blockquote, code, pre, small, strong, em, i, b, u, mark, del, ins')
      textElements.forEach((ele:Element, ind: number)=>{
          const element = ele as HTMLElement;
          const textValue = element.textContent?.trim();

          if(!textValue || textValue.length===0)
            return;

          const style = getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return;
          }

          const selector = `${element.tagName.toLowerCase()}: nth-child(${ind+1})`;
          const elementColor = style.color;
          const colorRgb = parseColor(elementColor);

          if(!colorRgb)
            return;

          const backgroundRgb = getBackgroundColor(element);
          const textLuminance = getLuminance(colorRgb[0], colorRgb[1], colorRgb[2]);
          const bgLuminance = getLuminance(backgroundRgb[0], backgroundRgb[1], backgroundRgb[2]);
          const contrastRatio = getContrastRatio(textLuminance, bgLuminance);

          const isLarge = isLargeText(element);
          // values according to WCAG
          const minRatioAA = isLarge ? 3 : 4.5;
          const minRatioAAA = isLarge ? 4.5 : 7;

          // AA complaince
          if (contrastRatio < minRatioAA) {
            issues.push({
              element: element.outerHTML,
              selector,
              impact: `Text contrast ratio is ${contrastRatio.toFixed(2)}:1, below WCAG AA minimum of ${minRatioAA}:1 for ${isLarge ? 'large' : 'normal'} text`,
              recommendation: `Increase contrast between text (${elementColor}) and background. Consider darker text or lighter background to achieve at least ${minRatioAA}:1 ratio`,
            });
          }
          // AAA compliance
          else if (contrastRatio < minRatioAAA) {
            issues.push({
              element: element.outerHTML,
              selector,
              impact: `Text contrast ratio is ${contrastRatio.toFixed(2)}:1, meets WCAG AA but falls short of AAA standard (${minRatioAAA}:1)`,
              recommendation: `Consider improving contrast for better accessibility. Target ${minRatioAAA}:1 ratio for AAA compliance`,
            });
          }
      });

      const inputElements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
      inputElements.forEach((ele: Element, ind: number) => {
        const element = ele as HTMLInputElement;
        const placeholder = element.placeholder?.trim();
        
        if (!placeholder) return;
        
        const style = window.getComputedStyle(element, '::placeholder');
        const placeholderColor = style.color;
        const selector = `${element.tagName.toLowerCase()}[placeholder]:nth-child(${ind + 1})`;
        
        const textRgb = parseColor(placeholderColor);
        if (!textRgb) return;
        
        const backgroundRgb = getBackgroundColor(element);
        const textLuminance = getLuminance(textRgb[0], textRgb[1], textRgb[2]);
        const bgLuminance = getLuminance(backgroundRgb[0], backgroundRgb[1], backgroundRgb[2]);
        const contrastRatio = getContrastRatio(textLuminance, bgLuminance);
        
        //(4.5:1 for normal text) - for placeholders
        if (contrastRatio < 4.5) {
          issues.push({
            element: element.outerHTML,
            selector,
            impact: `Placeholder text contrast ratio is ${contrastRatio.toFixed(2)}:1, below WCAG AA minimum of 4.5:1`,
            recommendation: `Improve placeholder text contrast by using darker placeholder text or ensure proper labeling as placeholders should not be the primary means of identifying form fields`,
          });
        }
      });
      
      
      const focusableElements = document.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      focusableElements.forEach((ele: Element, index: number) => {
        const element = ele as HTMLElement;

        const originalFocus = document.activeElement;
        element.focus();
        
        const focusStyle = window.getComputedStyle(element);
        const outlineColor = focusStyle.outlineColor;
        const outlineWidth = focusStyle.outlineWidth;
        const outlineStyle = focusStyle.outlineStyle;
        
        if (originalFocus instanceof HTMLElement) {
          originalFocus.focus();
        } else {
          element.blur();
        }
        
        const selector = `${element.tagName.toLowerCase()}:nth-child(${index + 1})`;
        
        const hasOutline = outlineStyle !== 'none' && outlineWidth !== '0px' && outlineColor !== 'transparent';
        const boxShadow = focusStyle.boxShadow;
        const hasFocusShadow = boxShadow && boxShadow !== 'none';
        
        if (!hasOutline && !hasFocusShadow) {
          issues.push({
            element: element.outerHTML,
            selector,
            impact: 'Focusable element lacks visible focus indicator',
            recommendation: 'Add outline, box-shadow, or other visual focus indicator with sufficient contrast',
          });
        } else if (hasOutline && outlineColor) {
        
          const outlineRgb = parseColor(outlineColor);
          if (outlineRgb) {
            const backgroundRgb = getBackgroundColor(element);
            const outlineLuminance = getLuminance(outlineRgb[0], outlineRgb[1], outlineRgb[2]);
            const bgLuminance = getLuminance(backgroundRgb[0], backgroundRgb[1], backgroundRgb[2]);
            const contrastRatio = getContrastRatio(outlineLuminance, bgLuminance);
            
            //at least 3:1 contrast ratio
            if (contrastRatio < 3) {
              issues.push({
                element: element.outerHTML,
                selector,
                impact: `Focus indicator contrast ratio is ${contrastRatio.toFixed(2)}:1, below recommended 3:1 minimum`,
                recommendation: 'Use a focus indicator color with better contrast against the background',
              });
            }
          }
        }
      });
      return issues;
    });
  }
}
