import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>hello</h1> <button>go to /routing/external-popstate/does-not-exist</button>`);
}