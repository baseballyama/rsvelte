import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { line, curveLinear } from 'd3-shape';

var root = $.from_svg(`<path class="path-line svelte-a4z7ld"></path>`);

export default function Line_D3($$anchor, $$props) {
	$.push($$props, true);

	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yGet } = getContext('LayerCake');

	/** @typedef {import('d3-shape').CurveFactory} CurveFactory */
	/**
	 * @typedef {Object} Props
	 * @property {string} [stroke='#ab00d6'] - The shape's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
	 * @property {CurveFactory} [curve=curveLinear] - An optional D3 interpolation function. See [d3-shape](https://github.com/d3/d3-shape#curves) for options. Pass this function in uncalled, i.e. without the open-close parentheses.
	 */
	/** @type {Props} */
	let stroke = $.prop($$props, 'stroke', 3, '#ab00d6'),
		curve = $.prop($$props, 'curve', 3, curveLinear);

	let path = $.derived(() => line().x($xGet()).y($yGet()).curve(curve()));

	var // .defined($y)
	path_1 = root();

	$.template_effect(
		($0) => {
			$.set_attribute(path_1, 'd', $0);
			$.set_attribute(path_1, 'stroke', stroke());
		},
		[() => $.get(path)($data())]
	);

	$.append($$anchor, path_1);
	$.pop();
	$$cleanup();
}