import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {ShouldNotUseTSBecauseImUsingJsDoc} data
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let { data, children } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}