import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a id="one" href="/data-sveltekit/replacestate/target" data-sveltekit-replacestate="">one</a> <div data-sveltekit-replacestate=""><a id="two" href="/data-sveltekit/replacestate/target">two</a> <a id="three" href="/data-sveltekit/replacestate/target"${$.attr('data-sveltekit-replacestate', false)}>three</a></div>`);
}