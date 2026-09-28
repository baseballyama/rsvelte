import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/shadowed/redirect/a">redirect to c</a>`);
}