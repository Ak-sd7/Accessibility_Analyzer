// types/accessibility.ts
export interface AccessibilityIssue {
  id: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  wcagLevel: 'A' | 'AA' | 'AAA';
  wcagCriterion: string;
  rule: string;
  description: string;
  element: string;
  selector: string;
  impact: string;
  recommendation: string;
  helpUrl?: string;
}

export interface AccessibilityReport {
  url: string;
  timestamp: Date;
  summary: {
    totalIssues: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  issues: AccessibilityIssue[];
  score: number; // 0-100
}

export interface RuleConfig {
  enabled: boolean;
  severity: AccessibilityIssue['severity'];
}

// lib/accessibility/rules/BaseRule.ts
export abstract class BaseAccessibilityRule {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract wcagLevel: 'A' | 'AA' | 'AAA';
  abstract wcagCriterion: string;
  protected severity: AccessibilityIssue['severity'] = 'moderate';
  
  protected enabled: boolean = true;

  constructor(config?: RuleConfig) {
    if (config) {
      this.enabled = config.enabled;
      this.severity = config.severity;
    }
  }

  abstract evaluate(page: any): Promise<AccessibilityIssue[]>;

  protected createIssue(
    element: string,
    selector: string,
    impact: string,
    recommendation: string,
    helpUrl?: string
  ): AccessibilityIssue {
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
      helpUrl
    };
  }
}

// lib/accessibility/rules/ImageAccessibilityRule.ts
export class ImageAccessibilityRule extends BaseAccessibilityRule {
  id = 'image-alt';
  name = 'Images must have alternative text';
  description = 'Ensures <img> elements have alternate text or a role of none or presentation';
  wcagLevel: 'A' = 'A';
  wcagCriterion = '1.1.1';
  severity: AccessibilityIssue['severity'] = 'critical';

  async evaluate(page: any): Promise<AccessibilityIssue[]> {
    if (!this.enabled) return [];

    return await page.evaluate(() => {
      const issues: any[] = [];
      const images = document.querySelectorAll('img');
      
      images.forEach((img: HTMLImageElement, index: number) => {
        const hasAlt = img.hasAttribute('alt');
        const altText = img.getAttribute('alt') || '';
        const role = img.getAttribute('role');
        const ariaLabel = img.getAttribute('aria-label');
        const ariaLabelledby = img.getAttribute('aria-labelledby');
        
        // Check for decorative images
        const isDecorative = role === 'none' || role === 'presentation';
        
        // Skip if image is properly marked as decorative
        if (isDecorative && altText === '') return;
        
        // Check for missing alt attribute
        if (!hasAlt && !ariaLabel && !ariaLabelledby) {
          issues.push({
            element: img.outerHTML,
            selector: `img:nth-child(${index + 1})`,
            impact: 'Screen readers cannot describe this image to users',
            recommendation: 'Add descriptive alt text or mark as decorative with role="presentation" and alt=""'
          });
        }
        
        // Check for empty alt on non-decorative images
        if (hasAlt && altText.trim() === '' && !isDecorative && !ariaLabel) {
          issues.push({
            element: img.outerHTML,
            selector: `img:nth-child(${index + 1})`,
            impact: 'Image appears to be informative but has empty alt text',
            recommendation: 'Provide descriptive alt text that conveys the purpose and content of the image'
          });
        }
        
        // Check for redundant alt text
        const redundantPhrases = ['image of', 'picture of', 'graphic of', 'photo of'];
        if (altText && redundantPhrases.some(phrase => altText.toLowerCase().includes(phrase))) {
          issues.push({
            element: img.outerHTML,
            selector: `img:nth-child(${index + 1})`,
            impact: 'Alt text contains redundant phrases',
            recommendation: 'Remove redundant phrases like "image of" from alt text'
          });
        }
      });
      
      return issues;
    });
  }
}

// lib/accessibility/rules/FormAccessibilityRule.ts
export class FormAccessibilityRule extends BaseAccessibilityRule {
  id = 'form-labels';
  name = 'Form elements must have labels';
  description = 'Ensures every form element has a programmatically associated label';
  wcagLevel: 'A' = 'A';
  wcagCriterion = '1.3.1, 3.3.2';
  severity: AccessibilityIssue['severity'] = 'critical';

