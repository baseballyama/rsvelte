import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	const { children } = $$props;

	children($$renderer);
	$$renderer.push(`<!---->`);
}