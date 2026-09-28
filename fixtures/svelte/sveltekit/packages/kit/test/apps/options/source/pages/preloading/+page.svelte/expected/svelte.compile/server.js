import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a data-sveltekit-preload-data="" href="/path-base/preloading/preloaded">click me</a> <a data-sveltekit-preload-code="" href="/path-base/preloading/code">click me 2</a>`);
}