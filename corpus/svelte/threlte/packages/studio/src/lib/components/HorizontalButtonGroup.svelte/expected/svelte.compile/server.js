import * as $ from 'svelte/internal/server';

export default function HorizontalButtonGroup($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<div class="svelte-9dgpfm">`);
	children?.($$renderer);
	$$renderer.push(`<!----></div>`);
}