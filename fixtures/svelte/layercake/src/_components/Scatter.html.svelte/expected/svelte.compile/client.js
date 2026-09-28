import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<div class="circle svelte-1h6qe0o"></div>`);
var root_1 = $.from_html(`<div class="scatter-group"></div>`);

export default function Scatter_html($$anchor, $$props) {
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
	 * @property {number} [strokeWidth=1] - The circle's stroke width.
	 */
	/** @type {Props} */
	let r = $.prop($$props, 'r', 3, 5),
		fill = $.prop($$props, 'fill', 3, '#0cf'),
		stroke = $.prop($$props, 'stroke', 3, '#000'),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 1);

	var div = root_1();

	$.each(div, 5, $data, $.index, ($$anchor, d) => {
		var div_1 = root();

		$.template_effect(
			($0, $1) => $.set_style(div_1, `
				left: ${$0 ?? ''}%;
				top: ${$1 ?? ''}%;
				width: ${r() * 2}px;
				height: ${r() * 2}px;
				background-color: ${fill() ?? ''};
				border: ${strokeWidth() ?? ''}px solid ${stroke() ?? ''};
			`),
			[
				() => $xGet()($.get(d)) + ($xScale().bandwidth ? $xScale().bandwidth() / 2 : 0),
				() => $yGet()($.get(d)) + ($yScale().bandwidth ? $yScale().bandwidth() / 2 : 0)
			]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}