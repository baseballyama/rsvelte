import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import NavigationControl from '$lib/NavigationControl.svelte';
import AttributionControl from '$lib/AttributionControl.svelte';
import RasterTileSource from '$lib/RasterTileSource.svelte';
import RasterDEMTileSource from '$lib/RasterDEMTileSource.svelte';
import RasterLayer from '$lib/RasterLayer.svelte';
import HillshadeLayer from '$lib/HillshadeLayer.svelte';
import Terrain from '$lib/Terrain.svelte';
import TerrainControl from '$lib/TerrainControl.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		let terrainExaggeration = 1.0;
		let hillshadeExaggeration = 0.5;
		let illuminationAnchor = 'map';

		$$renderer.push(`<p>This map shows how to use 3D terrain with hillshading on the map. Data from <a href="https://github.com/maplibre/demotiles" target="_blank">MapLibre Demo Tiles</a>. Tutorial based on <a href="https://maplibre.org/maplibre-gl-js/docs/examples/3d-terrain/" target="_blank">MapLibre GL JS 3D Terrain</a>.</p> <fieldset class="flex gap-x-4"><legend>Hillshade illumination anchor</legend> <label><input type="radio"${$.attr('checked', illuminationAnchor === 'map', true)} value="map"/> Map</label> <label><input type="radio"${$.attr('checked', illuminationAnchor === 'viewport', true)} value="viewport"/> Viewport (default)</label></fieldset> <fieldset class="flex gap-x-4"><legend>Exaggeration</legend> <label>Hillshade: ${$.escape(hillshadeExaggeration.toFixed(2))} <input type="range" min="0.0" max="1.0" step="0.01"${$.attr('value', hillshadeExaggeration)} id="hillshade-exaggeration"/></label> <label>Terrain: ${$.escape(terrainExaggeration.toFixed(1))} <input type="range" min="0.0" max="5.0" step="0.1"${$.attr('value', terrainExaggeration)} id="terrain-exaggeration"/></label></fieldset> `);

		MapLibre($$renderer, {
			style: {
				version: 8,
				center: [11.39085, 47.3],
				zoom: 12,
				pitch: 52,
				sources: {},
				layers: []
			},
			class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
			attributionControl: false,
			diffStyleUpdates: true,
			children: ($$renderer) => {
				NavigationControl($$renderer, { visualizePitch: true, position: 'top-right' });
				$$renderer.push(`<!----> `);

				AttributionControl($$renderer, {
					customAttribution: `Map data © <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> Contributors | Terrain data <a href="https://earth.jaxa.jp/en/data/policy/">AW3D30 (JAXA)</a> | <a href=https://maplibre.org>MapLibre</a>`
				});

				$$renderer.push(`<!----> `);

				RasterTileSource($$renderer, {
					tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
					tileSize: 256,
					children: ($$renderer) => {
						RasterLayer($$renderer, { paint: {} });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				RasterDEMTileSource($$renderer, {
					tiles: [
						'https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png'
					],
					tileSize: 256,
					id: 'terrainSource'
				});

				$$renderer.push(`<!----> `);

				RasterDEMTileSource($$renderer, {
					tiles: [
						'https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png'
					],
					tileSize: 256,
					id: 'hillshadeSource',
					children: ($$renderer) => {
						HillshadeLayer($$renderer, {
							id: 'hills',
							layout: { visibility: 'visible' },
							paint: {
								'hillshade-exaggeration': hillshadeExaggeration,
								'hillshade-illumination-anchor': illuminationAnchor,
								'hillshade-shadow-color': '#473B24'
							}
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Terrain($$renderer, { source: 'terrainSource', exaggeration: terrainExaggeration });
				$$renderer.push(`<!----> `);

				TerrainControl($$renderer, {
					source: 'terrainSource',
					exaggeration: terrainExaggeration,
					position: 'top-right'
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		CodeSample($$renderer, { code });
		$$renderer.push(`<!---->`);
	});
}