import * as $ from 'svelte/internal/server';

export default function Widget($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<svg>`);
	children($$renderer);
	$$renderer.push(`<!----></svg>`);
}