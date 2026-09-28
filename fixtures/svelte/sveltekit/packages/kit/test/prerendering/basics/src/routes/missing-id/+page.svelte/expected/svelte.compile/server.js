import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="#missing-id">Bad link</a> <a href="#top">Bad link</a>`);
}