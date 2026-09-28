import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { line, curveLinear } from 'd3-shape';

export default function MultiLine($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet, zGet } = getContext('LayerCake');

		/** @typedef {import('d3-shape').CurveFactory} CurveFactory */
		/**
		 * @typedef {Object} Props
		 * @property {CurveFactory} [curve] - An optional D3 interpolation function. See [d3-shape](https://github.com/d3/d3-shape#curves) for options. Pass this function in uncalled, i.e. without the open-close parentheses.
		 */
		/** @type {Props} */
		let { curve = curveLinear } = $$props;

		let path = $.derived(() => line().x($.store_get($$store_subs ??= {}, '$xGet', xGet)).y($.store_get($$store_subs ??= {}, '$yGet', yGet)).curve(curve));

		$$renderer.push(`<g class="line-group"><!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$data', data));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let group = each_array[$$index];

			$$renderer.push(`<path class="path-line svelte-1f4mpbw"${$.attr('d', path()(group.values))}${$.attr('stroke', $.store_get($$store_subs ??= {}, '$zGet', zGet)(group))}></path>`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}