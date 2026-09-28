import * as $ from 'svelte/internal/server';
import Icon from '@iconify/svelte';

export default function IconButton($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {string} [icon]
	 * @property {any} [color]
	 * @property {() => void} onclick
	 */
	/** @type {Props} */
	let {
		icon = 'carbon:overflow-menu-vertical',
		color = null,
		onclick = () => {}
	} = $$props;

	let clicked = false;

	$$renderer.push(`<button${$.attr_class('show-menu svelte-rmvwxl', void 0, { 'active': clicked })}${$.attr_style('', { color })}>`);
	Icon($$renderer, { icon });
	$$renderer.push(`<!----></button>`);
}