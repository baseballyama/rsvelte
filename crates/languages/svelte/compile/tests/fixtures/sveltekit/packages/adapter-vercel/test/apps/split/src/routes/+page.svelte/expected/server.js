import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Hello from SvelteKit on Vercel</h1> <nav><a href="/a">go to route a</a></nav>`);
}