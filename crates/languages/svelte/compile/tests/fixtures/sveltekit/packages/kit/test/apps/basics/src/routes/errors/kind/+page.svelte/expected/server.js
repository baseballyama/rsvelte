import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/errors/kind/expected">expected</a> <a href="/errors/kind/unexpected">unexpected</a>`);
}