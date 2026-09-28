import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<circle></circle>`);
var root_1 = $.from_svg(`<g class="scatter-group"></g>`);

export default function Scatter_svg($$anchor, $$props) {
	$.push($$props, true);

	const $data = () => $.store_get(data, '$data', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $xScale = () => $.store_get(xScale, '$xScale', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const $yScale = () => $.store_get(yScale, '$yScale', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yGet, xScale, yScale } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {number} [r=5] - The circle's radius.
	 * @property {string} [fill='#0cf'] - The circle's fill color.
	 * @property {string} [stroke='#000'] - The circle's stroke color.
	 * @property {number} [strokeWidth=0] - The circle's stroke width.
	 */
	/** @type {Props} */
	let r = $.prop($$props, 'r', 3, 5),
		fill = $.prop($$props, 'fill', 3, '#0cf'),
		stroke = $.prop($$props, 'stroke', 3, '#000'),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 0);

	var g = root_1();

	$.each(g, 5, $data, $.index, ($$anchor, d) => {
		var circle = root();

		$.template_effect(
			($0, $1) => {
				$.set_attribute(circle, 'cx', $0);
				$.set_attribute(circle, 'cy', $1);
				$.set_attribute(circle, 'r', r());
				$.set_attribute(circle, 'fill', fill());
				$.set_attribute(circle, 'stroke', stroke());
				$.set_attribute(circle, 'stroke-width', strokeWidth());
			},
			[
				() => $xGet()($.get(d)) + ($xScale().bandwidth ? $xScale().bandwidth() / 2 : 0),
				() => $yGet()($.get(d)) + ($yScale().bandwidth ? $yScale().bandwidth() / 2 : 0)
			]
		);

		$.append($$anchor, circle);
	});

	$.reset(g);
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}