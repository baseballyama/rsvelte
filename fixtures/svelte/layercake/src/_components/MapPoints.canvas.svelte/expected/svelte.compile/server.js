import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { scaleCanvas } from 'layercake';

export default function MapPoints_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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
		let {
			projection,
			r = 3.5,
			fill = 'yellow',
			stroke = '#000',
			strokeWidth = 1,
			features
		} = $$props;

		let projectionFn = $.derived(() => projection().fitSize(
			[
				$.store_get($$store_subs ??= {}, '$width', width),
				$.store_get($$store_subs ??= {}, '$height', height)
			],
			$.store_get($$store_subs ??= {}, '$data', data)
		));

		let featuresToDraw = $.derived(() => features || $.store_get($$store_subs ??= {}, '$data', data).features);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
		// Assign to a local variable: setting properties on `$ctx` directly
		// would re-notify the store and re-trigger this effect
		// To scale the circle by size, set width and height to `$rGet(d.properties)`
		/** @param {any} d */
	});
}