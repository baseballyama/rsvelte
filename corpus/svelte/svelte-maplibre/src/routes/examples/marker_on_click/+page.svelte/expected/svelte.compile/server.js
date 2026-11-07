import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import MapEvents from '$lib/MapEvents.svelte';
import code from './+page.svelte?raw';
import DefaultMarker from '$lib/DefaultMarker.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		let markers = [];

		function addMarker(e) {
			markers = [...markers, { lngLat: e.lngLat }];
		}

		MapLibre($$renderer, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
			standardControls: true,
			children: ($$renderer) => {
				MapEvents($$renderer, { onclick: addMarker });
				$$renderer.push(`<!----> <!--[-->`);

				const each_array = $.ensure_array_like(markers);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let marker = each_array[$$index];

					DefaultMarker($$renderer, { lngLat: marker.lngLat });
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