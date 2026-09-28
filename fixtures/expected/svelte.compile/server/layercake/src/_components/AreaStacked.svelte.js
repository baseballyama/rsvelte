import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { area } from 'd3-shape';

export default function AreaStacked($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yScale, zGet } = getContext('LayerCake');
		let areaGen = $.derived(() => area().x((d) => $.store_get($$store_subs ??= {}, '$xGet', xGet)(d)).y0((d) => $.store_get($$store_subs ??= {}, '$yScale', yScale)(d[0])).y1((d) => $.store_get($$store_subs ??= {}, '$yScale', yScale)(d[1])));

		$$renderer.push(`<g class="area-group"><!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$data', data));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let d = each_array[$$index];

			$$renderer.push(`<path class="path-area"${$.attr('d', areaGen()(d))}${$.attr('fill', $.store_get($$store_subs ??= {}, '$zGet', zGet)(d))}></path>`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}