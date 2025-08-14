/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */


export default {
	async fetch(request, env) {
	  console.log("Logger1 worker got a request:", request.url);
  
	  const apiKey = request.headers.get("X-API-Key");
	  if (!apiKey) {
		console.log("Invalid or missing API key");
		return new Response("Unauthorized", { status: 401 });
	  }
  
	  return new Response("Logger1 processed request and sent back to router.", {
		status: 200
	  });
	}
  }
  