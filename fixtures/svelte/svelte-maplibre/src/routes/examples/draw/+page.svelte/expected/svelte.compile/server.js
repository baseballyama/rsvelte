import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import '$lib/draw-plugin.css';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Import MapboxDraw and its CSS
		// Also need this CSS which lets the mouse pointers work correctly with Maplibre
		// when switching modes in the draw plugin.
		// import 'svelte-maplibre/draw-plugin.css';
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		let map = void 0;

		function createMapboxDraw() {
			let draw = new MapboxDraw();
			const origOnAdd = draw.onAdd.bind(draw);

			// MapboxDraw assumes that the `mapboxgl-ctrl-group` and `mapboxgl-ctrl` CSS classes exist,
			// but Maplibre uses different names, so add them to the control element here.
			//
			// @ts-expect-error draw's onadd expects a mapboxgl.Map but we have a maplibregl.Map, which has close enough to the
			// same API.
			draw.onAdd = (map) => {
				// @ts-expect-error Same as above
				let el = origOnAdd(map);

				el.classList.add('maplibregl-ctrl-group');
				el.classList.add('maplibregl-ctrl');

				return el;
			};

			return draw;
		}

		let draw = createMapboxDraw();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MapLibre($$renderer, {
				style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
				class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
				standardControls: true,
				get map() {
					return map;
				},

				set map($$value) {
					map = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			CodeSample($$renderer, {
				code,
				startBoundary: '<scrip',
				endBoundary: '<CodeSample',
				omitEndBoundary: true
			});

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