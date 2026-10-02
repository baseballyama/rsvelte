import * as $ from 'svelte/internal/server';
import { LayerCake, Canvas } from 'layercake';
import { feature } from 'topojson-client';
import { geoAlbersUsa } from 'd3-geo';
import MapCanvas from '../../_components/Map.canvas.svelte';
import usStates from '../../_data/us-states.topojson.json';

export default function Map_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// For a map example with a tooltip, check out https://layercake.graphics/example/MapSvg
		// This example loads json data as json using @rollup/plugin-json
		const geojson = feature(usStates, usStates.objects.collection);

		const projection = geoAlbersUsa;

		$$renderer.push(`<div class="chart-container svelte-fglxwc">`);

		LayerCake($$renderer, {
			padding: { top: 10 },
			data: geojson,
			children: ($$renderer) => {
				Canvas($$renderer, {
					children: ($$renderer) => {
						MapCanvas($$renderer, { projection, fill: '#fff' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}