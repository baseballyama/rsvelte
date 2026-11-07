import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<div class="gridline svelte-c3d9u1"></div>`);
var root_1 = $.from_html(`<div class="tick-mark svelte-c3d9u1"></div>`);
var root_2 = $.from_html(`<div><!> <!> <div class="text svelte-c3d9u1"> </div></div>`);
var root_3 = $.from_html(`<div class="axis y-axis svelte-c3d9u1"></div>`);

export default function AxisYRight_percent_range_html($$anchor, $$props) {
	$.push($$props, true);

	const $percentRange = () => $.store_get(percentRange, '$percentRange', $$stores);
	const $yScale = () => $.store_get(yScale, '$yScale', $$stores);
	const $xRange = () => $.store_get(xRange, '$xRange', $$stores);
	const $width = () => $.store_get(width, '$width', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { xRange, yScale, width, percentRange } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {boolean} [tickMarks=true] - Show marks next to the tick label.
	 * @property {string} [labelPosition='even'] - Whether the label sits even with its value ('even') or sits on top ('above') the tick mark. Default is 'even'.
	 * @property {boolean} [snapBaselineLabel=false] - When labelPosition='even', adjust the lowest label so that it sits above the tick mark.
	 * @property {boolean} [gridlines=true] - Show gridlines extending into the chart area.
	 * @property {number} [tickMarkLength] - The length of the tick mark. If not set, becomes the length of the widest tick.
	 * @property {(d: any) => string} [format=d => d] - A function that passes the current tick value and expects a nicely formatted value in return.
	 * @property {number|Array<any>|Function} [ticks=4] - If this is a number, it passes that along to the [d3Scale.ticks](https://github.com/d3/d3-scale) function. If this is an array, hardcodes the ticks to those values. If it's a function, passes along the default tick values and expects an array of tick values in return.
	 * @property {number} [tickGutter=5] - The amount of whitespace between the start of the tick and the chart drawing area (the xRange min).
	 * @property {number} [dx=0] - Any optional value passed to the `dx` attribute on the text label.
	 * @property {number} [dy=0] - Any optional value passed to the `dy` attribute on the text label.
	 * @property {number} [charPixelWidth=7.25] - Used to calculate the widest label length to offset labels. Adjust if the automatic tick length doesn't look right because you have a bigger font (or just set `tickMarkLength` to a pixel value).
	 * @property {'px'|'%'} [units] - Whether this component should use percentage or pixel values. If `percentRange={true}` it defaults to `'%'`.
	 */
	/** @type {Props} */
	let tickMarks = $.prop($$props, 'tickMarks', 3, true),
		labelPosition = $.prop($$props, 'labelPosition', 3, 'even'),
		snapBaselineLabel = $.prop($$props, 'snapBaselineLabel', 3, false),
		gridlines = $.prop($$props, 'gridlines', 3, true),
		tickMarkLength = $.prop($$props, 'tickMarkLength', 3, undefined),
		format = $.prop($$props, 'format', 3, (d) => d),
		ticks = $.prop($$props, 'ticks', 3, 4),
		tickGutter = $.prop($$props, 'tickGutter', 3, 5),
		dx = $.prop($$props, 'dx', 3, 0),
		dy = $.prop($$props, 'dy', 19, () => -3),
		charPixelWidth = $.prop($$props, 'charPixelWidth', 3, 7.25),
		units = $.prop($$props, 'units', 19, () => $percentRange() === true ? '%' : 'px');

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

	let halfBand = $.derived(() => $.get(isBandwidth) ? $yScale().bandwidth() / 2 : 0);
	let maxTickValUnits = $.derived(() => Math.max(...$.get(tickVals).map($yScale())));
	var div = root_3();

	$.each(div, 22, () => $.get(tickVals), (tick) => tick, ($$anchor, tick, i) => {
		const tickValUnits = $.derived(() => $yScale()(tick));
		var div_1 = root_2();
		var node = $.child(div_1);

		{
			var consequent = ($$anchor) => {
				var div_2 = root();
				let styles;

				$.template_effect(() => styles = $.set_style(div_2, '0', styles, {
					left: '0px',
					right: `${(labelPosition() === 'above' ? -$.get(widestTickLen) : -$.get(tickLen)) - tickGutter()}px`
				}));

				$.append($$anchor, div_2);
			};

			$.if(node, ($$render) => {
				if (gridlines() === true) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			var consequent_1 = ($$anchor) => {
				var div_3 = root_1();
				let styles_1;

				$.template_effect(() => styles_1 = $.set_style(div_3, '', styles_1, {
					top: '0',
					left: `${$width() + tickGutter()}px`,
					width: `${$.get(tickLen) ?? ''}px`
				}));

				$.append($$anchor, div_3);
			};

			$.if(node_1, ($$render) => {
				if (tickMarks() === true) $$render(consequent_1);
			});
		}

		var div_4 = $.sibling(node_1, 2);
		let styles_2;
		var text = $.only_child(div_4, true);

		$.reset(div_1);

		$.template_effect(
			($0) => {
				$.set_class(div_1, 1, `tick tick-${$.get(i) ?? ''}`, 'svelte-c3d9u1');
				$.set_style(div_1, `left:${$xRange()[0] ?? ''}${units() ?? ''};top:${$.get(tickValUnits) + $.get(halfBand)}${units() ?? ''};`);

				styles_2 = $.set_style(div_4, '', styles_2, {
					top: '0',
					left: `calc(100% + ${tickGutter() + (labelPosition() === 'even' ? $.get(tickLen) : 0)}px)`,
					transform: `translate(${dx() + (labelPosition() === 'even' ? 3 : 0)}px, calc(-50% + ${dy() + (labelPosition() === 'above' || snapBaselineLabel() === true && $.get(tickValUnits) === $.get(maxTickValUnits) ? -3 : 4)}px))`
				});

				$.set_text(text, $0);
			},
			[() => format()(tick)]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}