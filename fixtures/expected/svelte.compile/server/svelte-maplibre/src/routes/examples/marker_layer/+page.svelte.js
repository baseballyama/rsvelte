import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import GeoJSON from '$lib/GeoJSON.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import states from '$site/states.json?url';
import MarkerLayer from '$lib/MarkerLayer.svelte';
import Popup from '$lib/Popup.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		MapLibre($$renderer, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			class: mapClasses,
			standardControls: true,
			center: [-98.137, 40.137],
			zoom: 4,
			children: ($$renderer) => {
				GeoJSON($$renderer, {
					id: 'states',
					data: states,
					promoteId: 'STATEFP',
					children: ($$renderer) => {
						{
							function children($$renderer, { feature }) {
								$$renderer.push(`<div class="rounded-full bg-gray-200 p-2 shadow"><div class="text-sm font-bold">${$.escape(feature.properties?.NAME)}</div></div> `);

								Popup($$renderer, {
									openOn: 'hover',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(feature.properties?.NAME)} has FIPS code ${$.escape(feature.properties?.STATEFP)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							}

							MarkerLayer($$renderer, { interactive: true, children, $$slots: { default: true } });
						}
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