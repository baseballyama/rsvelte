import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import Marker from '$lib/Marker.svelte';
import { mapClasses } from '../styles';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		let markerPos = [-122.2993, 47.4464];
		const handleDrag = (event) => markerPos = event.lngLat;
		let boundPos = { lng: -10, lat: -20 };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<ul><li>Position from drag events: ${$.escape(JSON.stringify(markerPos))}</li> <li>Position from <code>bind:latLng</code>: ${$.escape(JSON.stringify(boundPos))}</li></ul> `);

			MapLibre($$renderer, {
				style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
				class: mapClasses,
				standardControls: true,
				zoom: 1,
				center: [-20, 0],
				children: ($$renderer) => {
					Marker($$renderer, {
						lngLat: [-122.2993, 47.4464],
						draggable: true,
						ondrag: handleDrag,
						class: 'grid h-8 w-20 place-items-center rounded-full border border-gray-200 bg-red-300 text-black shadow-2xl focus:outline-2 focus:outline-black',
						children: ($$renderer) => {
							$$renderer.push(`<span>Drag me !</span>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Marker($$renderer, {
						draggable: true,
						class: 'grid h-8 w-24 place-items-center rounded-full border border-gray-200 bg-red-300 text-black shadow-2xl focus:outline-2 focus:outline-black',
						get lngLat() {
							return boundPos;
						},

						set lngLat($$value) {
							boundPos = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<span>2-way Bound !</span>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p>Bound props can use either <code>{ lng, lat }</code> objects or GeoJSON Location <code>[lng, lat]</code> arrays.</p> `);
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