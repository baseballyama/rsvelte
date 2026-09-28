import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<p>this page will error when Svelte tries to set the innerHTML without a trusted type</p>`);
}