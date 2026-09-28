import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<div id="nested-layout"><h2>Nested Layout</h2> `);
	children?.($$renderer);
	$$renderer.push(`<!----></div>`);
}