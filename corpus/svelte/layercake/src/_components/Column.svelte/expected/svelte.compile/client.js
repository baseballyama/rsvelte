import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<text text-anchor="middle" class="svelte-7y7xbv"> </text>`);
var root_1 = $.from_svg(`<rect class="group-rect"></rect><!>`, 1);
var root_2 = $.from_svg(`<g class="column-group"></g>`);

export default function Column($$anchor, $$props) {
	$.push($$props, true);

	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $yRange = () => $.store_get(yRange, '$yRange', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $xScale = () => $.store_get(xScale, '$xScale', $$stores);
	const $y = () => $.store_get(y, '$y', $$stores);
	const $x = () => $.store_get(x, '$x', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yGet, x, yRange, xScale, y, height } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {string} [fill='#00e047'] - The shape's fill color.
	 * @property {string} [stroke='#000'] - The shape's stroke color.
	 * @property {number} [strokeWidth=0] - The shape's stroke width.
	 * @property {boolean} [showLabels=false] - Show the numbers for each column
	 */
	/** @type {Props} */
	let fill = $.prop($$props, 'fill', 3, '#00e047'),
		stroke = $.prop($$props, 'stroke', 3, '#000'),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 0),
		showLabels = $.prop($$props, 'showLabels', 3, false);

	let columnWidth = $.derived(() => (d) => {
		const vals = $xGet()(d);

		return Math.abs(vals[1] - vals[0]);
	});

	let columnHeight = $.derived(() => (d) => {
		return $yRange()[0] - $yGet()(d);
	});

	var g = root_2();

	$.each(g, 5, $data, $.index, ($$anchor, d, i) => {
		const colHeight = $.derived(() => $.get(columnHeight)($.get(d)));
		const xGot = $.derived(() => $xGet()($.get(d)));
		const xPos = $.derived(() => Array.isArray($.get(xGot)) ? $.get(xGot)[0] : $.get(xGot));
		const colWidth = $.derived(() => $xScale().bandwidth ? $xScale().bandwidth() : $.get(columnWidth)($.get(d)));
		const yValue = $.derived(() => $y()($.get(d)));
		var fragment = root_1();
		var rect = $.first_child(fragment);

		$.set_attribute(rect, 'data-id', i);

		var node = $.sibling(rect);

		{
			var consequent = ($$anchor) => {
				var text = root();
				var text_1 = $.only_child(text, true);

				$.template_effect(() => {
					$.set_attribute(text, 'x', $.get(xPos) + $.get(colWidth) / 2);
					$.set_attribute(text, 'y', $height() - $.get(colHeight) - 5);
					$.set_text(text_1, $.get(yValue));
				});

				$.append($$anchor, text);
			};

			$.if(node, ($$render) => {
				if (showLabels() && $.get(yValue)) $$render(consequent);
			});
		}

		$.template_effect(
			($0, $1) => {
				$.set_attribute(rect, 'data-range', $0);
				$.set_attribute(rect, 'data-count', $.get(yValue));
				$.set_attribute(rect, 'x', $.get(xPos));
				$.set_attribute(rect, 'y', $1);
				$.set_attribute(rect, 'width', $.get(colWidth));
				$.set_attribute(rect, 'height', $.get(colHeight));
				$.set_attribute(rect, 'fill', fill());
				$.set_attribute(rect, 'stroke', stroke());
				$.set_attribute(rect, 'stroke-width', strokeWidth());
			},
			[() => $x()($.get(d)), () => $yGet()($.get(d))]
		);

		$.append($$anchor, fragment);
	});

	$.reset(g);
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}