import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function MapPoints($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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
		let {
			projection,
			r = 3.5,
			fill = 'yellow',
			stroke = '#000',
			strokeWidth = 1,
			opacity = 1,
			features
		} = $$props;

		let projectionFn = $.derived(() => projection().fitSize(
			[
				$.store_get($$store_subs ??= {}, '$width', width),
				$.store_get($$store_subs ??= {}, '$height', height)
			],
			$.store_get($$store_subs ??= {}, '$data', data)
		));

		$$renderer.push(`<g class="points"><!--[-->`);

		const each_array = $.ensure_array_like(features || $.store_get($$store_subs ??= {}, '$data', data).features);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let d = each_array[$$index];

			$$renderer.push(`<circle${$.attr('cx', projectionFn()(d.geometry.coordinates)[0])}${$.attr('cy', projectionFn()(d.geometry.coordinates)[1])}${$.attr('r', r)}${$.attr('fill', fill)}${$.attr('stroke', stroke)}${$.attr('stroke-width', strokeWidth)}${$.attr('opacity', opacity)}></circle>`);
		}

		$$renderer.push(`<!--]--></g>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}