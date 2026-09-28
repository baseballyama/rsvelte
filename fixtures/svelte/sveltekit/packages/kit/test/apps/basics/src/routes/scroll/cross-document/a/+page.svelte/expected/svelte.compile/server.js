import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>a</h1> <div style="height: 200vh; background: teal"></div> <a data-sveltekit-reload="" href="/scroll/cross-document/b">b</a>`);
}