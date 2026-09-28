import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { line, curveLinear } from 'd3-shape';

var root = $.from_svg(`<path class="path-line svelte-1f4mpbw"></path>`);
var root_1 = $.from_svg(`<g class="line-group"></g>`);

export default function MultiLine($$anchor, $$props) {
	$.push($$props, true);

	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $yGet = () => $.store_get(yGet, '$yGet', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $zGet = () => $.store_get(zGet, '$zGet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, yGet, zGet } = getContext('LayerCake');

	/** @typedef {import('d3-shape').CurveFactory} CurveFactory */
	/**
	 * @typedef {Object} Props
	 * @property {CurveFactory} [curve] - An optional D3 interpolation function. See [d3-shape](https://github.com/d3/d3-shape#curves) for options. Pass this function in uncalled, i.e. without the open-close parentheses.
	 */
	/** @type {Props} */
	let curve = $.prop($$props, 'curve', 3, curveLinear);

	let path = $.derived(() => line().x($xGet()).y($yGet()).curve(curve()));

	var // .defined($y)
	g = root_1();

	$.each(g, 5, $data, $.index, ($$anchor, group) => {
		var path_1 = root();

		$.template_effect(
			($0, $1) => {
				$.set_attribute(path_1, 'd', $0);
				$.set_attribute(path_1, 'stroke', $1);
			},
			[
				() => $.get(path)($.get(group).values),
				() => $zGet()($.get(group))
			]
		);

		$.append($$anchor, path_1);
	});

	$.reset(g);
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}