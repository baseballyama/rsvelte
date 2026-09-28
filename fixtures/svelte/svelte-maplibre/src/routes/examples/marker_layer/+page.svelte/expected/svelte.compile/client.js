import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import GeoJSON from '$lib/GeoJSON.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import states from '$site/states.json?url';
import MarkerLayer from '$lib/MarkerLayer.svelte';
import Popup from '$lib/Popup.svelte';

var root = $.from_html(`<div class="rounded-full bg-gray-200 p-2 shadow"><div class="text-sm font-bold"> </div></div> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	var fragment = root_1();
	var node = $.first_child(fragment);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		get class() {
			return mapClasses;
		},
		standardControls: true,
		center: [-98.137, 40.137],
		zoom: 4,
		children: ($$anchor, $$slotProps) => {
			GeoJSON($$anchor, {
				id: 'states',
				get data() {
					return states;
				},
				promoteId: 'STATEFP',
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let feature = () => ($$arg0?.()).feature;
							var fragment_3 = root();
							var div = $.first_child(fragment_3);
							var div_1 = $.child(div);
							var text = $.only_child(div_1, true);

							$.reset(div);

							var node_1 = $.sibling(div, 2);

							Popup(node_1, {
								openOn: 'hover',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, `${feature().properties?.NAME ?? ''} has FIPS code ${feature().properties?.STATEFP ?? ''}`));
									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							$.template_effect(() => $.set_text(text, feature().properties?.NAME));
							$.append($$anchor, fragment_3);
						};

						MarkerLayer($$anchor, { interactive: true, children, $$slots: { default: true } });
					}
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