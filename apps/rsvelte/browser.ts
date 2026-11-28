// Runs code meant for a browser in Node.js: `fetch` reads a `file:` URL as a browser fetches the
// file beside a page. `node --conditions=browser --import ./browser.ts --test compiler.test.ts`
// tests the browser entry of rsvelte/compiler.
import { readFile } from 'node:fs/promises';

const fetchUrl = globalThis.fetch;
globalThis.fetch = async (input, init) => {
	const url = input instanceof URL ? input : new URL(input instanceof Request ? input.url : input);
	if (url.protocol !== 'file:') return fetchUrl(input, init);
	const type = url.pathname.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream';
	return new Response(await readFile(url), { headers: { 'content-type': type } });
};
