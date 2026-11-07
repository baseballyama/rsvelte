import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/prerendering/prerendered-endpoint/from-handle-hook">through handle hook</a>`);
}