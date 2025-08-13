/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/


export default {
	async fetch(req, env) {
	  const worker1 = env.DISPATCHER.get("logger1");
	  const response1 = await worker1.fetch(req);

	  const worker2 = env.DISPATCHER.get("logger2");
	  const response2 = await worker2.fetch(req);

	  return new Response(JSON.stringify({
		response1: await response1.text(),
		response2: await response2.text()
	  }), {
		headers: { "content-type": "application/json" }
	  });
	},
  }; */

  export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const hostname = url.hostname;
		console.log(url.href)
		console.log(`Incoming request for hostname: ${hostname}`);

		console.log(request.headers)

		// Get config from KV
		const configString = await env.USER_INFO.get(hostname);
		console.log(`Config string from KV: ${configString}`);
		if (!configString) {
			console.log("Hostname not found in Router KV");
			return new Response("Hostname not found in Router KV", { status: 404 });
		}

		const config = JSON.parse(configString);
		console.log(`Parsed config:`, config);

		const features = config.features || [];
		const apiKey = config.apiKey;
		const exitUrl = config.exitUrl;

		// Validate API key or any auth here if needed
		console.log(`Features for hostname: ${features}`);
		console.log(`Exit URL: ${exitUrl}`);

		const headersForFeatures = new Headers(request.headers);
		headersForFeatures.set('X-API-Key', apiKey);
		
		const modifiedRequest = new Request(request, { headers: headersForFeatures });

		// Create an array of fetch promises to all feature workers
		const fetchPromises = features.map(async (feature) => {
			const worker = env.DISPATCHER.get(feature);
			if (!worker) {
				console.log(`No worker binding found for feature ${feature}`);
				return `[${feature}] No binding found`;
			}
			try {
				console.log(`Forwarding request to ${feature}`);

				const response = await worker.fetch(modifiedRequest);
				console.log(`Response from ${feature}:`, response);
				return response;
			} catch (e) {
				console.log(`Error fetching from ${feature}: ${e.message}`);
				return `[${feature}] error: ${e.message}`;
			}
		});

		// Wait for all feature worker responses
		ctx.waitUntil(Promise.all(fetchPromises));

		const backendUrl = `${exitUrl}${url.pathname}${url.search}`;
		const headersForBackend = new Headers(request.headers);
		
		const backendRequest = new Request(backendUrl, {
			method: request.method,
			headers: headersForBackend,
			body: request.body,
			redirect: 'manual',
		  });
	  
		  return fetch(backendRequest);
	},
};