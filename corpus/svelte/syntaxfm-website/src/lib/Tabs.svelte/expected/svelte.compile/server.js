import * as $ from 'svelte/internal/server';

export default function Tabs($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let { children } = $$props;

	$$renderer.push(`<div class="tabs grit">`);
	children?.($$renderer);
	$$renderer.push(`<!----></div>`);
}