import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		let projection = 'globe';

		function toggleProjection() {
			projection = projection === 'globe' ? 'mercator' : 'globe';
		}

		$$renderer.push(`<button class="bg-primary text-primary-foreground hover:bg-primary/90 mb-4 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors" type="button">Toggle Projection</button> `);

		MapLibre($$renderer, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
			standardControls: true,
			projection: { type: projection }
		});

		$$renderer.push(`<!----> `);
		CodeSample($$renderer, { code });
		$$renderer.push(`<!---->`);
	});
}