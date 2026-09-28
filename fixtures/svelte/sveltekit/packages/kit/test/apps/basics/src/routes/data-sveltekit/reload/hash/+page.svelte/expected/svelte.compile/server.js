import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="#example" data-sveltekit-reload="">focus</a> <input id="example"/> <a href="/data-sveltekit/reload/hash/new">new page</a>`);
}