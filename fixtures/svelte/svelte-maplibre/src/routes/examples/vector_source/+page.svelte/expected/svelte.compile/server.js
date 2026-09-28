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
		$$renderer.push(`<p>This map shows how to use vector sources (MVT) on the map.</p> `);

		MapLibre($$renderer, {
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			class: mapClasses,
			standardControls: true,
			center: [-87.622088, 41.878781],
			zoom: 10,
			children: ($$renderer) => {
				VectorTileSource($$renderer, {
					tiles: [
						'https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token=MLY|4142433049200173|72206abe5035850d6743b23a49c41333'
					],

					children: ($$renderer) => {
						LineLayer($$renderer, {
							paint: {
								'line-opacity': 0.6,
								'line-color': 'rgb(53, 175, 109)',
								'line-width': 2
							},
							sourceLayer: 'sequence'
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