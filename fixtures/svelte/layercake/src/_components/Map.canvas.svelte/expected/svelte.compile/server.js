import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { scaleCanvas } from 'layercake';
import { geoPath } from 'd3-geo';

export default function Map_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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
		let { projection, stroke = '#ccc', strokeWidth = 1, fill, features } = $$props;

		let projectionFn = $.derived(() => projection().fitSize(
			[
				$.store_get($$store_subs ??= {}, '$width', width),
				$.store_get($$store_subs ??= {}, '$height', height)
			],
			$.store_get($$store_subs ??= {}, '$data', data)
		));

		let geoPathFn = $.derived(() => geoPath(projectionFn()));
		let featuresToDraw = $.derived(() => features || $.store_get($$store_subs ??= {}, '$data', data).features);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
		// Assign to a local variable: setting properties on `$ctx` directly
		// would re-notify the store and re-trigger this effect
		/** @param {any} feature */
		// Set the context here since setting it in `geoPath` is a circular reference
	});
}