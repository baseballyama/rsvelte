import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import Marker from '$lib/Marker.svelte';
import { mapClasses } from '../styles';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import Popup from '$lib/Popup.svelte';

var root = $.from_html(`<div class="text-lg font-bold"> </div>`);
var root_1 = $.from_html(`<span> </span> <!>`, 1);
var root_2 = $.from_html(`<p><!></p> <button type="button" class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors"> </button> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let clickedName = $.state('');

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

	let open = $.state($.proxy(markers.map(() => false)));
	let buttonAction = $.derived(() => $.get(open).some((v) => v === false) ? 'open' : 'close');

	function toggleAll() {
		if ($.get(buttonAction) === 'open') {
			$.set(open, $.get(open).map(() => true), true);
		} else {
			$.set(open, $.get(open).map(() => false), true);
		}
	}

	var fragment = root_2();
	var p = $.first_child(fragment);
	var node = $.child(p);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, `You clicked ${$.get(clickedName) ?? ''}`));
			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text('Click a marker to see the airport\'s name.');

			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if ($.get(clickedName)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(p);

	var button = $.sibling(p, 2);
	var text_2 = $.only_child(button);
	var node_1 = $.sibling(button, 2);

	MapLibre(node_1, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		get class() {
			return mapClasses;
		},
		standardControls: true,
		zoom: 1,
		center: [-20, 0],
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.each(node_2, 19, () => markers, ({ lngLat, label, name }) => label, ($$anchor, $$item, i) => {
				let lngLat = () => $.get($$item).lngLat;
				let label = () => $.get($$item).label;
				let name = () => $.get($$item).name;

				Marker($$anchor, {
					get lngLat() {
						return lngLat();
					},
					onclick: () => $.set(clickedName, name(), true),
					class: 'grid h-8 w-8 place-items-center rounded-full border border-gray-200 bg-red-300 text-black shadow-2xl focus:outline-2 focus:outline-black',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_1();
						var span = $.first_child(fragment_4);
						var text_3 = $.only_child(span, true);
						var node_3 = $.sibling(span, 2);

						Popup(node_3, {
							openOn: 'click',
							offset: [0, -10],
							get open() {
								return $.get(open)[$.get(i)];
							},

							set open($$value) {
								$.get(open)[$.get(i)] = $$value;
							},

							children: ($$anchor, $$slotProps) => {
								var div = root();
								var text_4 = $.only_child(div, true);

								$.template_effect(() => $.set_text(text_4, name()));
								$.append($$anchor, div);
							},
							$$slots: { default: true }
						});

						$.template_effect(() => $.set_text(text_3, label()));
						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_1, 2);

	CodeSample(node_4, {
		get code() {
			return code;
		}
	});

	$.template_effect(() => $.set_text(text_2, `${$.get(buttonAction) === 'open' ? 'Open All' : 'Close All'} Popups`));
	$.delegated('click', button, toggleAll);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);