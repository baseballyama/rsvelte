import * as $ from 'svelte/internal/server';
import Icon from '@iconify/svelte';

export default function RichTextButton($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {string} icon
	 * @property {boolean} [active]
	 * @property {boolean} [disabled]
	 * @property {() => void} onclick
	 * @property {string} [aria_label]
	 */
	/** @type {Props} */
	let { icon, active = false, disabled = false, onclick, aria_label } = $$props;

	$$renderer.push(`<button${$.attr_class('RichTextButton svelte-ul78pw', void 0, { 'active': active, 'disabled': disabled })}${$.attr('disabled', disabled, true)}${$.attr('aria-label', aria_label)}>`);
	Icon($$renderer, { icon, width: '15', height: '15' });
	$$renderer.push(`<!----></button>`);
}