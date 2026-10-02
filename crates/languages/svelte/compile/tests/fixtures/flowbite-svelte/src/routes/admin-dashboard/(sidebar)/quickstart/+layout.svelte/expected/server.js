import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<div class="mx-auto max-w-7xl">`);
	children($$renderer);
	$$renderer.push(`<!----></div>`);
}