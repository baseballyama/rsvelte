import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	let { children } = $$props;

	children($$renderer);
	$$renderer.push(`<!---->`);
}