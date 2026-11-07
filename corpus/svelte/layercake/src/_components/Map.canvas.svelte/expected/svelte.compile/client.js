import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { scaleCanvas } from 'layercake';
import { geoPath } from 'd3-geo';

export default function Map_canvas($$anchor, $$props) {
	$.push($$props, true);

	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $ctx = () => $.store_get(ctx, '$ctx', $$stores);
	const $zGet = () => $.store_get(zGet, '$zGet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, width, height, zGet } = getContext('LayerCake');
	const { ctx } = getContext('canvas');

	/**
	 * @typedef {Object} Props
	 * @property {Function} projection - A D3 projection function. Pass this in as an uncalled function, e.g. `projection={geoAlbersUsa}`.
	 * @property {string} [stroke='#ccc'] - The shape's stroke color.
	 * @property {number} [strokeWidth=1] - The shape's stroke width.
	 * @property {string|undefined} [fill] - The shape's fill color. By default, the fill will be determined by the z-scale, unless this prop is set.
	 * @property {Array<GeoJSON>|undefined} [features] - A list of GeoJSON features. Use this if you want to draw a subset of the features in `$data` while keeping the zoom on the whole GeoJSON feature set. By default, it plots everything in `$data.features` if left unset.
	 */
	/** @type {Props} */
	let stroke = $.prop($$props, 'stroke', 3, '#ccc'),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 1);

	let projectionFn = $.derived(() => $$props.projection().fitSize([$width(), $height()], $data()));
	let geoPathFn = $.derived(() => geoPath($.get(projectionFn)));
	let featuresToDraw = $.derived(() => $$props.features || $data().features);

	$.user_effect(() => {
		if (!$width() || !$height() || !$ctx()) return;

		// Assign to a local variable: setting properties on `$ctx` directly
		// would re-notify the store and re-trigger this effect
		const context = $ctx();

		const zGetFn = $zGet();

		scaleCanvas(context, $width(), $height());
		context.clearRect(0, 0, $width(), $height());

		$.get(featuresToDraw).forEach(/** @param {any} feature */ (feature) => {
			context.beginPath();

			// Set the context here since setting it in `geoPath` is a circular reference
			$.get(geoPathFn).context(context);

			$.get(geoPathFn)(feature);
			context.fillStyle = $$props.fill || zGetFn(feature.properties);
			context.fill();
			context.lineWidth = strokeWidth();
			context.strokeStyle = stroke();
			context.stroke();
		});
	});

	$.pop();
	$$cleanup();
}