  async evaluate(page: any): Promise<AccessibilityIssue[]> {
    if (!this.enabled) return [];

    return await page.evaluate(() => {
      const issues: any[] = [];
      const formElements = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
      
      formElements.forEach((element: HTMLElement, index: number) => {
        const id = element.getAttribute('id');
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledby = element.getAttribute('aria-labelledby');
        const ariaDescribedby = element.getAttribute('aria-describedby');
        const title = element.getAttribute('title');
        
        // Check for associated label
        let hasLabel = false;
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          hasLabel = !!label;
        }
        
        // Check if element is wrapped in label
        const parentLabel = element.closest('label');
        if (parentLabel) hasLabel = true;
        
        // Check for ARIA labeling
        if (ariaLabel || ariaLabelledby) hasLabel = true;
        
        if (!hasLabel) {
          const tagName = element.tagName.toLowerCase();
          const type = element.getAttribute('type') || '';
          
          issues.push({
            element: element.outerHTML,
            selector: `${tagName}:nth-child(${index + 1})`,
            impact: 'Screen reader users cannot determine the purpose of this form control',
            recommendation: `Associate this ${tagName}${type ? ` [type="${type}"]` : ''} with a label element, aria-label, or aria-labelledby`
          });
        }
        
        // Check for required fields without indication
        if (element.hasAttribute('required')) {
          const hasRequiredIndication = 
            ariaLabel?.includes('required') ||
            title?.includes('required') ||
            element.getAttribute('aria-required') === 'true';
            
          if (!hasRequiredIndication) {
            issues.push({
              element: element.outerHTML,
              selector: `${element.tagName.toLowerCase()}:nth-child(${index + 1})`,
              impact: 'Required status is not communicated to assistive technologies',
              recommendation: 'Add aria-required="true" or include "required" in the accessible name'
            });
          }
        }
      });
      
      return issues;
    });
  }
}

// lib/accessibility/rules/ColorContrastRule.ts
export class ColorContrastRule extends BaseAccessibilityRule {
  id = 'color-contrast';
  name = 'Elements must have sufficient color contrast';
  description = 'Ensures the contrast between foreground and background colors meets WCAG standards';
  wcagLevel: 'AA' = 'AA';
  wcagCriterion = '1.4.3, 1.4.6';
  severity: AccessibilityIssue['severity'] = 'serious';

  async evaluate(page: any): Promise<AccessibilityIssue[]> {
    if (!this.enabled) return [];

    return await page.evaluate(() => {
      const issues: any[] = [];
      
      // Helper function to calculate relative luminance
      const getLuminance = (r: number, g: number, b: number): number => {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };
      
      // Helper function to calculate contrast ratio
      const getContrastRatio = (color1: number[], color2: number[]): number => {
        const lum1 = getLuminance(color1[0], color1[1], color1[2]);
        const lum2 = getLuminance(color2[0], color2[1], color2[2]);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
      };
      
      // Helper function to parse RGB color
      const parseColor = (colorStr: string): number[] | null => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        
        ctx.fillStyle = colorStr;
        const computed = ctx.fillStyle;
        const match = computed.match(/^#([0-9a-f]{6})$/i);
        if (match) {
          const hex = match[1];
          return [
            parseInt(hex.substr(0, 2), 16),
            parseInt(hex.substr(2, 2), 16),
            parseInt(hex.substr(4, 2), 16)
          ];
        }
        
        const rgbMatch = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (rgbMatch) {
          return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
        }
        
        return null;
      };
      
      // Check text elements
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label, li');
      
      textElements.forEach((element: HTMLElement, index: number) => {
        if (!element.textContent?.trim()) return;
        
        const styles = window.getComputedStyle(element);
        const fontSize = parseFloat(styles.fontSize);
        const fontWeight = styles.fontWeight;
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
        
        const color = parseColor(styles.color);
        const backgroundColor = parseColor(styles.backgroundColor);
        
        if (!color || !backgroundColor) return;
        
        const contrastRatio = getContrastRatio(color, backgroundColor);
        const requiredRatio = isLargeText ? 3 : 4.5;
        const aaRatio = isLargeText ? 4.5 : 7;
        
        if (contrastRatio < requiredRatio) {
          issues.push({
            element: element.outerHTML.substring(0, 200) + '...',
            selector: `${element.tagName.toLowerCase()}:nth-child(${index + 1})`,
            impact: `Contrast ratio of ${contrastRatio.toFixed(2)}:1 is below the required ${requiredRatio}:1`,
            recommendation: `Increase color contrast to at least ${requiredRatio}:1 (AA level) or ${aaRatio}:1 (AAA level)`
          });
        }
      });
      
      return issues;
    });
  }
}

