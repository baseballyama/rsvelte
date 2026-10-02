import * as $ from 'svelte/internal/server';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';
import GeoJson from '$lib/GeoJSON.svelte';
import MarkerLayer from '$lib/MarkerLayer.svelte';
import Marker from '$lib/Marker.svelte';

export default function _page($$renderer) {
	const features = {
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				properties: {},
				geometry: { type: 'Point', coordinates: [0, 0] }
			}
		]
	};

	$$renderer.push(`<p>The smaller green dot should be above the red dot. If you only see the red dot it's not working.
  Since the GeoJSON source loads asynchronously, without special z-index override the markers inside
  the GeoJSON source will always load after, and be on top of, the other markers, regardless of the
  order in which they are defined.</p> `);

	MapLibre($$renderer, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
		center: [0, 0],
		zoom: 2,
		standardControls: true,
		children: ($$renderer) => {
			GeoJson($$renderer, {
				data: features,
				children: ($$renderer) => {
					MarkerLayer($$renderer, {
						zIndex: 10,
						children: ($$renderer) => {
							$$renderer.push(`<div class="h-8 w-8 rounded-full bg-red-500"></div>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Marker($$renderer, {
				lngLat: [0, 0],
				zIndex: 20,
				children: ($$renderer) => {
					$$renderer.push(`<div class="h-4 w-4 rounded-full bg-green-500"></div>`);
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