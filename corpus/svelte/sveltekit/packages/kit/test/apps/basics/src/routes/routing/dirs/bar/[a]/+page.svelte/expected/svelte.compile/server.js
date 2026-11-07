import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>A page</h1> <a href="/routing/dirs/foo/xyz">same segment</a>`);
}