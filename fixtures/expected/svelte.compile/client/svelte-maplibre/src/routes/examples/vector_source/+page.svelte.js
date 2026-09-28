import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import VectorTileSource from '$lib/VectorTileSource.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import LineLayer from '$lib/LineLayer.svelte';

var root = $.from_html(`<p>This map shows how to use vector sources (MVT) on the map.</p> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		get class() {
			return mapClasses;
		},
		standardControls: true,
		center: [-87.622088, 41.878781],
		zoom: 10,
		children: ($$anchor, $$slotProps) => {
			VectorTileSource($$anchor, {
				tiles: [
					'https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token=MLY|4142433049200173|72206abe5035850d6743b23a49c41333'
				],

				children: ($$anchor, $$slotProps) => {
					LineLayer($$anchor, {
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

	var node_1 = $.sibling(node, 2);

	CodeSample(node_1, {
		get code() {
			return code;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}