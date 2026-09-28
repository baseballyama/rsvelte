import * as $ from 'svelte/internal/server';

export default function AdminActions($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let { children } = $$props;

	$$renderer.push(`<div class="flex svelte-o01myx">`);
	children?.($$renderer);
	$$renderer.push(`<!----></div>`);
}