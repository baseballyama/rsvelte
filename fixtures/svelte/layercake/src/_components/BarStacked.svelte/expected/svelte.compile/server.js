import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function BarStacked($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet, zGet, yScale } = getContext('LayerCake');

		let columnWidth = $.derived(() => (d) => {
			const xVals = $.store_get($$store_subs ??= {}, '$xGet', xGet)(d);

			return xVals[1] - xVals[0];
		});

		$$renderer.push(`<g class="bar-group"><!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$data', data));

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let series = each_array[$$index_1];

			$$renderer.push(`<!--[-->`);

			const each_array_1 = $.ensure_array_like(series);

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let d = each_array_1[i];

				$$renderer.push(`<rect class="group-rect"${$.attr('data-id', i)}${$.attr('x', $.store_get($$store_subs ??= {}, '$xGet', xGet)(d)[0])}${$.attr('y', $.store_get($$store_subs ??= {}, '$yGet', yGet)(d))}${$.attr('height', $.store_get($$store_subs ??= {}, '$yScale', yScale).bandwidth())}${$.attr('width', columnWidth()(d))}${$.attr('fill', $.store_get($$store_subs ??= {}, '$zGet', zGet)(series))}></rect>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}