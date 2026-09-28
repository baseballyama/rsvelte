import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function ColumnStacked($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet, zGet, xScale } = getContext('LayerCake');

		$$renderer.push(`<g class="column-group"><!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$data', data));

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let series = each_array[i];

			$$renderer.push(`<!--[-->`);

			const each_array_1 = $.ensure_array_like(series);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let d = each_array_1[$$index];
				const yVals = $.store_get($$store_subs ??= {}, '$yGet', yGet)(d);
				const columnHeight = yVals[0] - yVals[1];

				$$renderer.push(`<rect class="group-rect"${$.attr('data-id', i)}${$.attr('x', $.store_get($$store_subs ??= {}, '$xGet', xGet)(d))}${$.attr('y', yVals[1])}${$.attr('width', $.store_get($$store_subs ??= {}, '$xScale', xScale).bandwidth())}${$.attr('height', columnHeight)}${$.attr('fill', $.store_get($$store_subs ??= {}, '$zGet', zGet)(series))}></rect>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}