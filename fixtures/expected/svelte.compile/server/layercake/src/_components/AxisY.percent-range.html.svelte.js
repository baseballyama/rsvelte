import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function AxisY_percent_range_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { xRange, yScale, percentRange } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {boolean} [tickMarks=false] - Show marks next to the tick label.
		 * @property {string} [labelPosition='even'] - Whether the label sits even with its value ('even') or sits on top ('above') the tick mark. Default is 'even'.
		 * @property {boolean} [snapBaselineLabel=false] - When labelPosition='even', adjust the lowest label so that it sits above the tick mark.
		 * @property {boolean} [gridlines=true] - Show gridlines extending into the chart area.
		 * @property {number} [tickMarkLength] - The length of the tick mark. If not set, becomes the length of the widest tick.
		 * @property {(d: any) => string} [format=d => d] - A function that passes the current tick value and expects a nicely formatted value in return.
		 * @property {number|Array<any>|Function} [ticks=4] - If this is a number, it passes that along to the [d3Scale.ticks](https://github.com/d3/d3-scale) function. If this is an array, hardcodes the ticks to those values. If it's a function, passes along the default tick values and expects an array of tick values in return.
		 * @property {number} [tickGutter=0] - The amount of whitespace between the start of the tick and the chart drawing area (the xRange min).
		 * @property {number} [dx=0] - Any optional value passed to the `dx` attribute on the text label.
		 * @property {number} [dy=-3] - Any optional value passed to the `dy` attribute on the text label.
		 * @property {number} [charPixelWidth=7.25] - Used to calculate the widest label length to offset labels. Adjust if the automatic tick length doesn't look right because you have a bigger font (or just set `tickMarkLength` to a pixel value).
		 * @property {'px'|'%'} [units] - If `percentRange={true}` it defaults to `'%'`, otherwise, the default is `'px'`. Options: `'%'` or `'px'`
		 */
		/** @type {Props} */
		let {
			tickMarks = false,
			labelPosition = 'even',
			snapBaselineLabel = false,
			gridlines = true,
			tickMarkLength = undefined,
			format = (d) => d,
			ticks = 4,
			tickGutter = 0,
			dx = 0,
			dy = -3,
			charPixelWidth = 7.25,
			units = $.store_get($$store_subs ??= {}, '$percentRange', percentRange) === true ? '%' : 'px'
		} = $$props;

		/** @param {number} sum
		 *  @param {string} val */
		function calcStringLength(sum, val) {
			if (val === ',' || val === '.') return sum + charPixelWidth * 0.5;

			return sum + charPixelWidth;
		}

		let isBandwidth = $.derived(() => typeof $.store_get($$store_subs ??= {}, '$yScale', yScale).bandwidth === 'function');

		/** @type {Array<any>} */
		let tickVals = $.derived(() => Array.isArray(ticks)
			? ticks
			: isBandwidth()
				? $.store_get($$store_subs ??= {}, '$yScale', yScale).domain()
				: typeof ticks === 'function'
					? ticks($.store_get($$store_subs ??= {}, '$yScale', yScale).ticks())
					: $.store_get($$store_subs ??= {}, '$yScale', yScale).ticks(ticks));

		let widestTickLen = $.derived(() => Math.max(10, Math.max(...tickVals().map((d) => format(d).toString().split('').reduce(calcStringLength, 0)))));

		let tickLen = $.derived(() => tickMarks === true
			? labelPosition === 'above'
				? tickMarkLength ?? widestTickLen()
				: tickMarkLength ?? 6
			: 0);

		let x1 = $.derived(() => -tickGutter - (labelPosition === 'above' ? widestTickLen() : tickLen()));

		let halfBand = $.derived(() => isBandwidth()
			? $.store_get($$store_subs ??= {}, '$yScale', yScale).bandwidth() / 2
			: 0);

		let maxTickValUnits = $.derived(() => Math.max(...tickVals().map($.store_get($$store_subs ??= {}, '$yScale', yScale))));

		$$renderer.push(`<div class="axis y-axis svelte-1395tj"><!--[-->`);

		const each_array = $.ensure_array_like(tickVals());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let tick = each_array[i];
			const tickValUnits = $.store_get($$store_subs ??= {}, '$yScale', yScale)(tick);

			$$renderer.push(`<div${$.attr_class(`tick tick-${$.stringify(i)}`, 'svelte-1395tj')}${$.attr_style(`left:${$.stringify($.store_get($$store_subs ??= {}, '$xRange', xRange)[0])}${$.stringify(units)};top:${$.stringify(tickValUnits + halfBand())}${$.stringify(units)};`)}>`);

			if (gridlines === true) {
				$$renderer.push(`<!--[0--><div class="gridline svelte-1395tj"${$.attr_style('top:0;', { left: `${$.stringify(x1())}px`, right: '0px' })}></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (tickMarks === true) {
				$$renderer.push(`<!--[0--><div class="tick-mark svelte-1395tj"${$.attr_style('', {
					top: '0',
					left: `${$.stringify(x1())}px`,
					width: `${$.stringify(tickLen())}px`
				})}></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="text svelte-1395tj"${$.attr_style('', {
				top: '0',
				'text-align': labelPosition === 'even' ? 'right' : 'left',
				width: `${$.stringify(widestTickLen())}px`,
				left: `${$.stringify(-widestTickLen() - tickGutter - (labelPosition === 'even' ? tickLen() : 0))}px`,
				transform: `translate(${$.stringify(dx + (labelPosition === 'even' ? -3 : 0))}px, calc(-50% + ${$.stringify(dy + (labelPosition === 'above' || snapBaselineLabel === true && tickValUnits === maxTickValUnits() ? -3 : 4))}px))`
			})}>${$.escape(format(tick))}</div></div>`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}