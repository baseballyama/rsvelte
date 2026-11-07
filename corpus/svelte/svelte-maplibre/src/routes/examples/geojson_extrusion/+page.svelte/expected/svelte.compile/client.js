import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import GeoJSON from '$lib/GeoJSON.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import cbsa from '$site/cbsa.json';
import FillExtrusionLayer from '$lib/FillExtrusionLayer.svelte';
import Popup from '$lib/Popup.svelte';

var root = $.from_html(`<div class="flex flex-col gap-2"><div class="text-lg font-bold"> </div> <p> </p></div>`);

var root_1 = $.from_html(
	`<p>Map of US Metropolitan Areas. Height indicates total population and color indicates population
  density.</p> <!> <!>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		get class() {
			return mapClasses;
		},
		standardControls: true,
		pitch: 30,
		center: [-98.137, 40.137],
		zoom: 4,
		children: ($$anchor, $$slotProps) => {
			GeoJSON($$anchor, {
				id: 'cbsa',
				get data() {
					return cbsa;
				},
				promoteId: 'CBSAFP',
				children: ($$anchor, $$slotProps) => {
					FillExtrusionLayer($$anchor, {
						paint: {
							'fill-extrusion-base': 0,
							'fill-extrusion-color': [
								'interpolate',
								['linear'],
								[
									'/',
									['get', 'POPESTIMATE2020'],
									['/', ['get', 'ALAND'], 1000000]
								],
								0,
								'#0a0',
								200,
								'#a00'
							],
							'fill-extrusion-opacity': 0.6,
							'fill-extrusion-height': ['/', ['get', 'POPESTIMATE2020'], 20]
						},
						beforeLayerType: 'symbol',
						children: ($$anchor, $$slotProps) => {
							{
								const children = ($$anchor, $$arg0) => {
									let data = () => ($$arg0?.()).data;
									const props = $.derived(() => data()?.properties);
									var fragment_4 = $.comment();
									var node_1 = $.first_child(fragment_4);

									{
										var consequent = ($$anchor) => {
											var div = root();
											var div_1 = $.child(div);
											var text = $.only_child(div_1, true);
											var p = $.sibling(div_1, 2);
											var text_1 = $.only_child(p);

											$.reset(div);

											$.template_effect(() => {
												$.set_text(text, $.get(props).NAME);
												$.set_text(text_1, `Population: ${$.get(props).POPESTIMATE2020 ?? ''}`);
											});

											$.append($$anchor, div);
										};

										$.if(node_1, ($$render) => {
											if ($.get(props)) $$render(consequent);
										});
									}

									$.append($$anchor, fragment_4);
								};

								Popup($$anchor, { openOn: 'hover', children, $$slots: { default: true } });
							}
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
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