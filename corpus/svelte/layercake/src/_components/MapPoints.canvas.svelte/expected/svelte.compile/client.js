import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { scaleCanvas } from 'layercake';

export default function MapPoints_canvas($$anchor, $$props) {
	$.push($$props, true);

	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $ctx = () => $.store_get(ctx, '$ctx', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, width, height } = getContext('LayerCake');
	const { ctx } = getContext('canvas');

	/**
	 * @typedef {Object} Props
	 * @property {Function} projection - A D3 projection function. Pass this in as an uncalled function, e.g. `projection={geoAlbersUsa}`.
	 * @property {number} [r=3.5] - The point's radius.
	 * @property {string} [fill='yellow'] - The point's fill color.
	 * @property {string} [stroke='#000'] - The point's stroke color.
	 * @property {number} [strokeWidth=1] - The point's stroke width.
	 * @property {Array<Object>|undefined} [features] - A list of GeoJSON features to plot. If unset, the plotted features will default to those in `$data.features`, assuming this field is a list of GeoJSON features.
	 */
	/** @type {Props} */
	let r = $.prop($$props, 'r', 3, 3.5),
		fill = $.prop($$props, 'fill', 3, 'yellow'),
		stroke = $.prop($$props, 'stroke', 3, '#000'),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 1);

	let projectionFn = $.derived(() => $$props.projection().fitSize([$width(), $height()], $data()));
	let featuresToDraw = $.derived(() => $$props.features || $data().features);

	$.user_effect(() => {
		if (!$width() || !$height() || !$ctx()) return;

		// Assign to a local variable: setting properties on `$ctx` directly
		// would re-notify the store and re-trigger this effect
		const context = $ctx();

		scaleCanvas(context, $width(), $height());
		context.clearRect(0, 0, $width(), $height());

		// To scale the circle by size, set width and height to `$rGet(d.properties)`
		$.get(featuresToDraw).forEach(/** @param {any} d */ (d) => {
			context.beginPath();

			const coordinates = $.get(projectionFn)(d.geometry.coordinates);

			context.arc(coordinates[0], coordinates[1], r(), 0, 2 * Math.PI, false);
			context.fillStyle = fill();
			context.fill();
			context.lineWidth = strokeWidth();
			context.strokeStyle = stroke();
			context.stroke();
		});
	});

	$.pop();
	$$cleanup();
}