import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		let bounds = [-32, -8, 63, 41];
		let displayBounds = $.derived(() => bounds.map((b) => b.toFixed(4)).join(', '));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<p class="tabular-nums">Bounds: ${$.escape(displayBounds())}</p> `);

			MapLibre($$renderer, {
				style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
				class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
				standardControls: true,
				get bounds() {
					return bounds;
				},

				set bounds($$value) {
					bounds = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			CodeSample($$renderer, {
				code,
				endBoundary: '/>',
				omitStartBoundary: false,
				omitEndBoundary: false
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