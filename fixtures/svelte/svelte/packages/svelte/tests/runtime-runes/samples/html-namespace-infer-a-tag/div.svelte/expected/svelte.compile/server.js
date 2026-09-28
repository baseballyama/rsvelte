import * as $ from 'svelte/internal/server';

export default function Div($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<div>`);
	children($$renderer);
	$$renderer.push(`<!----></div>`);
}