// lib/accessibility/rules/HeadingStructureRule.ts
export class HeadingStructureRule extends BaseAccessibilityRule {
  id = 'heading-structure';
  name = 'Heading levels should not be skipped';
  description = 'Ensures heading elements are in a logical, hierarchical order';
  wcagLevel: 'AA' = 'AA';
  wcagCriterion = '1.3.1, 2.4.6';
  severity: AccessibilityIssue['severity'] = 'moderate';

  async evaluate(page: any): Promise<AccessibilityIssue[]> {
    if (!this.enabled) return [];

    return await page.evaluate(() => {
      const issues: any[] = [];
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      let previousLevel = 0;
      let hasH1 = false;
      
      headings.forEach((heading: HTMLElement, index: number) => {
        const currentLevel = parseInt(heading.tagName.substring(1));
        
        if (currentLevel === 1) {
          hasH1 = true;
          if (index > 0 && hasH1) {
            issues.push({
              element: heading.outerHTML,
              selector: `h1:nth-child(${index + 1})`,
              impact: 'Multiple H1 elements can confuse screen reader users',
              recommendation: 'Use only one H1 per page, typically for the main page title'
            });
          }
        }
        
        if (previousLevel > 0 && currentLevel > previousLevel + 1) {
          issues.push({
            element: heading.outerHTML,
            selector: `h${currentLevel}:nth-child(${index + 1})`,
            impact: `Heading level jumps from H${previousLevel} to H${currentLevel}, skipping intermediate levels`,
            recommendation: `Use H${previousLevel + 1} instead of H${currentLevel}, or restructure content hierarchy`
          });
        }
        
        if (!heading.textContent?.trim()) {
          issues.push({
            element: heading.outerHTML,
            selector: `h${currentLevel}:nth-child(${index + 1})`,
            impact: 'Empty heading provides no information to users',
            recommendation: 'Provide descriptive heading text or remove the empty heading'
          });
        }
        
        previousLevel = currentLevel;
      });
      
      if (!hasH1 && headings.length > 0) {
        issues.push({
          element: '<page>',
          selector: 'html',
          impact: 'Page has headings but no H1, making it difficult for users to understand page structure',
          recommendation: 'Add an H1 element that describes the main content or purpose of the page'
        });
      }
      
      return issues;
    });
  }
}

// lib/accessibility/rules/KeyboardAccessibilityRule.ts
export class KeyboardAccessibilityRule extends BaseAccessibilityRule {
  id = 'keyboard-access';
  name = 'Interactive elements must be keyboard accessible';
  description = 'Ensures all interactive elements can be accessed and operated via keyboard';
  wcagLevel: 'A' = 'A';
  wcagCriterion = '2.1.1, 2.1.2';
  severity: AccessibilityIssue['severity'] = 'critical';

