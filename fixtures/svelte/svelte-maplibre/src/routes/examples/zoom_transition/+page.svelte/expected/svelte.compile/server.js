import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import GeoJSON from '$lib/GeoJSON.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import states from '$site/states.json';
import counties from '$site/counties.json';
import { isTextLayer } from '$lib/filters.js';
import FillLayer from '$lib/FillLayer.svelte';
import SymbolLayer from '$lib/SymbolLayer.svelte';
import LineLayer from '$lib/LineLayer.svelte';
import { geoCentroid } from 'd3-geo';
import ZoomRange from '$lib/ZoomRange.svelte';
import { zoomTransition } from '$lib/expressions.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		function calculateCenters(g) {
			let centers = g.features.map((f) => {
				return {
					...f,
					geometry: { type: 'Point', coordinates: geoCentroid(f) }
				};
			});

			return { type: 'FeatureCollection', features: centers };
		}

		const stateCenters = calculateCenters(states);
		const countyCenters = calculateCenters(counties);
		let zoomThreshold = 5;
		let currentZoom = 4;

		$$renderer.push(`<p>This example uses the ZoomRange component and zoomTransition function to fade smoothly between
  states and counties as the map zooms.</p> <div class="w-full self-start"><label class="flex w-full flex-wrap gap-x-2"><span>Transition at zoom level: ${$.escape(zoomThreshold)}</span> <input class="w-32" type="range"${$.attr('value', zoomThreshold)}${$.attr('min', 0)}${$.attr('max', 10)}${$.attr('step', 0.1)}/></label> <p>Current Zoom: ${$.escape(currentZoom.toFixed(1))}</p></div> `);

		MapLibre($$renderer, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			class: mapClasses,
			standardControls: true,
			center: [-98.137, 40.137],
			zoom: 4,
			onzoomend: ({ target: map }) => currentZoom = map.getZoom(),
			filterLayers: (l) => !isTextLayer(l, 'carto'),
			children: ($$renderer) => {
				ZoomRange($$renderer, {
					maxzoom: zoomThreshold + 0.5,
					children: ($$renderer) => {
						const fadeStates = zoomTransition(zoomThreshold - 1, 0.8, zoomThreshold + 0.5, 0);
						const fadeStatesText = zoomTransition(zoomThreshold - 1, 1, zoomThreshold, 0.2);

						GeoJSON($$renderer, {
							id: 'states',
							data: states,
							promoteId: 'GEOID',
							children: ($$renderer) => {
								FillLayer($$renderer, { paint: { 'fill-color': 'green', 'fill-opacity': fadeStates } });
								$$renderer.push(`<!----> `);

								LineLayer($$renderer, {
									paint: {
										'line-color': 'white',
										'line-width': 1,
										'line-opacity': fadeStates
									}
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						GeoJSON($$renderer, {
							id: 'state-centers',
							data: stateCenters,
							promoteId: 'GEOID',
							children: ($$renderer) => {
								SymbolLayer($$renderer, {
									filter: ['!=', ['get', 'STUSPS'], 'DC'],
									paint: {
										'text-color': '#333',
										'text-opacity': fadeStatesText,
										'text-halo-color': '#eee',
										'text-halo-width': 0.5,
										'text-halo-blur': 0.5
									},
									layout: {
										'text-allow-overlap': true,
										'text-field': ['get', 'STUSPS'],
										'text-size': zoomTransition(3, 16, 5, 24)
									}
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ZoomRange($$renderer, {
					minzoom: zoomThreshold - 0.5,
					children: ($$renderer) => {
						const fadeCounties = zoomTransition(zoomThreshold - 0.5, 0, zoomThreshold + 0.5, 0.8);
						const fadeCountiesText = zoomTransition(zoomThreshold, 0.2, zoomThreshold + 0.5, 1);

						GeoJSON($$renderer, {
							id: 'counties',
							data: counties,
							promoteId: 'GEOID',
							children: ($$renderer) => {
								FillLayer($$renderer, {
									paint: { 'fill-color': 'orange', 'fill-opacity': fadeCounties }
								});

								$$renderer.push(`<!----> `);

								LineLayer($$renderer, {
									paint: {
										'line-color': 'white',
										'line-width': 1,
										'line-opacity': fadeCounties
									}
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						GeoJSON($$renderer, {
							id: 'county-centers',
							data: countyCenters,
							promoteId: 'GEOID',
							children: ($$renderer) => {
								SymbolLayer($$renderer, {
									paint: { 'text-color': 'black', 'text-opacity': fadeCountiesText },
									layout: {
										'text-field': ['get', 'NAME'],
										'text-size': zoomTransition(5, 12, 10, 24)
									}
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		CodeSample($$renderer, { code });
		$$renderer.push(`<!---->`);
	});
}