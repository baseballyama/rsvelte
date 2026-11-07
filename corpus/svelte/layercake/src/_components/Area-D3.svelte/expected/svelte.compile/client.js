import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { area, curveLinear } from 'd3-shape';

var root = $.from_svg(`<path class="path-area"></path>`);

export default function Area_D3($$anchor, $$props) {
	$.push($$props, true);

	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const $yScale = () => $.store_get(yScale, '$yScale', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yGet, yScale } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {string} [fill='#ab00d610'] - The shape's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
	 * @property {import('d3-shape').CurveFactory} [curve] - An optional D3 interpolation function. See [d3-shape](https://github.com/d3/d3-shape#curves) for options. Pass this function in uncalled, i.e. without the open-close parentheses.
	 */
	/** @type {Props} */
	let fill = $.prop($$props, 'fill', 3, '#ab00d610'),
		curve = $.prop($$props, 'curve', 3, curveLinear);

	let path = $.derived(() => area().x($xGet()).y1($yGet()).y0((d) => $yScale()(0)).curve(curve()));

	var // .defined($y)
	path_1 = root();

	$.template_effect(
		($0) => {
			$.set_attribute(path_1, 'd', $0);
			$.set_attribute(path_1, 'fill', fill());
		},
		[() => $.get(path)($data())]
	);

	$.append($$anchor, path_1);
	$.pop();
	$$cleanup();
}