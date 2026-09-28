import * as $ from 'svelte/internal/server';
import Icon from '@iconify/svelte';

export default function Spinner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {string} [variant]
		 */
		/** @type {Props} */
		let { variant = 'dots' } = $$props;

		const icon = ({
			dots: 'eos-icons:three-dots-loading',
			loop: 'line-md:loading-twotone-loop'
		})[variant];

		$$renderer.push(`<div class="Spinner svelte-16qjy1n">`);
		Icon($$renderer, { icon });
		$$renderer.push(`<!----></div>`);
	});
}