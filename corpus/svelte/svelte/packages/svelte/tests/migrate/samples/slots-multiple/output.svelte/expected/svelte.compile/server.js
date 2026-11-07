import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let { children } = $$props;

	$$renderer.push(`<button>`);
	children?.($$renderer);
	$$renderer.push(`<!----></button> <button>`);
	children?.($$renderer);
	$$renderer.push(`<!----></button>`);
}