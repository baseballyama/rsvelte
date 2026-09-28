import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import DefaultMarker from '$lib/DefaultMarker.svelte';
import { mapClasses } from '../styles';
import code from './+page.svelte?raw';
import serverCode from './[id]/+server.ts?raw';
import CodeSample from '$site/CodeSample.svelte';
import Popup from '$lib/Popup.svelte';

var root = $.from_html(`<div class="text-lg font-bold"> </div> <img alt="dog"/>`, 1);
var root_1 = $.from_html(`<div>Loading...</div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

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

	let cache = $.proxy({});
	var fragment = root_2();
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
							onopen: async () => {
								if (!(name() in cache)) {
									const resp = await fetch(`/examples/popup_remote/${name()}`);
									const result = await resp.json();

									cache[name()] = result;
								}
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_2 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										const result = $.derived(() => cache[name()]);
										var fragment_5 = root();
										var div = $.first_child(fragment_5);
										var text = $.only_child(div, true);
										var img = $.sibling(div, 2);

										$.template_effect(() => {
											$.set_text(text, name());
											$.set_attribute(img, 'src', `https://placedog.net/${$.get(result).width}/${$.get(result).height}`);
										});

										$.append($$anchor, fragment_5);
									};

									var alternate = ($$anchor) => {
										var div_1 = root_1();

										$.append($$anchor, div_1);
									};

									$.if(node_2, ($$render) => {
										if (name() in cache) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_4);
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

	var node_3 = $.sibling(node, 2);

	CodeSample(node_3, {
		get code() {
			return code;
		}
	});

	var node_4 = $.sibling(node_3, 2);

	CodeSample(node_4, {
		get code() {
			return serverCode;
		},
		language: 'typescript',
		startBoundary: '',
		endBoundary: ''
	});

	$.append($$anchor, fragment);
	$.pop();
}