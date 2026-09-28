import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Column($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, xGet, yGet, x, yRange, xScale, y, height } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {string} [fill='#00e047'] - The shape's fill color.
		 * @property {string} [stroke='#000'] - The shape's stroke color.
		 * @property {number} [strokeWidth=0] - The shape's stroke width.
		 * @property {boolean} [showLabels=false] - Show the numbers for each column
		 */
		/** @type {Props} */
		let {
			fill = '#00e047',
			stroke = '#000',
			strokeWidth = 0,
			showLabels = false
		} = $$props;

		let columnWidth = $.derived(() => (d) => {
			const vals = $.store_get($$store_subs ??= {}, '$xGet', xGet)(d);

			return Math.abs(vals[1] - vals[0]);
		});

		let columnHeight = $.derived(() => (d) => {
			return $.store_get($$store_subs ??= {}, '$yRange', yRange)[0] - $.store_get($$store_subs ??= {}, '$yGet', yGet)(d);
		});

		$$renderer.push(`<g class="column-group"><!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$data', data));

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let d = each_array[i];
			const colHeight = columnHeight()(d);
			const xGot = $.store_get($$store_subs ??= {}, '$xGet', xGet)(d);
			const xPos = Array.isArray(xGot) ? xGot[0] : xGot;

			const colWidth = $.store_get($$store_subs ??= {}, '$xScale', xScale).bandwidth
				? $.store_get($$store_subs ??= {}, '$xScale', xScale).bandwidth()
				: columnWidth()(d);

			const yValue = $.store_get($$store_subs ??= {}, '$y', y)(d);

			$$renderer.push(`<rect class="group-rect"${$.attr('data-id', i)}${$.attr('data-range', $.store_get($$store_subs ??= {}, '$x', x)(d))}${$.attr('data-count', yValue)}${$.attr('x', xPos)}${$.attr('y', $.store_get($$store_subs ??= {}, '$yGet', yGet)(d))}${$.attr('width', colWidth)}${$.attr('height', colHeight)}${$.attr('fill', fill)}${$.attr('stroke', stroke)}${$.attr('stroke-width', strokeWidth)}></rect>`);

			if (showLabels && yValue) {
				$$renderer.push(`<!--[0--><text${$.attr('x', xPos + colWidth / 2)}${$.attr('y', $.store_get($$store_subs ??= {}, '$height', height) - colHeight - 5)} text-anchor="middle" class="svelte-7y7xbv">${$.escape(yValue)}</text>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}