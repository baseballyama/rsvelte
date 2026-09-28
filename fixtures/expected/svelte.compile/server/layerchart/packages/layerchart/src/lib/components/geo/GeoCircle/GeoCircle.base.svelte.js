import * as $ from 'svelte/internal/server';
import { geoCircle } from 'd3-geo';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function GeoCircle_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			GeoPath,
			radius = 90,
			center = [0, 0],
			precision = 6,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const geojson = $.derived(() => geoCircle().radius(radius).center(center).precision(precision)());

		if (GeoPath) {
			$$renderer.push('<!--[-->');

			GeoPath($$renderer, $.spread_props([
				{ geojson: geojson() },
				extractLayerProps(restProps, 'lc-geo-circle')
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}