import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { geoPath } from 'd3-geo';
import { raise } from 'layercake';

export default function Map_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, width, height, zGet } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {Function} projection - A D3 projection function. Pass this in as an uncalled function, e.g. `projection={geoAlbersUsa}`.
		 * @property {number|undefined} [fixedAspectRatio] - By default, the map fills to fit the $width and $height. If instead you want a fixed-aspect ratio, like for a server-side rendered map, set that here.
		 * @property {string|undefined} [fill] - The shape's fill color. By default, the fill will be determined by the z-scale, unless this prop is set.
		 * @property {string} [stroke='#333'] - The shape's stroke color.
		 * @property {number} [strokeWidth=0.5] - The shape's stroke width.
		 * @property {Array<Object>|undefined} [features] - A list of GeoJSON features. Use this if you want to draw a subset of the features in `$data` while keeping the zoom on the whole GeoJSON feature set. By default, it plots everything in `$data.features` if left unset.
		 * @property {(e: MouseEvent, props: Object) => void} [onmousemove] - A function that gets called on mousemove events. The first argument is the event, and the second is the properties of the hovered feature.
		 * @property {(e: MouseEvent) => void} [onmouseout] - A function that gets called on mouseout events.
		 */
		/** @type {Props} */
		let {
			projection,
			fixedAspectRatio,
			fill,
			stroke = '#333',
			strokeWidth = 0.5,
			features,
			onmousemove = () => {},
			onmouseout = () => {}
		} = $$props;

		/* --------------------------------------------
		 * Here's how you would do cross-component hovers
		 */
		let fitSizeRange = $.derived(() => fixedAspectRatio
			? [100, 100 / fixedAspectRatio]
			: [
				$.store_get($$store_subs ??= {}, '$width', width),
				$.store_get($$store_subs ??= {}, '$height', height)
			]);

		let projectionFn = $.derived(() => projection().fitSize(fitSizeRange(), $.store_get($$store_subs ??= {}, '$data', data)));
		let geoPathFn = $.derived(() => geoPath(projectionFn()));

		function handleMousemove(feature) {
			return function handleMousemoveFn(e) {
				// @ts-ignore
				raise(this);

				// When the element gets raised, it flashes 0,0 for a second so skip that
				if (e.layerX !== 0 && e.layerY !== 0) {
					onmousemove(e, feature.properties);
				}
			};
		}

		$$renderer.push(`<g class="map-group" role="tooltip"><!--[-->`);

		const each_array = $.ensure_array_like(features || $.store_get($$store_subs ??= {}, '$data', data).features);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let feature = each_array[$$index];

			$$renderer.push(`<path class="feature-path svelte-ibsccr"${$.attr('fill', fill || $.store_get($$store_subs ??= {}, '$zGet', zGet)(feature.properties))}${$.attr('stroke', stroke)}${$.attr('stroke-width', strokeWidth)}${$.attr('d', geoPathFn()(feature))} role="tooltip"></path>`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}