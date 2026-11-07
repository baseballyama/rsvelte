import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<p>this string should only appear in this preloaded file</p>`);
}