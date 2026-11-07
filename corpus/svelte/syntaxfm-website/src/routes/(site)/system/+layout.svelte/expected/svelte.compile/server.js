import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let { children } = $$props;

	$$renderer.push(`<nav class="l-margin sticky zone svelte-9600io"><ul class="svelte-9600io"><li class="svelte-9600io"><a href="/system/colors">Colors</a></li> <li class="svelte-9600io"><a href="/system/layout">Layout</a></li> <li class="svelte-9600io"><a href="/system/typography">Typography</a></li> <li class="svelte-9600io"><a href="/system/theme">Theme</a></li></ul></nav> `);
	children?.($$renderer);
	$$renderer.push(`<!---->`);
}