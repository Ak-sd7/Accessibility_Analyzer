import { NextRequest } from "next/server";
import puppeteer from "puppeteer";
import { AnalyzeImpl } from "@/utils/analyzeImpl";

const isUrl = (url: string):boolean=>{
	try {
		const urlObj = new URL(url);
		return urlObj.protocol === "https:" || urlObj.protocol === "http:";
	} catch (error) {
		return false;
	}
}

export async function POST(request: NextRequest) {
  let browser;
  try {
    const { url } = await request.json();
    if (!url || !isUrl(url)) {
      return new Response(JSON.stringify({ error: "url is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    const analyzer = new AnalyzeImpl();
    const report = await analyzer.analyze(page);
    console.log(report);
    return new Response(JSON.stringify({ message: report }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `${error}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  finally {
    if (browser) await browser.close();
  }
}
