import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<line class="gridline svelte-bwiraz" x1="0"></line>`);
var root_1 = $.from_svg(`<line class="tick-mark svelte-bwiraz"></line>`);
var root_2 = $.from_svg(`<g><!><!><text class="svelte-bwiraz"> </text></g>`);
var root_3 = $.from_svg(`<g class="axis y-axis"></g>`);

export default function AxisYRight($$anchor, $$props) {
	$.push($$props, true);

	const $yScale = () => $.store_get(yScale, '$yScale', $$stores);
	const $width = () => $.store_get(width, '$width', $$stores);
	const $xRange = () => $.store_get(xRange, '$xRange', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { xRange, yScale, width } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {boolean} [tickMarks=false] - Show marks next to the tick label.
	 * @property {string} [labelPosition='above'] - Whether the label sits even with its value ('even') or sits on top ('above') the tick mark.
	 * @property {boolean} [snapBaselineLabel=false] - When labelPosition='even', adjust the lowest label so that it sits above the tick mark.
	 * @property {boolean} [gridlines=true] - Show gridlines extending into the chart area.
	 * @property {number} [tickMarkLength] - The length of the tick mark. If not set, becomes the length of the widest tick.
	 * @property {(d: any) => string} [format=d => d] - A function that passes the current tick value and expects a nicely formatted value in return.
	 * @property {number|Array<any>|Function} [ticks=4] - If this is a number, it passes that along to the [d3Scale.ticks](https://github.com/d3/d3-scale) function. If this is an array, hardcodes the ticks to those values. If it's a function, passes along the default tick values and expects an array of tick values in return.
	 * @property {number} [tickGutter=5] - The amount of whitespace between the start of the tick and the chart drawing area (the xRange min).
	 * @property {number} [dx=0] - Any optional value passed to the `dx` attribute on the text label.
	 * @property {number} [dy=0] - Any optional value passed to the `dy` attribute on the text label.
	 * @property {number} [charPixelWidth=7.25] - Used to calculate the widest label length to offset labels. Adjust if the automatic tick length doesn't look right because you have a bigger font (or just set `tickMarkLength` to a pixel value).
	 */
	/** @type {Props} */
	let tickMarks = $.prop($$props, 'tickMarks', 3, false),
		labelPosition = $.prop($$props, 'labelPosition', 3, 'above'),
		snapBaselineLabel = $.prop($$props, 'snapBaselineLabel', 3, false),
		gridlines = $.prop($$props, 'gridlines', 3, true),
		tickMarkLength = $.prop($$props, 'tickMarkLength', 3, undefined),
		format = $.prop($$props, 'format', 3, (d) => d),
		ticks = $.prop($$props, 'ticks', 3, 4),
		tickGutter = $.prop($$props, 'tickGutter', 3, 5),
		dx = $.prop($$props, 'dx', 3, 0),
		dy = $.prop($$props, 'dy', 3, 0),
		charPixelWidth = $.prop($$props, 'charPixelWidth', 3, 7.25);

	/** @param {number} sum
	 *  @param {string} val */
	function calcStringLength(sum, val) {
		if (val === ',' || val === '.') return sum + charPixelWidth() * 0.5;

		return sum + charPixelWidth();
	}

	let isBandwidth = $.derived(() => typeof $yScale().bandwidth === 'function');

	/** @type {Array<any>} */
	let tickVals = $.derived(() => Array.isArray(ticks())
		? ticks()
		: $.get(isBandwidth)
			? $yScale().domain()
			: typeof ticks() === 'function' ? ticks()($yScale().ticks()) : $yScale().ticks(ticks()));

	let widestTickLen = $.derived(() => Math.max(10, Math.max(...$.get(tickVals).map((d) => format()(d).toString().split('').reduce(calcStringLength, 0)))));

	let tickLen = $.derived(() => tickMarks() === true
		? labelPosition() === 'above'
			? tickMarkLength() ?? $.get(widestTickLen)
			: tickMarkLength() ?? 6
		: 0);

	let x2 = $.derived(() => $width() + tickGutter() + (labelPosition() === 'above' ? $.get(widestTickLen) : $.get(tickLen)));
	let y = $.derived(() => $.get(isBandwidth) ? $yScale().bandwidth() / 2 : 0);
	let maxTickValPx = $.derived(() => Math.max(...$.get(tickVals).map($yScale())));
	var g = root_3();

	$.each(g, 20, () => $.get(tickVals), (tick) => tick, ($$anchor, tick) => {
		const tickValPx = $.derived(() => $yScale()(tick));
		var g_1 = root_2();
		var node = $.child(g_1);

		{
			var consequent = ($$anchor) => {
				var line = root();

				$.template_effect(() => {
					$.set_attribute(line, 'x2', $.get(x2));
					$.set_attribute(line, 'y1', $.get(y));
					$.set_attribute(line, 'y2', $.get(y));
				});

				$.append($$anchor, line);
			};

			$.if(node, ($$render) => {
				if (gridlines() === true) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node);

		{
			var consequent_1 = ($$anchor) => {
				var line_1 = root_1();

				$.template_effect(() => {
					$.set_attribute(line_1, 'x1', $width() + tickGutter());
					$.set_attribute(line_1, 'x2', $width() + tickGutter() + $.get(tickLen));
					$.set_attribute(line_1, 'y1', $.get(y));
					$.set_attribute(line_1, 'y2', $.get(y));
				});

				$.append($$anchor, line_1);
			};

			$.if(node_1, ($$render) => {
				if (tickMarks() === true) $$render(consequent_1);
			});
		}

		var text = $.sibling(node_1);
		var text_1 = $.only_child(text, true);

		$.reset(g_1);

		$.template_effect(
			($0) => {
				$.set_class(g_1, 0, `tick tick-${tick ?? ''}`, 'svelte-bwiraz');
				$.set_attribute(g_1, 'transform', `translate(${$xRange()[0] ?? ''}, ${$.get(tickValPx) ?? ''})`);
				$.set_attribute(text, 'x', $width() + tickGutter() + (labelPosition() === 'even' ? $.get(tickLen) : 0));
				$.set_attribute(text, 'y', $.get(y));
				$.set_attribute(text, 'dx', dx() + (labelPosition() === 'even' ? 3 : 0));
				$.set_attribute(text, 'dy', dy() + (labelPosition() === 'above' || snapBaselineLabel() === true && $.get(tickValPx) === $.get(maxTickValPx) ? -3 : 4));
				$.set_text(text_1, $0);
			},
			[() => format()(tick)]
		);

		$.append($$anchor, g_1);
	});

	$.reset(g);
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}