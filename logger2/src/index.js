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
	async fetch(request, env, ctx) {
	  console.log("Received request:", {
		method: request.method,
		url: request.url,
		headers: Object.fromEntries(request.headers)
	  });
  
	  if (request.method !== 'GET') {
		console.log("Non-GET request processed.");
		return new Response("Logger2 processed request and sent back to router.", {
		  status: 200
		});
	  }
  
	  const apiKey = request.headers.get("X-API-Key");
	  if (!apiKey) {
		console.log("Invalid or missing API key");
		return new Response("Unauthorized", { status: 401 });
	  }
  
	  const logData = {
		api_key: apiKey,
		data: {
		  method: request.method,
		  url: request.url,
		  ip: request.headers.get('cf-connecting-ip') || '',
		  user_agent: request.headers.get('user-agent') || '',
		  referer: request.headers.get('referer') || '',
		  timestamp: Date.now(),
		}
	  };
  
	  console.log("Sending log data to API:", logData);
  
	  ctx.waitUntil(
		fetch('https://api.soniclinker.com/v1.0/traffic/data', {
		  method: 'POST',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify(logData)
		}).then(response => {
		  console.log("Log API response status:", response.status);
		}).catch(error => {
		  console.error("Error sending log data:", error);
		})
	  );
  
	  console.log("Request processed and response sent.");
	  return new Response("Logger2 processed request and sent back to router.", {
		status: 200
	  });
	}
  };
  