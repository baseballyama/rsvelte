import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<p>This map shows how to use 3D terrain with hillshading on the map. Data from <a href="https://github.com/maplibre/demotiles" target="_blank">MapLibre Demo Tiles</a>. Tutorial based on <a href="https://maplibre.org/maplibre-gl-js/docs/examples/3d-terrain/" target="_blank">MapLibre GL JS 3D Terrain</a>.</p> <fieldset class="flex gap-x-4"><legend>Hillshade illumination anchor</legend> <label><input type="radio"/> Map</label> <label><input type="radio"/> Viewport (default)</label></fieldset> <fieldset class="flex gap-x-4"><legend>Exaggeration</legend> <label> <input type="range" min="0.0" max="1.0" step="0.01" id="hillshade-exaggeration"/></label> <label> <input type="range" min="0.0" max="5.0" step="0.1" id="terrain-exaggeration"/></label></fieldset> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let terrainExaggeration = $.state(1.0);
	let hillshadeExaggeration = $.state(0.5);
	let illuminationAnchor = $.state('map');
	var fragment = root_1();
	var fieldset = $.sibling($.first_child(fragment), 2);
	var label = $.sibling($.child(fieldset), 2);
	var input = $.child(label);

	$.remove_input_defaults(input);
	input.value = input.__value = 'map';
	$.next();
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'viewport';
	$.next();
	$.reset(label_1);
	$.reset(fieldset);

	var fieldset_1 = $.sibling(fieldset, 2);
	var label_2 = $.sibling($.child(fieldset_1), 2);
	var text = $.child(label_2);
	var input_2 = $.sibling(text);

	$.remove_input_defaults(input_2);
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var text_1 = $.child(label_3);
	var input_3 = $.sibling(text_1);

	$.remove_input_defaults(input_3);
	$.reset(label_3);
	$.reset(fieldset_1);

	var node = $.sibling(fieldset_1, 2);

	MapLibre(node, {
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
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			NavigationControl(node_1, { visualizePitch: true, position: 'top-right' });

			var node_2 = $.sibling(node_1, 2);

			AttributionControl(node_2, {
				customAttribution: `Map data © <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> Contributors | Terrain data <a href="https://earth.jaxa.jp/en/data/policy/">AW3D30 (JAXA)</a> | <a href=https://maplibre.org>MapLibre</a>`
			});

			var node_3 = $.sibling(node_2, 2);

			RasterTileSource(node_3, {
				tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
				tileSize: 256,
				children: ($$anchor, $$slotProps) => {
					RasterLayer($$anchor, { paint: {} });
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			RasterDEMTileSource(node_4, {
				tiles: [
					'https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png'
				],
				tileSize: 256,
				id: 'terrainSource'
			});

			var node_5 = $.sibling(node_4, 2);

			RasterDEMTileSource(node_5, {
				tiles: [
					'https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png'
				],
				tileSize: 256,
				id: 'hillshadeSource',
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => ({
							'hillshade-exaggeration': $.get(hillshadeExaggeration),
							'hillshade-illumination-anchor': $.get(illuminationAnchor),
							'hillshade-shadow-color': '#473B24'
						}));

						HillshadeLayer($$anchor, {
							id: 'hills',
							layout: { visibility: 'visible' },
							get paint() {
								return $.get($0);
							}
						});
					}
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Terrain(node_6, {
				source: 'terrainSource',
				get exaggeration() {
					return $.get(terrainExaggeration);
				}
			});

			var node_7 = $.sibling(node_6, 2);

			TerrainControl(node_7, {
				source: 'terrainSource',
				get exaggeration() {
					return $.get(terrainExaggeration);
				},
				position: 'top-right'
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node, 2);

	CodeSample(node_8, {
		get code() {
			return code;
		}
	});

	$.template_effect(
		($0, $1) => {
			$.set_text(text, `Hillshade: ${$0 ?? ''} `);
			$.set_text(text_1, `Terrain: ${$1 ?? ''} `);
		},
		[
			() => $.get(hillshadeExaggeration).toFixed(2),
			() => $.get(terrainExaggeration).toFixed(1)
		]
	);

	$.bind_group(binding_group, [], input, () => $.get(illuminationAnchor), ($$value) => $.set(illuminationAnchor, $$value));
	$.bind_group(binding_group, [], input_1, () => $.get(illuminationAnchor), ($$value) => $.set(illuminationAnchor, $$value));
	$.bind_value(input_2, () => $.get(hillshadeExaggeration), ($$value) => $.set(hillshadeExaggeration, $$value));
	$.bind_value(input_3, () => $.get(terrainExaggeration), ($$value) => $.set(terrainExaggeration, $$value));
	$.append($$anchor, fragment);
	$.pop();
}