import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import GeoJSON from '$lib/GeoJSON.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import cbsa from '$site/cbsa.json';
import FillExtrusionLayer from '$lib/FillExtrusionLayer.svelte';
import Popup from '$lib/Popup.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		$$renderer.push(`<p>Map of US Metropolitan Areas. Height indicates total population and color indicates population
  density.</p> `);

		MapLibre($$renderer, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			class: mapClasses,
			standardControls: true,
			pitch: 30,
			center: [-98.137, 40.137],
			zoom: 4,
			children: ($$renderer) => {
				GeoJSON($$renderer, {
					id: 'cbsa',
					data: cbsa,
					promoteId: 'CBSAFP',
					children: ($$renderer) => {
						FillExtrusionLayer($$renderer, {
							paint: {
								'fill-extrusion-base': 0,
								'fill-extrusion-color': [
									'interpolate',
									['linear'],
									[
										'/',
										['get', 'POPESTIMATE2020'],
										['/', ['get', 'ALAND'], 1000000]
									],
									0,
									'#0a0',
									200,
									'#a00'
								],
								'fill-extrusion-opacity': 0.6,
								'fill-extrusion-height': ['/', ['get', 'POPESTIMATE2020'], 20]
							},
							beforeLayerType: 'symbol',
							children: ($$renderer) => {
								{
									function children($$renderer, { data }) {
										const props = data?.properties;

										if (props) {
											$$renderer.push(`<!--[0--><div class="flex flex-col gap-2"><div class="text-lg font-bold">${$.escape(props.NAME)}</div> <p>Population: ${$.escape(props.POPESTIMATE2020)}</p></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									}

									Popup($$renderer, { openOn: 'hover', children, $$slots: { default: true } });
								}
							},
							$$slots: { default: true }
						});
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