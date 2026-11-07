import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import GeoJSON from '$lib/GeoJSON.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import HeatmapLayer from '$lib/HeatmapLayer.svelte';
import CircleLayer from '$lib/CircleLayer.svelte';
import earthquakes from '$site/earthquakes.geojson?url';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);
		$$renderer.push(`<p>This is a map of earthquake frequency. Visualization styles and data from <a href="https://maplibre.org/maplibre-gl-js-docs/example/heatmap-layer/">the original MapLibre example.</a></p> `);

		MapLibre($$renderer, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			class: mapClasses,
			standardControls: true,
			center: [-120, 50],
			zoom: 2,
			children: ($$renderer) => {
				GeoJSON($$renderer, {
					id: 'earthquakes',
					data: earthquakes,
					children: ($$renderer) => {
						HeatmapLayer($$renderer, {
							maxzoom: 9,
							paint: {
								'heatmap-weight': ['interpolate', ['linear'], ['get', 'mag'], 0, 0, 6, 1],
								'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
								'heatmap-color': [
									'interpolate',
									['linear'],
									['heatmap-density'],
									0,
									'rgba(33,102,172,0)',
									0.2,
									'rgb(103,169,207)',
									0.4,
									'rgb(209,229,240)',
									0.6,
									'rgb(253,219,199)',
									0.8,
									'rgb(239,138,98)',
									1,
									'rgb(178,24,43)'
								],
								'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
								'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0]
							}
						});

						$$renderer.push(`<!----> `);

						CircleLayer($$renderer, {
							id: 'earthquakes-circle',
							source: 'earthquakes',
							minzoom: 7,
							paint: {
								'circle-radius': [
									'interpolate',
									['linear'],
									['zoom'],
									7,
									['interpolate', ['linear'], ['get', 'mag'], 1, 1, 6, 4],
									16,
									['interpolate', ['linear'], ['get', 'mag'], 1, 5, 6, 50]
								],
								'circle-color': [
									'interpolate',
									['linear'],
									['get', 'mag'],
									1,
									'rgba(33,102,172,0)',
									2,
									'rgb(103,169,207)',
									3,
									'rgb(209,229,240)',
									4,
									'rgb(253,219,199)',
									5,
									'rgb(239,138,98)',
									6,
									'rgb(178,24,43)'
								],
								'circle-stroke-color': 'white',
								'circle-stroke-width': 1,
								'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 8, 1]
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		CodeSample($$renderer, { code });
		$$renderer.push(`<!---->`);
	});
}