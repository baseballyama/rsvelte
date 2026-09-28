import * as $ from 'svelte/internal/server';

export default function Blur_html($$renderer, $$props) {
	let { children } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}