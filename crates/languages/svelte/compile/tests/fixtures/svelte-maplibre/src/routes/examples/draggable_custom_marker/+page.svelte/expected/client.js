import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import Marker from '$lib/Marker.svelte';
import { mapClasses } from '../styles';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';

var root = $.from_html(`<span>Drag me !</span>`);
var root_1 = $.from_html(`<span>2-way Bound !</span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<ul><li> </li> <li>Position from <code>bind:latLng</code> </li></ul> <!> <p>Bound props can use either <code>&#123; lng, lat &#125;</code> objects or GeoJSON Location <code>[lng, lat]</code> arrays.</p> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let markerPos = $.state($.proxy([-122.2993, 47.4464]));
	const handleDrag = (event) => $.set(markerPos, event.lngLat, true);
	let boundPos = $.state($.proxy({ lng: -10, lat: -20 }));
	var fragment = root_3();
	var ul = $.first_child(fragment);
	var li = $.child(ul);
	var text = $.only_child(li);
	var li_1 = $.sibling(li, 2);
	var text_1 = $.sibling($.child(li_1), 2);

	$.reset(li_1);
	$.reset(ul);

	var node = $.sibling(ul, 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		get class() {
			return mapClasses;
		},
		standardControls: true,
		zoom: 1,
		center: [-20, 0],
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			Marker(node_1, {
				lngLat: [-122.2993, 47.4464],
				draggable: true,
				ondrag: handleDrag,
				class: 'grid h-8 w-20 place-items-center rounded-full border border-gray-200 bg-red-300 text-black shadow-2xl focus:outline-2 focus:outline-black',
				children: ($$anchor, $$slotProps) => {
					var span = root();

					$.append($$anchor, span);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Marker(node_2, {
				draggable: true,
				class: 'grid h-8 w-24 place-items-center rounded-full border border-gray-200 bg-red-300 text-black shadow-2xl focus:outline-2 focus:outline-black',
				get lngLat() {
					return $.get(boundPos);
				},

				set lngLat($$value) {
					$.set(boundPos, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var span_1 = root_1();

					$.append($$anchor, span_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 4);

	CodeSample(node_3, {
		get code() {
			return code;
		}
	});

	$.template_effect(
		($0, $1) => {
			$.set_text(text, `Position from drag events: ${$0 ?? ''}`);
			$.set_text(text_1, `: ${$1 ?? ''}`);
		},
		[
			() => JSON.stringify($.get(markerPos)),
			() => JSON.stringify($.get(boundPos))
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}