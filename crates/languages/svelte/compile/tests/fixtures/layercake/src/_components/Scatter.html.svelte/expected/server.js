import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Scatter_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet, xScale, yScale } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {number} [r=5] - The circle's radius.
		 * @property {string} [fill='#0cf'] - The circle's fill color.
		 * @property {string} [stroke='#000'] - The circle's stroke color.
		 * @property {number} [strokeWidth=1] - The circle's stroke width.
		 */
		/** @type {Props} */
		let { r = 5, fill = '#0cf', stroke = '#000', strokeWidth = 1 } = $$props;

		$$renderer.push(`<div class="scatter-group"><!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$data', data));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let d = each_array[$$index];

			$$renderer.push(`<div class="circle svelte-1h6qe0o"${$.attr_style(` left: ${$.stringify($.store_get($$store_subs ??= {}, '$xGet', xGet)(d) + ($.store_get($$store_subs ??= {}, '$xScale', xScale).bandwidth
				? $.store_get($$store_subs ??= {}, '$xScale', xScale).bandwidth() / 2
				: 0))}%; top: ${$.stringify($.store_get($$store_subs ??= {}, '$yGet', yGet)(d) + ($.store_get($$store_subs ??= {}, '$yScale', yScale).bandwidth
				? $.store_get($$store_subs ??= {}, '$yScale', yScale).bandwidth() / 2
				: 0))}%; width: ${$.stringify(r * 2)}px; height: ${$.stringify(r * 2)}px; background-color: ${$.stringify(fill)}; border: ${$.stringify(strokeWidth)}px solid ${$.stringify(stroke)}; `)}></div>`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}