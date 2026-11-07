import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<div><h1>Main Page</h1> <a href="nested">Nested Link</a></div>`);
}