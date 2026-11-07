import * as $ from 'svelte/internal/server';

export default function Svg($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<svg>`);
	children($$renderer);
	$$renderer.push(`<!----></svg>`);
}