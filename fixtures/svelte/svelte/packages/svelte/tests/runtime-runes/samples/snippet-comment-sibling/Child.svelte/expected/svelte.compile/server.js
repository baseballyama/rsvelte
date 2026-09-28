import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	const { children } = $$props;

	children($$renderer);
	$$renderer.push(`<!---->`);
}