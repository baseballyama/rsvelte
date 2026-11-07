import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import Marker from '$lib/Marker.svelte';
import { mapClasses } from '../styles';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import Popup from '$lib/Popup.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		let clickedName = '';

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

		let open = markers.map(() => false);
		let buttonAction = $.derived(() => open.some((v) => v === false) ? 'open' : 'close');

		function toggleAll() {
			if (buttonAction() === 'open') {
				open = open.map(() => true);
			} else {
				open = open.map(() => false);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<p>`);

			if (clickedName) {
				$$renderer.push(`<!--[0-->You clicked ${$.escape(clickedName)}`);
			} else {
				$$renderer.push(`<!--[-1-->Click a marker to see the airport's name.`);
			}

			$$renderer.push(`<!--]--></p> <button type="button" class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors">${$.escape(buttonAction() === 'open' ? 'Open All' : 'Close All')} Popups</button> `);

			MapLibre($$renderer, {
				style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
				class: mapClasses,
				standardControls: true,
				zoom: 1,
				center: [-20, 0],
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(markers);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let { lngLat, label, name } = each_array[i];

						Marker($$renderer, {
							lngLat,
							onclick: () => clickedName = name,
							class: 'grid h-8 w-8 place-items-center rounded-full border border-gray-200 bg-red-300 text-black shadow-2xl focus:outline-2 focus:outline-black',
							children: ($$renderer) => {
								$$renderer.push(`<span>${$.escape(label)}</span> `);

								Popup($$renderer, {
									openOn: 'click',
									offset: [0, -10],
									get open() {
										return open[i];
									},

									set open($$value) {
										open[i] = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										$$renderer.push(`<div class="text-lg font-bold">${$.escape(name)}</div>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}