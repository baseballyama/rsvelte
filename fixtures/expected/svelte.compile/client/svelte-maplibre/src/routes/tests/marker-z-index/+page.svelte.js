import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';
import GeoJson from '$lib/GeoJSON.svelte';
import MarkerLayer from '$lib/MarkerLayer.svelte';
import Marker from '$lib/Marker.svelte';

var root = $.from_html(`<div class="h-8 w-8 rounded-full bg-red-500"></div>`);
var root_1 = $.from_html(`<div class="h-4 w-4 rounded-full bg-green-500"></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

var root_3 = $.from_html(
	`<p>The smaller green dot should be above the red dot. If you only see the red dot it's not working.
  Since the GeoJSON source loads asynchronously, without special z-index override the markers inside
  the GeoJSON source will always load after, and be on top of, the other markers, regardless of the
  order in which they are defined.</p> <!> <!>`,
	1
);

export default function _page($$anchor) {
	const features = {
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				properties: {},
				geometry: { type: 'Point', coordinates: [0, 0] }
			}
		]
	};

	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
		center: [0, 0],
		zoom: 2,
		standardControls: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			GeoJson(node_1, {
				get data() {
					return features;
				},

				children: ($$anchor, $$slotProps) => {
					MarkerLayer($$anchor, {
						zIndex: 10,
						children: ($$anchor, $$slotProps) => {
							var div = root();

							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Marker(node_2, {
				lngLat: [0, 0],
				zIndex: 20,
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_1();

					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	CodeSample(node_3, {
		get code() {
			return code;
		}
	});

	$.append($$anchor, fragment);
}