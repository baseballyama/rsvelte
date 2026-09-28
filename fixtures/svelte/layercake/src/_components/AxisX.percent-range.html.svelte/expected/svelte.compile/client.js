import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<div class="baseline svelte-1w1noy2" style="top:100%; width:100%;"></div>`);
var root_1 = $.from_html(`<div class="gridline svelte-1w1noy2"></div>`);
var root_2 = $.from_html(`<div class="tick-mark svelte-1w1noy2"></div>`);
var root_3 = $.from_html(`<!> <!> <!> <div><div class="text svelte-1w1noy2"> </div></div>`, 1);
var root_4 = $.from_html(`<div></div>`);

export default function AxisX_percent_range_html($$anchor, $$props) {
	$.push($$props, true);

	const $percentRange = () => $.store_get(percentRange, '$percentRange', $$stores);
	const $xScale = () => $.store_get(xScale, '$xScale', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	let tickMarks = $.prop($$props, 'tickMarks', 3, false),
		gridlines = $.prop($$props, 'gridlines', 3, true),
		tickMarkLength = $.prop($$props, 'tickMarkLength', 3, 6),
		baseline = $.prop($$props, 'baseline', 3, false),
		snapLabels = $.prop($$props, 'snapLabels', 3, false),
		format = $.prop($$props, 'format', 3, (d) => d),
		ticks = $.prop($$props, 'ticks', 3, undefined),
		tickGutter = $.prop($$props, 'tickGutter', 3, 0),
		dx = $.prop($$props, 'dx', 3, 0),
		dy = $.prop($$props, 'dy', 3, 0),
		units = $.prop($$props, 'units', 19, () => $percentRange() === true ? '%' : 'px');

	let tickLen = $.derived(() => tickMarks() === true ? tickMarkLength() ?? 6 : 0);
	let isBandwidth = $.derived(() => typeof $xScale().bandwidth === 'function');

	/** @type {Array<any>} */
	let tickVals = $.derived(() => Array.isArray(ticks())
		? ticks()
		: $.get(isBandwidth)
			? $xScale().domain()
			: typeof ticks() === 'function' ? ticks()($xScale().ticks()) : $xScale().ticks(ticks()));

	let halfBand = $.derived(() => $.get(isBandwidth) ? $xScale().bandwidth() / 2 : 0);
	var div = root_4();
	let classes;

	$.each(div, 22, () => $.get(tickVals), (tick) => tick, ($$anchor, tick, i) => {
		const tickValUnits = $.derived(() => $xScale()(tick));
		var fragment = root_3();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div_1 = root();

				$.append($$anchor, div_1);
			};

			$.if(node, ($$render) => {
				if (baseline() === true) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			var consequent_1 = ($$anchor) => {
				var div_2 = root_1();
				let styles;

				$.template_effect(() => styles = $.set_style(div_2, 'top:0; bottom:0;', styles, { left: `${$.get(tickValUnits) ?? ''}${units() ?? ''}` }));
				$.append($$anchor, div_2);
			};

			$.if(node_1, ($$render) => {
				if (gridlines() === true) $$render(consequent_1);
			});
		}

		var node_2 = $.sibling(node_1, 2);

		{
			var consequent_2 = ($$anchor) => {
				var div_3 = root_2();
				let styles_1;

				$.template_effect(() => styles_1 = $.set_style(div_3, '', styles_1, {
					left: `${$.get(tickValUnits) + $.get(halfBand)}${units() ?? ''}`,
					height: `${$.get(tickLen) ?? ''}px`,
					bottom: `${-$.get(tickLen) - tickGutter()}px`
				}));

				$.append($$anchor, div_3);
			};

			$.if(node_2, ($$render) => {
				if (tickMarks() === true) $$render(consequent_2);
			});
		}

		var div_4 = $.sibling(node_2, 2);
		let styles_2;
		var div_5 = $.child(div_4);
		let styles_3;
		var text = $.only_child(div_5, true);

		$.reset(div_4);

		$.template_effect(
			($0) => {
				$.set_class(div_4, 1, `tick tick-${$.get(i) ?? ''}`, 'svelte-1w1noy2');

				styles_2 = $.set_style(div_4, `top:calc(100% + ${tickGutter() ?? ''}px);`, styles_2, {
					left: `${$.get(tickValUnits) + $.get(halfBand)}${units() ?? ''}`
				});

				styles_3 = $.set_style(div_5, '', styles_3, {
					top: `${$.get(tickLen) ?? ''}px`,
					transform: `translate(calc(-50% + ${dx() ?? ''}px), ${dy() ?? ''}px)`
				});

				$.set_text(text, $0);
			},
			[() => format()(tick)]
		);

		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.template_effect(() => classes = $.set_class(div, 1, 'axis x-axis svelte-1w1noy2', null, classes, { snapLabels: snapLabels() }));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}