import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let { children } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}