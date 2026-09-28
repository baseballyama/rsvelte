import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>b</h1> <a href="/scroll/cross-document/c">c</a>`);
}