import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import VectorTileSource from '$lib/VectorTileSource.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import LineLayer from '$lib/LineLayer.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);
		$$renderer.push(`<p>This map shows how to use <a href="https://protomaps.com/docs/pmtiles" target="__blank">PMTile</a> sources on a map.</p> `);

		MapLibre($$renderer, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			class: mapClasses,
			standardControls: true,
			center: [-87.622088, 41.878781],
			zoom: 10,
			children: ($$renderer) => {
				VectorTileSource($$renderer, {
					url: 'pmtiles://https://r2-public.protomaps.com/protomaps-sample-datasets/cb_2018_us_zcta510_500k.pmtiles',
					children: ($$renderer) => {
						LineLayer($$renderer, {
							paint: {
								'line-opacity': 0.6,
								'line-color': 'rgb(53, 175, 109)',
								'line-width': 2
							},
							sourceLayer: 'zcta'
						});
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