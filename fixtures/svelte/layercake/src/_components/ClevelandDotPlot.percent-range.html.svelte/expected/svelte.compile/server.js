import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function ClevelandDotPlot_percent_range_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet, zScale, yScale, config } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {number} [r=5] - The circle radius.
		 */
		/** @type {Props} */
		let { r = 5 } = $$props;

		let midHeight = $.derived(() => $.store_get($$store_subs ??= {}, '$yScale', yScale).bandwidth() / 2);

		$$renderer.push(`<div class="dot-plot"><!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$data', data));

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let row = each_array[$$index_1];
			const scaledYValue = $.store_get($$store_subs ??= {}, '$yGet', yGet)(row);
			const scaledXValues = $.store_get($$store_subs ??= {}, '$xGet', xGet)(row);

			$$renderer.push(`<div class="dot-row"><div class="line svelte-d61hq5"${$.attr_style(` left: ${$.stringify(Math.min(...scaledXValues))}%; top: ${$.stringify(scaledYValue + midHeight())}%; right: ${$.stringify(100 - Math.max(...scaledXValues))}%; `)}></div> <!--[-->`);

			const each_array_1 = $.ensure_array_like(scaledXValues);

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let circleX = each_array_1[i];

				$$renderer.push(`<div class="circle svelte-d61hq5"${$.attr_style(` left: ${$.stringify(circleX)}%; top: ${$.stringify(scaledYValue + midHeight())}%; width: ${$.stringify(r * 2)}px; height: ${$.stringify(r * 2)}px; background: ${$.stringify($.store_get($$store_subs ??= {}, '$zScale', zScale)($.store_get($$store_subs ??= {}, '$config', config).x[i]))}; `)}></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}