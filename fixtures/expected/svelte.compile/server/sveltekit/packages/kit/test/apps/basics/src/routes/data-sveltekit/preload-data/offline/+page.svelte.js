import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a id="one" href="/data-sveltekit/preload-data/offline/target" data-sveltekit-preload-data="">target</a> <a id="slow-navigation" href="/data-sveltekit/preload-data/offline/slow-navigation" data-sveltekit-preload-data="">slow-navigation</a>`);
}