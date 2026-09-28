import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import { feature } from 'topojson-client';
import { geoAlbersUsa, geoCentroid } from 'd3-geo';
import MapPoints from '../../_components/MapPoints.svelte';
import usStates from '../../_data/us-states.topojson.json';

export default function MapPoints_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads json data as json using @rollup/plugin-json
		const geojson = feature(usStates, usStates.objects.collection);

		const projection = geoAlbersUsa;

		const features = geojson.features.map((d) => {
			return {
				properties: d.properties,
				geometry: { coordinates: geoCentroid(d) }
			};
		});

		$$renderer.push(`<div class="chart-container svelte-1ipylb9">`);

		LayerCake($$renderer, {
			padding: { top: 10 },
			data: geojson,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						MapPoints($$renderer, { projection, features });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}