import * as $ from 'svelte/internal/server';

export default function Outer($$renderer, $$props) {
	let { children } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}