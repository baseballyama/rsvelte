import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/optional-params/with-value">Path with Value</a>`);
}