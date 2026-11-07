import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/shadowed/same-render?param1=value1">Click here to navigate</a>`);
}