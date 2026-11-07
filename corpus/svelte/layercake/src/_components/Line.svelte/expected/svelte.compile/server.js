import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Line($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {string} [stroke='#ab00d6'] - The shape's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
		 */
		/** @type {Props} */
		let { stroke = '#ab00d6' } = $$props;

		let path = $.derived(() => 'M' + $.store_get($$store_subs ??= {}, '$data', data).map((d) => {
			return $.store_get($$store_subs ??= {}, '$xGet', xGet)(d) + ',' + $.store_get($$store_subs ??= {}, '$yGet', yGet)(d);
		}).join('L'));

		$$renderer.push(`<path class="path-line svelte-1e7dnfv"${$.attr('d', path())}${$.attr('stroke', stroke)}></path>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}