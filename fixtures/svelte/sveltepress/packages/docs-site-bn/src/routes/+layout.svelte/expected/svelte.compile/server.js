import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	const { children } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}