import * as $ from 'svelte/internal/server';
import External from './icons/External.svelte';
import { getPathFromBase } from './utils';

export default function ActionButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {object} Props
		 * @property {any} label - The text to display on the button
		 * @property {string} [type] - The type of the button
		 * @property {any} to - The path to navigate to
		 * @property {boolean} [external] - Whether the link is external
		 */
		/** @type {Props} */
		let { label, type = '', to, external = false } = $$props;

		$$renderer.push(`<a${$.attr('href', external ? to : getPathFromBase(to))}${$.attr_class(`svp-action ${type ? `svp-action--${type}` : ''}`, 'svelte-1t8w6jm')}${$.attr('target', external ? '_blank' : '')}><span class="label svelte-1t8w6jm">${$.escape(label)}</span> `);

		if (external) {
			$$renderer.push(`<!--[0--><div class="external-icon svelte-1t8w6jm">`);
			External($$renderer, {});
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></a>`);
	});
}