import * as $ from 'svelte/internal/server';

export default function Badges($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let { children } = $$props;

	$$renderer.push(`<div class="badges svelte-17em8lw">`);
	children?.($$renderer);
	$$renderer.push(`<!----></div>`);
}