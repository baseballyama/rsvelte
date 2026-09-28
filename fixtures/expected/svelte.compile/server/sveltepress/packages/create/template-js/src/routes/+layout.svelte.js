import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	/**
	 * @typedef {object} Props
	 * @property {import('svelte').Snippet} [children] - The children of the layout
	 */
	/** @type {Props} */
	const { children } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}