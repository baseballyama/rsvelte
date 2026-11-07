import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import DefaultMarker from '$lib/DefaultMarker.svelte';
import { mapClasses } from '../styles';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import Popup from '$lib/Popup.svelte';

var root = $.from_html(`<div class="text-lg font-bold"> </div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	const markers = [
		{ lngLat: [-122.2993, 47.4464], label: 'SEA', name: 'Seattle' },
		{ lngLat: [-159.3438, 21.9788], label: 'LIH', name: 'Lihue' },
		{
			lngLat: [2.5479, 49.0097],
			label: 'CDG',
			name: 'Paris Charles de Gaulle'
		},

		{
			lngLat: [-58.5348, -34.82],
			label: 'EZE',
			name: 'Ministro Pistarini'
		},
		{ lngLat: [18.6021, -33.9715], label: 'CPT', name: 'Cape Town' },
		{
			lngLat: [121.0165, 14.5123],
			label: 'MNL',
			name: 'Ninoy Aquino'
		}
	];

	var fragment = root_1();
	var node = $.first_child(fragment);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		get class() {
			return mapClasses;
		},
		standardControls: true,
		zoom: 1,
		center: [-20, 0],
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => markers, $.index, ($$anchor, $$item) => {
				let lngLat = () => $.get($$item).lngLat;
				let name = () => $.get($$item).name;

				DefaultMarker($$anchor, {
					get lngLat() {
						return lngLat();
					},
					draggable: true,
					children: ($$anchor, $$slotProps) => {
						Popup($$anchor, {
							offset: [0, -10],
							children: ($$anchor, $$slotProps) => {
								var div = root();
								var text = $.only_child(div, true);

								$.template_effect(() => $.set_text(text, name()));
								$.append($$anchor, div);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	CodeSample(node_2, {
		get code() {
			return code;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}