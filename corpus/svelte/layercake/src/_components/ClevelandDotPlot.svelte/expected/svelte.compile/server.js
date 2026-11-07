import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function ClevelandDotPlot($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet, yScale, zScale, config } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {number} [r=5] - The circle radius.
		 */
		/** @type {Props} */
		let { r = 5 } = $$props;

		let midHeight = $.derived(() => $.store_get($$store_subs ??= {}, '$yScale', yScale).bandwidth() / 2);

		$$renderer.push(`<g class="dot-plot"><!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$data', data));

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let row = each_array[$$index_1];
			const yVal = $.store_get($$store_subs ??= {}, '$yGet', yGet)(row);
			const xVals = $.store_get($$store_subs ??= {}, '$xGet', xGet)(row);

			$$renderer.push(`<g class="dot-row"><line${$.attr('x1', Math.min(...xVals))}${$.attr('y1', yVal + midHeight())}${$.attr('x2', Math.max(...xVals))}${$.attr('y2', yVal + midHeight())} class="svelte-732q9b"></line><!--[-->`);

			const each_array_1 = $.ensure_array_like(xVals);

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let circleX = each_array_1[i];

				$$renderer.push(`<circle${$.attr('cx', circleX)}${$.attr('cy', yVal + midHeight())}${$.attr('r', r)}${$.attr('fill', $.store_get($$store_subs ??= {}, '$zScale', zScale)($.store_get($$store_subs ??= {}, '$config', config).x[i]))} class="svelte-732q9b"></circle>`);
			}

			$$renderer.push(`<!--]--></g>`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}