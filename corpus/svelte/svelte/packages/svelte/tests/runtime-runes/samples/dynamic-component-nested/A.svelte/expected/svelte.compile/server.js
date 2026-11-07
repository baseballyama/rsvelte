import * as $ from 'svelte/internal/server';

export default function A($$renderer, $$props) {
	const { children } = $$props;

	children($$renderer);
	$$renderer.push(`<!---->`);
}