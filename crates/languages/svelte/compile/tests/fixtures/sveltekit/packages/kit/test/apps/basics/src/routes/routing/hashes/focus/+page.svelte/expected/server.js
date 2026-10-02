import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="#example">focus</a> <input id="example"/>`);
}