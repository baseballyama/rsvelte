import * as $ from 'svelte/internal/server';

export default function Badge($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let { children } = $$props;

	$$renderer.push(`<span class="badge text-sm svelte-1ivuhw7">`);
	children?.($$renderer);
	$$renderer.push(`<!----></span>`);
}