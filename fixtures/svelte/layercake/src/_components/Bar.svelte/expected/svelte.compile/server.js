import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Bar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet, xScale, yScale } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {string} [fill='#00bbff'] - The shape's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
		 */
		/** @type {Props} */
		let { fill = '#00bbff' } = $$props;

		$$renderer.push(`<g class="bar-group"><!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$data', data));

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let d = each_array[i];

			$$renderer.push(`<rect class="group-rect"${$.attr('data-id', i)}${$.attr('x', $.store_get($$store_subs ??= {}, '$xScale', xScale).range()[0])}${$.attr('y', $.store_get($$store_subs ??= {}, '$yGet', yGet)(d))}${$.attr('height', $.store_get($$store_subs ??= {}, '$yScale', yScale).bandwidth())}${$.attr('width', $.store_get($$store_subs ??= {}, '$xGet', xGet)(d))}${$.attr('fill', fill)}></rect>`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}