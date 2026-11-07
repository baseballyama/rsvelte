import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="foo#missing">missing</a>`);
}