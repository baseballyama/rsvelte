import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p>This is a map of earthquake frequency. Visualization styles and data from <a href="https://maplibre.org/maplibre-gl-js-docs/example/heatmap-layer/">the original MapLibre example.</a></p> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		get class() {
			return mapClasses;
		},
		standardControls: true,
		center: [-120, 50],
		zoom: 2,
		children: ($$anchor, $$slotProps) => {
			GeoJSON($$anchor, {
				id: 'earthquakes',
				get data() {
					return earthquakes;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					HeatmapLayer(node_1, {
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

					var node_2 = $.sibling(node_1, 2);

					CircleLayer(node_2, {
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

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	CodeSample(node_3, {
		get code() {
			return code;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}