  async evaluate(page: any): Promise<AccessibilityIssue[]> {
    if (!this.enabled) return [];

    return await page.evaluate(() => {
      const issues: any[] = [];
      
      // Check for interactive elements without proper keyboard support
      const interactiveElements = document.querySelectorAll(`
        [onclick], [onkeydown], [onkeyup], [onkeypress],
        div[role="button"], span[role="button"], div[role="link"],
        [tabindex]:not([tabindex="-1"]), .btn, .button
      `);
      
      interactiveElements.forEach((element: HTMLElement, index: number) => {
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        const tabIndex = element.getAttribute('tabindex');
        const hasClickHandler = element.getAttribute('onclick') || 
                               element.addEventListener || 
                               element.hasAttribute('data-toggle');
        
        // Skip naturally focusable elements
        const naturallyFocusable = ['a', 'button', 'input', 'select', 'textarea'].includes(tagName);
        if (naturallyFocusable) return;
        
        // Check if element has proper keyboard support
        const hasTabIndex = tabIndex !== null && tabIndex !== '-1';
        const hasRole = role && ['button', 'link', 'menuitem', 'tab'].includes(role);
        
        if (hasClickHandler && !hasTabIndex) {
          issues.push({
            element: element.outerHTML.substring(0, 200) + '...',
            selector: `${tagName}:nth-child(${index + 1})`,
            impact: 'Interactive element cannot be reached or activated with keyboard',
            recommendation: 'Add tabindex="0" and ensure keyboard event handlers (onKeyDown) are implemented'
          });
        }
        
        if (hasRole && hasRole && !hasTabIndex) {
          issues.push({
            element: element.outerHTML.substring(0, 200) + '...',
            selector: `${tagName}:nth-child(${index + 1})`,
            impact: `Element with role="${role}" is not keyboard accessible`,
            recommendation: 'Add tabindex="0" to make this element focusable via keyboard'
          });
        }
      });
      
      // Check for focus traps and tab order issues
      const focusableElements = document.querySelectorAll(`
        a[href], button, input, select, textarea, 
        [tabindex]:not([tabindex="-1"]), 
        [contenteditable="true"]
      `);
      
      let hasPositiveTabIndex = false;
      focusableElements.forEach((element: HTMLElement, index: number) => {
        const tabIndex = parseInt(element.getAttribute('tabindex') || '0');
        if (tabIndex > 0) {
          hasPositiveTabIndex = true;
          issues.push({
            element: element.outerHTML.substring(0, 200) + '...',
            selector: `${element.tagName.toLowerCase()}:nth-child(${index + 1})`,
            impact: 'Positive tabindex values disrupt natural tab order',
            recommendation: 'Use tabindex="0" instead of positive values, or restructure HTML for logical tab order'
          });
        }
      });
      
      return issues;
    });
  }
}

// lib/accessibility/rules/AriaRule.ts
export class AriaRule extends BaseAccessibilityRule {
  id = 'aria-attributes';
  name = 'ARIA attributes must be valid and properly used';
  description = 'Ensures ARIA attributes are valid and enhance accessibility';
  wcagLevel: 'A' = 'A';
  wcagCriterion = '4.1.2';
  severity: AccessibilityIssue['severity'] = 'serious';

  private validAriaAttributes = [
    'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden',
    'aria-expanded', 'aria-checked', 'aria-selected', 'aria-pressed',
    'aria-current', 'aria-live', 'aria-atomic', 'aria-relevant',
    'aria-busy', 'aria-disabled', 'aria-invalid', 'aria-required',
    'aria-readonly', 'aria-multiline', 'aria-autocomplete', 'aria-haspopup'
  ];

