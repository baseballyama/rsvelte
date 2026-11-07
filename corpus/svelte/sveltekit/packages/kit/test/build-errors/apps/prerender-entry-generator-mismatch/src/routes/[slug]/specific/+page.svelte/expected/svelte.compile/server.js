import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<div>This will be matched</div>`);
}