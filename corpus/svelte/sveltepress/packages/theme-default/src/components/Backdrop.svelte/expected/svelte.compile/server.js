import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';

export default function Backdrop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {object} Props
		 * @property {boolean} [show] - Whether the backdrop is visible
		 * @property {number} [top] - The top position of the backdrop
		 * @property {number} [zIndex] - The z-index of the backdrop
		 */
		/** @type {Props} */
		const { show = false, top = 0, zIndex = 900 } = $$props;

		const dispatcher = createEventDispatcher();
		const handleClose = () => dispatcher('close');

		$$renderer.push(`<div${$.attr_class('backdrop svelte-1xy571e', void 0, { 'show': show })} role="none"${$.attr_style('', { top, 'z-index': zIndex })}></div>`);
	});
}