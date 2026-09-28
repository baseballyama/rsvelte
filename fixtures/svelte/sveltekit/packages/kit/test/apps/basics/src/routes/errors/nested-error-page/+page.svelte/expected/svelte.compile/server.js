import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/errors/nested-error-page/nope">nope</a>`);
}