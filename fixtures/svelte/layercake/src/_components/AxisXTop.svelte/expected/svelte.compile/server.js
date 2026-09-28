import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function AxisXTop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { width, height, xScale, yRange } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {boolean} [tickMarks=false] - Show a vertical mark for each tick.
		 * @property {boolean} [gridlines=true] - Show gridlines extending into the chart area.
		 * @property {number} [tickMarkLength=6] - The length of the tick mark.
		 * @property {boolean} [baseline=false] - Show a solid line at the bottom.
		 * @property {boolean} [snapLabels=false] - Instead of centering the text labels on the first and the last items, align them to the edges of the chart.
		 * @property {(d: any) => string} [format=d => d] - A function that passes the current tick value and expects a nicely formatted value in return.
		 * @property {number|Array<any>|Function} [ticks] - If this is a number, it passes that along to the [d3Scale.ticks](https://github.com/d3/d3-scale) function. If this is an array, hardcodes the ticks to those values. If it's a function, passes along the default tick values and expects an array of tick values in return. If nothing, it uses the default ticks supplied by the D3 function.
		 * @property {number} [tickGutter=0] - The amount of whitespace between the start of the tick and the chart drawing area (the xRange min).
		 * @property {number} [dx=0] - Any optional value passed to the `dx` attribute on the text label.
		 * @property {number} [dy=-4] - Any optional value passed to the `dy` attribute on the text label.
		 */
		/** @type {Props} */
		let {
			tickMarks = false,
			gridlines = true,
			tickMarkLength = 6,
			baseline = false,
			snapLabels = false,
			format = (d) => d,
			ticks = undefined,
			tickGutter = 0,
			dx = 0,
			dy = -4
		} = $$props;

		/** @param {number} i
		 *  @param {boolean} sl */
		function textAnchor(i, sl) {
			if (sl === true) {
				if (i === 0) {
					return 'start';
				}

				if (i === tickVals().length - 1) {
					return 'end';
				}
			}

			return 'middle';
		}

		let tickLen = $.derived(() => tickMarks === true ? tickMarkLength ?? 6 : 0);
		let isBandwidth = $.derived(() => typeof $.store_get($$store_subs ??= {}, '$xScale', xScale).bandwidth === 'function');

		/** @type {Array<any>} */
		let tickVals = $.derived(() => Array.isArray(ticks)
			? ticks
			: isBandwidth()
				? $.store_get($$store_subs ??= {}, '$xScale', xScale).domain()
				: typeof ticks === 'function'
					? ticks($.store_get($$store_subs ??= {}, '$xScale', xScale).ticks())
					: $.store_get($$store_subs ??= {}, '$xScale', xScale).ticks(ticks));

		let halfBand = $.derived(() => isBandwidth()
			? $.store_get($$store_subs ??= {}, '$xScale', xScale).bandwidth() / 2
			: 0);

		$$renderer.push(`<g${$.attr_class('axis x-axis svelte-ezpwyj', void 0, { 'snapLabels': snapLabels })}><!--[-->`);

		const each_array = $.ensure_array_like(tickVals());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let tick = each_array[i];

			if (baseline === true) {
				$$renderer.push(`<!--[0--><line class="baseline svelte-ezpwyj" y1="0" y2="0" x1="0"${$.attr('x2', $.store_get($$store_subs ??= {}, '$width', width))}></line>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--><g${$.attr_class(`tick tick-${$.stringify(i)}`, 'svelte-ezpwyj')}${$.attr('transform', `translate(${$.stringify($.store_get($$store_subs ??= {}, '$xScale', xScale)(tick))},${$.stringify(Math.min(...$.store_get($$store_subs ??= {}, '$yRange', yRange)))})`)}>`);

			if (gridlines === true) {
				$$renderer.push(`<!--[0--><line class="gridline svelte-ezpwyj" x1="0" x2="0"${$.attr('y1', $.store_get($$store_subs ??= {}, '$height', height))} y2="0"></line>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);

			if (tickMarks === true) {
				$$renderer.push(`<!--[0--><line class="tick-mark svelte-ezpwyj"${$.attr('x1', halfBand())}${$.attr('x2', halfBand())}${$.attr('y1', -tickGutter)}${$.attr('y2', -tickLen() - tickGutter)}></line>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--><text${$.attr('x', halfBand())}${$.attr('y', -tickGutter - tickLen())}${$.attr('dx', dx)}${$.attr('dy', dy)}${$.attr('text-anchor', textAnchor(i, snapLabels))} class="svelte-ezpwyj">${$.escape(format(tick))}</text></g>`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}