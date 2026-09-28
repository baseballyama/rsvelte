import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { line, curveCardinalClosed } from 'd3-shape';

var root = $.from_svg(`<circle></circle>`);
var root_1 = $.from_svg(`<path class="path-line svelte-1tzo1w5"></path><!>`, 1);
var root_2 = $.from_svg(`<g></g>`);

export default function Radar($$anchor, $$props) {
	$.push($$props, true);

	const $config = () => $.store_get(config, '$config', $$stores);
	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, width, height, xGet, config } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {string} [fill='#f0c'] - The radar's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
	 * @property {string} [stroke='#f0c'] - The radar's stroke color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
	 * @property {number} [strokeWidth=2] - The radar's stroke width.
	 * @property {number} [fillOpacity=0.5] - The radar's fill opacity.
	 * @property {number} [r=4.5] - Each circle's radius.
	 * @property {string} [circleFill='#f0c'] - Each circle's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
	 * @property {string} [circleStroke='#fff'] - Each circle's stroke color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color.
	 * @property {number} [circleStrokeWidth=1] - Each circle's stroke width.
	 */
	/** @type {Props} */
	let fill = $.prop($$props, 'fill', 3, '#f0c'),
		stroke = $.prop($$props, 'stroke', 3, '#f0c'),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 2),
		fillOpacity = $.prop($$props, 'fillOpacity', 3, 0.5),
		r = $.prop($$props, 'r', 3, 4.5),
		circleFill = $.prop($$props, 'circleFill', 3, '#f0c'),
		circleStroke = $.prop($$props, 'circleStroke', 3, '#fff'),
		circleStrokeWidth = $.prop($$props, 'circleStrokeWidth', 3, 1);

	let angleSlice = $.derived(() => Math.PI * 2 / $config().x.length);

	let path = $.derived(() => line().curve(curveCardinalClosed).// @ts-expect-error
	x((d, i) => d * Math.cos($.get(angleSlice) * i - Math.PI / 2)).// @ts-expect-error
	y((d, i) => d * Math.sin($.get(angleSlice) * i - Math.PI / 2)));

	var /* The non-D3 line generator way. */
	// let path = $derived(
	// 	values =>
	// 		'M' +
	// 		values
	// 			.map(d => {
	// 				return $rGet(d).map((val, i) => {
	// 					return [
	// 						val * Math.cos(angleSlice * i - Math.PI / 2),
	// 						val * Math.sin(angleSlice * i - Math.PI / 2)
	// 					].join(',');
	// 				});
	// 			})
	// 			.join('L') +
	// 		'z'
	// );
	g = root_2();

	$.each(g, 5, $data, $.index, ($$anchor, row) => {
		const xVals = $.derived(() => $xGet()($.get(row)));
		var fragment = root_1();
		var path_1 = $.first_child(fragment);
		var node = $.sibling(path_1);

		$.each(node, 17, () => $.get(xVals), $.index, ($$anchor, circleR, i) => {
			const thisAngleSlice = $.derived(() => $.get(angleSlice) * i - Math.PI / 2);
			var circle = root();

			$.template_effect(
				($0, $1) => {
					$.set_attribute(circle, 'cx', $0);
					$.set_attribute(circle, 'cy', $1);
					$.set_attribute(circle, 'r', r());
					$.set_attribute(circle, 'fill', circleFill());
					$.set_attribute(circle, 'stroke', circleStroke());
					$.set_attribute(circle, 'stroke-width', circleStrokeWidth());
				},
				[
					() => $.get(circleR) * Math.cos($.get(thisAngleSlice)),
					() => $.get(circleR) * Math.sin($.get(thisAngleSlice))
				]
			);

			$.append($$anchor, circle);
		});

		$.template_effect(
			($0) => {
				$.set_attribute(path_1, 'd', $0);
				$.set_attribute(path_1, 'stroke', stroke());
				$.set_attribute(path_1, 'stroke-width', strokeWidth());
				$.set_attribute(path_1, 'fill', fill());
				$.set_attribute(path_1, 'fill-opacity', fillOpacity());
			},
			[() => $.get(path)($.get(xVals))]
		);

		$.append($$anchor, fragment);
	});

	$.reset(g);
	$.template_effect(() => $.set_attribute(g, 'transform', `translate(${$width() / 2}, ${$height() / 2})`));
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}