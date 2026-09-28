import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>prerendering: __INITIAL_PRERENDERING__/__PRERENDERING__</h1>`);
}