import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { area, curveLinear } from 'd3-shape';

export default function Area_D3($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet, yScale } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {string} [fill='#ab00d610'] - The shape's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
		 * @property {import('d3-shape').CurveFactory} [curve] - An optional D3 interpolation function. See [d3-shape](https://github.com/d3/d3-shape#curves) for options. Pass this function in uncalled, i.e. without the open-close parentheses.
		 */
		/** @type {Props} */
		let { fill = '#ab00d610', curve = curveLinear } = $$props;

		let path = $.derived(() => area().x($.store_get($$store_subs ??= {}, '$xGet', xGet)).y1($.store_get($$store_subs ??= {}, '$yGet', yGet)).y0((d) => $.store_get($$store_subs ??= {}, '$yScale', yScale)(0)).curve(curve));

		$$renderer.push(`<path class="path-area"${$.attr(
			'd',
			// .defined($y)
			path()($.store_get($$store_subs ??= {}, '$data', data))
		)}${$.attr('fill', fill)}></path>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}