import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}