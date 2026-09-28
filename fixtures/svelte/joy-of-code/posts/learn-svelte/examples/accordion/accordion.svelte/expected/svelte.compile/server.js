import * as $ from 'svelte/internal/server';

export default function Accordion($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<div class="accordion">`);
	children?.($$renderer);
	$$renderer.push(`<!----></div>`);
}