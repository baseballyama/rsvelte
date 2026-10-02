import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import DefaultMarker from '$lib/DefaultMarker.svelte';
import { mapClasses } from '../styles';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import Popup from '$lib/Popup.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		const markers = [
			{ lngLat: [-122.2993, 47.4464], label: 'SEA', name: 'Seattle' },
			{ lngLat: [-159.3438, 21.9788], label: 'LIH', name: 'Lihue' },
			{
				lngLat: [2.5479, 49.0097],
				label: 'CDG',
				name: 'Paris Charles de Gaulle'
			},

			{
				lngLat: [-58.5348, -34.82],
				label: 'EZE',
				name: 'Ministro Pistarini'
			},
			{ lngLat: [18.6021, -33.9715], label: 'CPT', name: 'Cape Town' },
			{
				lngLat: [121.0165, 14.5123],
				label: 'MNL',
				name: 'Ninoy Aquino'
			}
		];

		MapLibre($$renderer, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			class: mapClasses,
			standardControls: true,
			zoom: 1,
			center: [-20, 0],
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(markers);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let { lngLat, name } = each_array[$$index];

					DefaultMarker($$renderer, {
						lngLat,
						draggable: true,
						children: ($$renderer) => {
							Popup($$renderer, {
								offset: [0, -10],
								children: ($$renderer) => {
									$$renderer.push(`<div class="text-lg font-bold">${$.escape(name)}</div>`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		CodeSample($$renderer, { code });
		$$renderer.push(`<!---->`);
	});
}