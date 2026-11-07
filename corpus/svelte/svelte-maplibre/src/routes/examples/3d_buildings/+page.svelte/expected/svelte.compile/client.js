import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import { mapClasses, streetsStyle, hasMaptilerKey } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import FillExtrusionLayer from '$lib/FillExtrusionLayer.svelte';

var root = $.from_html(`<h2 class="text-red-500">Please set the PUBLIC_MAPTILER_KEY environment variable to your MapTiler API key to run this
    example.</h2>`);

var root_1 = $.from_html(
	`<!> <p>This example uses a FillExtrusionLayer to show a 3D view of buildings, with shorter buildings in
  green and taller buildings in red.<br/> Hold down Ctrl and drag the mouse to rotate on a computer.</p> <!> <!>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var h2 = root();

			$.append($$anchor, h2);
		};

		$.if(node, ($$render) => {
			if (!hasMaptilerKey) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 4);

	MapLibre(node_1, {
		get style() {
			return streetsStyle;
		},

		get class() {
			return mapClasses;
		},
		standardControls: true,
		center: [-74.0066, 40.7135],
		zoom: 15.5,
		pitch: 45,
		bearing: -17.6,
		filterLayers: (l) => {
			// Hide the built-in 3D building layer since we're doing our own.
			return l.id !== 'building-3d';
		},

		children: ($$anchor, $$slotProps) => {
			FillExtrusionLayer($$anchor, {
				source: 'maptiler_planet',
				sourceLayer: 'building',
				beforeLayerType: (l) => l.type === 'symbol' && !!l.paint?.['text-color'],
				minzoom: 14,
				paint: {
					'fill-extrusion-color': [
						'interpolate',
						['linear'],
						['get', 'render_height'],
						0,
						'#0a0',
						70,
						'#a00'
					],
					'fill-extrusion-height': [
						'interpolate',
						['linear'],
						['zoom'],
						14,
						0,
						14.05,
						['get', 'render_height']
					],
					'fill-extrusion-base': [
						'interpolate',
						['linear'],
						['zoom'],
						14,
						0,
						14.05,
						['get', 'render_min_height']
					],
					'fill-extrusion-opacity': 0.6
				}
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	CodeSample(node_2, {
		get code() {
			return code;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}