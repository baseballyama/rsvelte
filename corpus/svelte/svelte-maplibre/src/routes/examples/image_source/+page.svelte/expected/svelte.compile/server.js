import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import MapLibre from '$lib/MapLibre.svelte';
import { mapClasses } from '../styles';
import ImageSource from '$lib/ImageSource.svelte';
import RasterLayer from '$lib/RasterLayer.svelte';
import Marker from '$lib/Marker.svelte';
import quakeImageUrl from '$site/earthquake.png';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		let topLeft = { lng: -49.0, lat: 1.9 };
		let bottomRight = { lng: -73.6, lat: -17.9 };
		let opacity = 80;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="mx-auto mb-2 flex flex-col items-start gap-1"><label>Opacity: <input type="range"${$.attr('value', opacity)}${$.attr('min', 0)}${$.attr('max', 100)}/></label></div> `);

			MapLibre($$renderer, {
				style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
				class: mapClasses,
				standardControls: true,
				children: ($$renderer) => {
					ImageSource($$renderer, {
						url: quakeImageUrl,
						coordinates: [
							[topLeft.lng, topLeft.lat],
							[bottomRight.lng, topLeft.lat],
							[bottomRight.lng, bottomRight.lat],
							[topLeft.lng, bottomRight.lat]
						],

						children: ($$renderer) => {
							RasterLayer($$renderer, {
								paint: { 'raster-fade-duration': 0, 'raster-opacity': opacity / 100.0 }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Marker($$renderer, {
						draggable: true,
						get lngLat() {
							return topLeft;
						},

						set lngLat($$value) {
							topLeft = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<span class="dot svelte-1mdetuc"></span>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Marker($$renderer, {
						draggable: true,
						get lngLat() {
							return bottomRight;
						},

						set lngLat($$value) {
							bottomRight = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<span class="dot svelte-1mdetuc"></span>`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}