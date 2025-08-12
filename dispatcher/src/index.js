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
	async fetch(req, env) {
	  const worker1 = env.DISPATCHER.get("logger1");
	  const response1 = await worker1.fetch(req);

	  const worker2 = env.DISPATCHER.get("logger2");
	  const response2 = await worker2.fetch(req);

	  return new Response(JSON.stringify({
		response1,
		response2
	  }));
	},
  };