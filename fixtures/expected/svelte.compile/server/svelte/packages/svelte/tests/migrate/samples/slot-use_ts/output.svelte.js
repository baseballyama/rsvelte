import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	let { children } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}