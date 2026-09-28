import * as $ from 'svelte/internal/server';
import { LayerCake, Canvas } from 'layercake';
import { feature } from 'topojson-client';
import { geoAlbersUsa, geoCentroid } from 'd3-geo';
import MapPointsCanvas from '../../_components/MapPoints.canvas.svelte';
import usStates from '../../_data/us-states.topojson.json';

export default function MapPoints_canvas($$renderer, $$props) {
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

		$$renderer.push(`<div class="chart-container svelte-mcbioj">`);

		LayerCake($$renderer, {
			padding: { top: 10 },
			data: geojson,
			children: ($$renderer) => {
				Canvas($$renderer, {
					children: ($$renderer) => {
						MapPointsCanvas($$renderer, { projection, features });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}