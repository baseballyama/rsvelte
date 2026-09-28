import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { line, curveLinear } from 'd3-shape';

export default function Line_D3($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet } = getContext('LayerCake');

		/** @typedef {import('d3-shape').CurveFactory} CurveFactory */
		/**
		 * @typedef {Object} Props
		 * @property {string} [stroke='#ab00d6'] - The shape's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
		 * @property {CurveFactory} [curve=curveLinear] - An optional D3 interpolation function. See [d3-shape](https://github.com/d3/d3-shape#curves) for options. Pass this function in uncalled, i.e. without the open-close parentheses.
		 */
		/** @type {Props} */
		let { stroke = '#ab00d6', curve = curveLinear } = $$props;

		let path = $.derived(() => line().x($.store_get($$store_subs ??= {}, '$xGet', xGet)).y($.store_get($$store_subs ??= {}, '$yGet', yGet)).curve(curve));

		$$renderer.push(`<path class="path-line svelte-a4z7ld"${$.attr(
			'd',
			// .defined($y)
			path()($.store_get($$store_subs ??= {}, '$data', data))
		)}${$.attr('stroke', stroke)}></path>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}