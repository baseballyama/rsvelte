import * as $ from 'svelte/internal/server';

export default function Switch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {string} [label]
		 * @property {any} value
		 * @property {() => void} oninput
		 */
		/** @type {Props} */
		let { label = '', value, oninput } = $$props;

		$$renderer.push(`<div class="label-container svelte-pimk5q"><label class="svelte-pimk5q">`);

		if (label) {
			$$renderer.push(`<!--[0--><span class="primo--field-label">${$.escape(label)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="switch-container svelte-pimk5q"><input type="checkbox"${$.attr('checked', value, true)} class="svelte-pimk5q"/> <span class="svelte-pimk5q"></span></div></label></div>`);
	});
}