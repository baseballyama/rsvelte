import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	let { children } = $$props;

	children($$renderer, true);
	$$renderer.push(`<!---->`);
}