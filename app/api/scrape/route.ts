import { NextRequest } from "next/server";

const isUrl = (url: string):boolean=>{
	try {
		const urlObj = new URL(url);
		return urlObj.protocol === "https:" || urlObj.protocol === "http:";
	} catch (error) {
		return false;
	}
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || !isUrl(url)) {
      return new Response(JSON.stringify({ error: "url is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }


  } catch (error) {
    return new Response(JSON.stringify({ error: `${error}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
