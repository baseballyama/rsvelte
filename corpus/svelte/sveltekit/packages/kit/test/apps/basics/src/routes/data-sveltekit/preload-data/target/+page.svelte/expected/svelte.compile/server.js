import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>this string should only appear in this preloaded file</h1>`);
}