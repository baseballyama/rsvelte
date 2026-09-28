import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<line class="baseline svelte-1v83wlc" x1="0"></line>`);
var root_1 = $.from_svg(`<line class="gridline svelte-1v83wlc" y2="0"></line>`);
var root_2 = $.from_svg(`<line class="tick-mark svelte-1v83wlc"></line>`);
var root_3 = $.from_svg(`<!><g><!><!><text class="svelte-1v83wlc"> </text></g>`, 1);
var root_4 = $.from_svg(`<g></g>`);

export default function AxisX($$anchor, $$props) {
	$.push($$props, true);

	const $xScale = () => $.store_get(xScale, '$xScale', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $width = () => $.store_get(width, '$width', $$stores);
	const $yRange = () => $.store_get(yRange, '$yRange', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	 * @property {number} [tickGutter=0] - The amount of whitespace between the start of the tick and the chart drawing area (the yRange min).
	 * @property {number} [dx=0] - Any optional value passed to the `dx` attribute on the text label.
	 * @property {number} [dy=12] - Any optional value passed to the `dy` attribute on the text label.
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
		dy = $.prop($$props, 'dy', 3, 12);

	/** @param {number} i
	 *  @param {boolean} sl */
	function textAnchor(i, sl) {
		if (sl === true) {
			if (i === 0) {
				return 'start';
			}

			if (i === $.get(tickVals).length - 1) {
				return 'end';
			}
		}

		return 'middle';
	}

	let tickLen = $.derived(() => tickMarks() === true ? tickMarkLength() ?? 6 : 0);
	let isBandwidth = $.derived(() => typeof $xScale().bandwidth === 'function');

	/** @type {Array<any>} */
	let tickVals = $.derived(() => Array.isArray(ticks())
		? ticks()
		: $.get(isBandwidth)
			? $xScale().domain()
			: typeof ticks() === 'function' ? ticks()($xScale().ticks()) : $xScale().ticks(ticks()));

	let halfBand = $.derived(() => $.get(isBandwidth) ? $xScale().bandwidth() / 2 : 0);
	var g = root_4();
	let classes;

	$.each(g, 22, () => $.get(tickVals), (tick) => tick, ($$anchor, tick, i) => {
		var fragment = root_3();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var line = root();

				$.template_effect(() => {
					$.set_attribute(line, 'y1', $height());
					$.set_attribute(line, 'y2', $height());
					$.set_attribute(line, 'x2', $width());
				});

				$.append($$anchor, line);
			};

			$.if(node, ($$render) => {
				if (baseline() === true) $$render(consequent);
			});
		}

		var g_1 = $.sibling(node);
		var node_1 = $.child(g_1);

		{
			var consequent_1 = ($$anchor) => {
				var line_1 = root_1();

				$.template_effect(() => {
					$.set_attribute(line_1, 'x1', $.get(halfBand));
					$.set_attribute(line_1, 'x2', $.get(halfBand));
					$.set_attribute(line_1, 'y1', -$height());
				});

				$.append($$anchor, line_1);
			};

			$.if(node_1, ($$render) => {
				if (gridlines() === true) $$render(consequent_1);
			});
		}

		var node_2 = $.sibling(node_1);

		{
			var consequent_2 = ($$anchor) => {
				var line_2 = root_2();

				$.template_effect(() => {
					$.set_attribute(line_2, 'x1', $.get(halfBand));
					$.set_attribute(line_2, 'x2', $.get(halfBand));
					$.set_attribute(line_2, 'y1', tickGutter());
					$.set_attribute(line_2, 'y2', tickGutter() + $.get(tickLen));
				});

				$.append($$anchor, line_2);
			};

			$.if(node_2, ($$render) => {
				if (tickMarks() === true) $$render(consequent_2);
			});
		}

		var text = $.sibling(node_2);
		var text_1 = $.only_child(text, true);

		$.reset(g_1);

		$.template_effect(
			($0, $1, $2, $3) => {
				$.set_class(g_1, 0, `tick tick-${$.get(i) ?? ''}`, 'svelte-1v83wlc');
				$.set_attribute(g_1, 'transform', `translate(${$0 ?? ''},${$1 ?? ''})`);
				$.set_attribute(text, 'x', $.get(halfBand));
				$.set_attribute(text, 'y', tickGutter() + $.get(tickLen));
				$.set_attribute(text, 'dx', dx());
				$.set_attribute(text, 'dy', dy());
				$.set_attribute(text, 'text-anchor', $2);
				$.set_text(text_1, $3);
			},
			[
				() => $xScale()(tick),
				() => Math.max(...$yRange()),
				() => textAnchor($.get(i), snapLabels()),
				() => format()(tick)
			]
		);

		$.append($$anchor, fragment);
	});

	$.reset(g);
	$.template_effect(() => classes = $.set_class(g, 0, 'axis x-axis svelte-1v83wlc', null, classes, { snapLabels: snapLabels() }));
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}