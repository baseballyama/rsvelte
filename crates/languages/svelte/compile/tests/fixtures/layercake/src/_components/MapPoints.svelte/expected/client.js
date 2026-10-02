import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<circle></circle>`);
var root_1 = $.from_svg(`<g class="points"></g>`);

export default function MapPoints($$anchor, $$props) {
	$.push($$props, true);

	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, width, height } = getContext('LayerCake');

	/* --------------------------------------------
	 * Require a D3 projection function
	 */
	/**
	 * @typedef {Object} Props
	 * @property {Function} projection - A D3 projection function. Pass this in as an uncalled function, e.g. `projection={geoAlbersUsa}`.
	 * @property {number} [r=3.5] - The point's radius.
	 * @property {string} [fill='yellow'] - The point's fill color.
	 * @property {string} [stroke='#000'] - The point's stroke color.
	 * @property {number} [strokeWidth=1] - The point's stroke width.
	 * @property {number} [opacity=1] - The point's opacity.
	 * @property {Array<Object>|undefined} [features] - A list of GeoJSON features to plot. If unset, the plotted features will default to those in `$data.features`, assuming this field is a list of GeoJSON features.
	 */
	/** @type {Props} */
	let r = $.prop($$props, 'r', 3, 3.5),
		fill = $.prop($$props, 'fill', 3, 'yellow'),
		stroke = $.prop($$props, 'stroke', 3, '#000'),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 1),
		opacity = $.prop($$props, 'opacity', 3, 1);

	let projectionFn = $.derived(() => $$props.projection().fitSize([$width(), $height()], $data()));
	var g = root_1();

	$.each(g, 5, () => $$props.features || $data().features, $.index, ($$anchor, d) => {
		var circle = root();

		$.template_effect(
			($0, $1) => {
				$.set_attribute(circle, 'cx', $0);
				$.set_attribute(circle, 'cy', $1);
				$.set_attribute(circle, 'r', r());
				$.set_attribute(circle, 'fill', fill());
				$.set_attribute(circle, 'stroke', stroke());
				$.set_attribute(circle, 'stroke-width', strokeWidth());
				$.set_attribute(circle, 'opacity', opacity());
			},
			[
				() => $.get(projectionFn)($.get(d).geometry.coordinates)[0],
				() => $.get(projectionFn)($.get(d).geometry.coordinates)[1]
			]
		);

		$.append($$anchor, circle);
	});

	$.reset(g);
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}