  async evaluate(page: any): Promise<AccessibilityIssue[]> {
    if (!this.enabled) return [];

    return await page.evaluate((validAttributes: string[]) => {
      const issues: any[] = [];
      const elementsWithAria = document.querySelectorAll('[aria-hidden], [role], [aria-label], [aria-labelledby], [aria-describedby]');
      
      elementsWithAria.forEach((element: HTMLElement, index: number) => {
        // Check for aria-hidden on focusable elements
        const ariaHidden = element.getAttribute('aria-hidden');
        if (ariaHidden === 'true') {
          const isFocusable = element.tabIndex >= 0 || 
                             ['a', 'button', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase());
          
          if (isFocusable) {
            issues.push({
              element: element.outerHTML.substring(0, 200) + '...',
              selector: `${element.tagName.toLowerCase()}:nth-child(${index + 1})`,
              impact: 'Focusable element is hidden from screen readers but still keyboard accessible',
              recommendation: 'Remove aria-hidden="true" from focusable elements or use CSS to hide them completely'
            });
          }
        }
        
        // Check for empty aria-label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel !== null && ariaLabel.trim() === '') {
          issues.push({
            element: element.outerHTML.substring(0, 200) + '...',
            selector: `${element.tagName.toLowerCase()}:nth-child(${index + 1})`,
            impact: 'Empty aria-label provides no accessible name',
            recommendation: 'Provide descriptive text for aria-label or remove the attribute'
          });
        }
        
        // Check for invalid aria-labelledby references
        const ariaLabelledby = element.getAttribute('aria-labelledby');
        if (ariaLabelledby) {
          const ids = ariaLabelledby.split(' ');
          const missingIds = ids.filter(id => !document.getElementById(id.trim()));
          if (missingIds.length > 0) {
            issues.push({
              element: element.outerHTML.substring(0, 200) + '...',
              selector: `${element.tagName.toLowerCase()}:nth-child(${index + 1})`,
              impact: `aria-labelledby references non-existent elements: ${missingIds.join(', ')}`,
              recommendation: 'Ensure all IDs referenced by aria-labelledby exist in the document'
            });
          }
        }
        
        // Check for invalid role values
        const role = element.getAttribute('role');
        const validRoles = [
          'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
          'checkbox', 'dialog', 'grid', 'gridcell', 'heading', 'img', 'link',
          'list', 'listitem', 'main', 'menu', 'menubar', 'menuitem', 'navigation',
          'none', 'presentation', 'radio', 'region', 'search', 'tab', 'tablist',
          'tabpanel', 'textbox', 'toolbar'
        ];
        
        if (role && !validRoles.includes(role)) {
          issues.push({
            element: element.outerHTML.substring(0, 200) + '...',
            selector: `${element.tagName.toLowerCase()}:nth-child(${index + 1})`,
            impact: `Invalid ARIA role: "${role}"`,
            recommendation: `Use a valid ARIA role or remove the role attribute`
          });
        }
      });
      
      return issues;
    }, this.validAriaAttributes);
  }
}

// lib/accessibility/AccessibilityAnalyzer.ts
import { Page } from 'puppeteer';

export class AccessibilityAnalyzer {
  private rules: BaseAccessibilityRule[] = [];
  
  constructor() {
    this.initializeRules();
  }
  
  private initializeRules(): void {
    this.rules = [
      new ImageAccessibilityRule(),
      new FormAccessibilityRule(),
      new ColorContrastRule(),
      new HeadingStructureRule(),
      new KeyboardAccessibilityRule(),
      new AriaRule()
    ];
  }
  
  public addRule(rule: BaseAccessibilityRule): void {
    this.rules.push(rule);
  }
  
  public removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }
  
  public async analyze(page: Page): Promise<AccessibilityReport> {
    const url = page.url();
    const timestamp = new Date();
    let allIssues: AccessibilityIssue[] = [];
    
    // Run all rules
    for (const rule of this.rules) {
      try {
        const issues = await rule.evaluate(page);
        allIssues = allIssues.concat(issues.map(issue => ({
          ...rule.createIssue(
            issue.element,
            issue.selector,
            issue.impact,
            issue.recommendation
          )
        })));
      } catch (error) {
        console.error(`Error running rule ${rule.id}:`, error);
      }
    }
    
    // Calculate summary
    const summary = {
      totalIssues: allIssues.length,
      critical: allIssues.filter(i => i.severity === 'critical').length,
      serious: allIssues.filter(i => i.severity === 'serious').length,
      moderate: allIssues.filter(i => i.severity === 'moderate').length,
      minor: allIssues.filter(i => i.severity === 'minor').length
    };
    
    // Calculate accessibility score (0-100)
    const maxPossibleScore = 100;
    const criticalPenalty = summary.critical * 20;
    const seriousPenalty = summary.serious * 10;
    const moderatePenalty = summary.moderate * 5;
    const minorPenalty = summary.minor * 2;
    
    const totalPenalty = criticalPenalty + seriousPenalty + moderatePenalty + minorPenalty;
    const score = Math.max(0, maxPossibleScore - totalPenalty);
    
    return {
      url,
      timestamp,
      summary,
      issues: allIssues,
      score
    };
  }
}

// api/analyze.ts (Next.js API route example)
import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import { AccessibilityAnalyzer } from '../lib/accessibility/AccessibilityAnalyzer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set user agent and other realistic browser settings
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const analyzer = new AccessibilityAnalyzer();
    const report = await analyzer.analyze(page);
    
    res.status(200).json(report);
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze accessibility',
      error: error.message 
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
