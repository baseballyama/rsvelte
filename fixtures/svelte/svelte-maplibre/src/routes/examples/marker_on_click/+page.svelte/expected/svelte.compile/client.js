import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import MapEvents from '$lib/MapEvents.svelte';
import code from './+page.svelte?raw';
import DefaultMarker from '$lib/DefaultMarker.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let markers = $.state($.proxy([]));

	function addMarker(e) {
		$.set(markers, [...$.get(markers), { lngLat: e.lngLat }], true);
	}

	var fragment = root();
	var node = $.first_child(fragment);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
		standardControls: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			MapEvents(node_1, { onclick: addMarker });

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 17, () => $.get(markers), $.index, ($$anchor, marker) => {
				DefaultMarker($$anchor, {
					get lngLat() {
						return $.get(marker).lngLat;
					}
				});
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
	$.pop();
}