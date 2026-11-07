import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { max } from 'd3-array';

export default function GroupLabels_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, x, y, xScale, yScale, xRange, yRange, z } = getContext('LayerCake');

		/* --------------------------------------------
		 * Title case the first letter
		 */
		const cap = (val) => val.replace(/^\w/, (d) => d.toUpperCase());

		/* --------------------------------------------
		 * Put the label on the highest value
		 */
		let left = $.derived(() => (values) => $.store_get($$store_subs ??= {}, '$xScale', xScale)(max(values, $.store_get($$store_subs ??= {}, '$x', x))) / Math.max(...$.store_get($$store_subs ??= {}, '$xRange', xRange)));

		let top = $.derived(() => (values) => $.store_get($$store_subs ??= {}, '$yScale', yScale)(max(values, $.store_get($$store_subs ??= {}, '$y', y))) / Math.max(...$.store_get($$store_subs ??= {}, '$yRange', yRange)));

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$data', data));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let group = each_array[$$index];

			$$renderer.push(`<div class="label svelte-12uco9e"${$.attr_style(` top:${$.stringify(top()(group.values) * 100)}%; left:${$.stringify(left()(group.values) * 100)}%; `)}>${$.escape(cap($.store_get($$store_subs ??= {}, '$z', z)(group)))}</div>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}