import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function MapPoints_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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

		$$renderer.push(`<div class="points"><!--[-->`);

		const each_array = $.ensure_array_like(features || $.store_get($$store_subs ??= {}, '$data', data).features);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let d = each_array[$$index];

			$$renderer.push(`<div class="point svelte-1jz54sx"${$.attr_style(` top: ${$.stringify(projectionFn()(d.geometry.coordinates)[1])}px; left: ${$.stringify(projectionFn()(d.geometry.coordinates)[0])}px; width: ${$.stringify(r * 2)}px; height: ${$.stringify(r * 2)}px; border-width: ${$.stringify(strokeWidth)}px; border-color: ${$.stringify(stroke)}; background-color: ${$.stringify(fill)}; opacity: ${$.stringify(opacity)}; `)}></div>`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}