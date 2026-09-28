import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a id="one" href="/data-sveltekit/reload/target" data-sveltekit-reload="">one</a> <div data-sveltekit-reload=""><a id="two" href="/data-sveltekit/reload/target">two</a> <a id="three" href="/data-sveltekit/reload/target"${$.attr('data-sveltekit-reload', false)}>three</a></div>`);
}