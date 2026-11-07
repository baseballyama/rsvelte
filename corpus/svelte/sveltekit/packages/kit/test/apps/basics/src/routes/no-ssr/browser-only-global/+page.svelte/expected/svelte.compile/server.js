import * as $ from 'svelte/internal/server';

document;

export default function _page($$renderer) {
	$$renderer.push(`<!---->${$.escape(document)} <p>Works</p>`);
}