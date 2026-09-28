import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<div class="point svelte-1jz54sx"></div>`);
var root_1 = $.from_html(`<div class="points"></div>`);

export default function MapPoints_html($$anchor, $$props) {
	$.push($$props, true);

	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, width, height } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {Function} projection - A D3 projection function. Pass this in as an uncalled function, e.g. `projection={geoAlbersUsa}`.
	 * @property {number} [r=3.5] - The point's radius.
	 * @property {string} [fill='yellow'] - The point's fill color.
	 * @property {string} [stroke='#000'] - The point's stroke color.
	 * @property {number} [strokeWidth=1] - The point's stroke width, in pixels.
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
	var div = root_1();

	$.each(div, 5, () => $$props.features || $data().features, $.index, ($$anchor, d) => {
		var div_1 = root();

		$.template_effect(
			($0, $1) => $.set_style(div_1, `
			top: ${$0 ?? ''}px;
			left: ${$1 ?? ''}px;
			width: ${r() * 2}px;
			height: ${r() * 2}px;
			border-width: ${strokeWidth() ?? ''}px;
			border-color: ${stroke() ?? ''};
			background-color: ${fill() ?? ''};
			opacity: ${opacity() ?? ''};
		`),
			[
				() => $.get(projectionFn)($.get(d).geometry.coordinates)[1],
				() => $.get(projectionFn)($.get(d).geometry.coordinates)[0]
			]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}