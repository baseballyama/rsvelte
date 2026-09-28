import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	const { children } = $$props;

	$$renderer.push(`<div>`);
	children($$renderer);
	$$renderer.push(`<!----></div>`);
}