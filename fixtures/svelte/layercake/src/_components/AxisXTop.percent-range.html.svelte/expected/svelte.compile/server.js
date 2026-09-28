import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function AxisXTop_percent_range_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { xScale, percentRange } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {boolean} [tickMarks=false] - Show a vertical mark for each tick.
		 * @property {boolean} [gridlines=true] - Show gridlines extending into the chart area.
		 * @property {number} [tickMarkLength=6] - The length of the tick mark.
		 * @property {boolean} [baseline=false] - Show a solid line at the bottom.
		 * @property {boolean} [snapLabels=false] - Instead of centering the text labels on the first and the last items, align them to the edges of the chart.
		 * @property {(d: any) => string} [format=d => d] - A function that passes the current tick value and expects a nicely formatted value in return.
		 * @property {number|Array<any>|Function} [ticks] - If this is a number, it passes that along to the [d3Scale.ticks](https://github.com/d3/d3-scale) function. If this is an array, hardcodes the ticks to those values. If it's a function, passes along the default tick values and expects an array of tick values in return. If nothing, it uses the default ticks supplied by the D3 function.
		 * @property {number} [tickGutter=0] - The amount of whitespace between the start of the tick and the chart drawing area (the yRange min).
		 * @property {number} [dx=0] - Any optional value passed to the `dx` attribute on the text label.
		 * @property {number} [dy=0] - Any optional value passed to the `dy` attribute on the text label.
		 * @property {'px'|'%'} [units] - If `percentRange={true}` it defaults to `'%'`, otherwise, the default is `'px'`. Options: `'%'` or `'px'`
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
			dy = 0,
			units = $.store_get($$store_subs ??= {}, '$percentRange', percentRange) === true ? '%' : 'px'
		} = $$props;

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

		$$renderer.push(`<div${$.attr_class('axis x-axis svelte-1i6hm0d', void 0, { 'snapLabels': snapLabels })}><!--[-->`);

		const each_array = $.ensure_array_like(tickVals());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let tick = each_array[i];
			const tickValUnits = $.store_get($$store_subs ??= {}, '$xScale', xScale)(tick);

			if (baseline === true) {
				$$renderer.push(`<!--[0--><div class="baseline svelte-1i6hm0d" style="top:0; width:100%;"></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (gridlines === true) {
				$$renderer.push(`<!--[0--><div class="gridline svelte-1i6hm0d"${$.attr_style('top:0; bottom:0;', { left: `${$.stringify(tickValUnits)}${$.stringify(units)}` })}></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (tickMarks === true) {
				$$renderer.push(`<!--[0--><div class="tick-mark svelte-1i6hm0d"${$.attr_style('', {
					left: `${$.stringify(tickValUnits + halfBand())}${$.stringify(units)}`,
					height: `${$.stringify(tickLen())}px`,
					top: `${$.stringify(-tickLen() - tickGutter)}px`
				})}></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div${$.attr_class(`tick tick-${$.stringify(i)}`, 'svelte-1i6hm0d')}${$.attr_style(`top:${$.stringify(-tickGutter)}px;`, {
				left: `${$.stringify(tickValUnits + halfBand())}${$.stringify(units)}`
			})}><div class="text svelte-1i6hm0d"${$.attr_style('', {
				top: -tickLen() + 2 + 'px',
				transform: `translate(calc(-50% + ${dx}px), calc(-100% + ${dy}px))`
			})}>${$.escape(format(tick))}</div></div>`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}