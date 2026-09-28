import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>foo</h1> <a href="bar">bar</a>`);
}