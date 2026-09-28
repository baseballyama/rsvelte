import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function MapLabels_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, width, height } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {Function} projection - A D3 projection function. Pass this in as an uncalled function, e.g. `projection={geoAlbersUsa}`.
		 * @property {Function} getLabel - An accessor function to get the field to display.
		 * @property {number|undefined} [fixedAspectRatio] - By default, the map fills to fit the $width and $height. If instead you want a fixed-aspect ratio, like for a server-side rendered map, set that here.
		 * @property {Function} getCoordinates - An accessor function to get the `[x, y]` coordinate field. Defaults to a GeoJSON feature format.
		 * @property {Array<Object>|undefined} [features] - A list of labels as GeoJSON features. If unset, the plotted features will default to those in `$data.features`, assuming this field is a list of GeoJSON features.
		 */
		/** @type {Props} */
		let {
			projection,
			getLabel,
			fixedAspectRatio,
			getCoordinates,
			features
		} = $$props;

		let fitSizeRange = $.derived(() => fixedAspectRatio
			? [100, 100 / fixedAspectRatio]
			: [
				$.store_get($$store_subs ??= {}, '$width', width),
				$.store_get($$store_subs ??= {}, '$height', height)
			]);

		let projectionFn = $.derived(() => projection().fitSize(fitSizeRange(), $.store_get($$store_subs ??= {}, '$data', data)));

		$$renderer.push(`<g class="map-labels svelte-12osx8a"><!--[-->`);

		const each_array = $.ensure_array_like(features || $.store_get($$store_subs ??= {}, '$data', data).features);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let d = each_array[$$index];
			const coords = projectionFn()(getCoordinates(d));

			$$renderer.push(`<text class="map-label svelte-12osx8a"${$.attr('x', coords[0])}${$.attr('y', coords[1])}>${$.escape(getLabel(d))}</text>`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}