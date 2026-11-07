import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import GeoJSON from '$lib/GeoJSON.svelte';
import FillLayer from '$lib/FillLayer.svelte';
import LineLayer from '$lib/LineLayer.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import states from '$site/states.json?url';
import { contrastingColor } from '$site/colors.js';
import { hoverStateFilter } from '$lib/filters.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid w-full max-w-md items-center gap-y-2 self-start svelte-10ngguv"><label><input type="checkbox"/> Show fill</label> <label><input type="color"/> Fill Color</label> <label><input type="checkbox"/> Show border</label> <label><input type="color"/> Border Color</label></div> <label><input type="checkbox"/> Only show states starting with 'T'</label> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let showBorder = $.state(true);
	let showFill = $.state(true);
	let fillColor = $.state('#006600');
	let borderColor = $.state('#003300');
	let map = $.state(void 0);
	let loaded = $.state(false);

	let textLayers = $.derived(() => $.get(map) && $.get(loaded)
		? $.get(map).getStyle().layers.filter((layer) => {
			return layer.type === 'symbol' && layer['source-layer'] === 'place';
		})
		: []);

	let colors = $.derived(() => contrastingColor($.get(fillColor)));

	$.user_effect(() => {
		for (let layer of $.get(textLayers)) {
			$.get(map)?.setPaintProperty(layer.id, 'text-color', $.get(colors).textColor);
			$.get(map)?.setPaintProperty(layer.id, 'text-halo-color', $.get(colors).textOutlineColor);
		}
	});

	let filterStates = $.state(false);

	let filter = $.derived(() => $.get(filterStates)
		? ['==', 'T', ['slice', ['get', 'NAME'], 0, 1]]
		: undefined);

	var fragment = root_1();
	var div = $.first_child(fragment);
	var label = $.child(div);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	$.next();
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_2 = $.child(label_2);

	$.remove_input_defaults(input_2);
	$.next();
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var input_3 = $.child(label_3);

	$.remove_input_defaults(input_3);
	$.next();
	$.reset(label_3);
	$.reset(div);

	var label_4 = $.sibling(div, 2);
	var input_4 = $.child(label_4);

	$.remove_input_defaults(input_4);
	$.next();
	$.reset(label_4);

	var node = $.sibling(label_4, 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		get class() {
			return mapClasses;
		},
		standardControls: true,
		center: [-98.137, 40.137],
		zoom: 4,
		get map() {
			return $.get(map);
		},

		set map($$value) {
			$.set(map, $$value, true);
		},

		get loaded() {
			return $.get(loaded);
		},

		set loaded($$value) {
			$.set(loaded, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			GeoJSON($$anchor, {
				id: 'states',
				get data() {
					return states;
				},
				promoteId: 'STATEFP',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = $.derived(() => ({
									'fill-color': hoverStateFilter($.get(fillColor), $.get(colors).hoverBgColor),
									'fill-opacity': 0.5
								}));

								FillLayer($$anchor, {
									get paint() {
										return $.get($0);
									},

									get filter() {
										return $.get(filter);
									},
									beforeLayerType: 'symbol',
									manageHoverState: true
								});
							}
						};

						$.if(node_1, ($$render) => {
							if ($.get(showFill)) $$render(consequent);
						});
					}

					var node_2 = $.sibling(node_1, 2);

					{
						var consequent_1 = ($$anchor) => {
							{
								let $0 = $.derived(() => ({ 'line-color': $.get(borderColor), 'line-width': 3 }));

								LineLayer($$anchor, {
									layout: { 'line-cap': 'round', 'line-join': 'round' },
									get paint() {
										return $.get($0);
									},
									beforeLayerType: 'symbol'
								});
							}
						};

						$.if(node_2, ($$render) => {
							if ($.get(showBorder)) $$render(consequent_1);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	CodeSample(node_3, {
		get code() {
			return code;
		}
	});

	$.bind_checked(input, () => $.get(showFill), ($$value) => $.set(showFill, $$value));
	$.bind_value(input_1, () => $.get(fillColor), ($$value) => $.set(fillColor, $$value));
	$.bind_checked(input_2, () => $.get(showBorder), ($$value) => $.set(showBorder, $$value));
	$.bind_value(input_3, () => $.get(borderColor), ($$value) => $.set(borderColor, $$value));
	$.bind_checked(input_4, () => $.get(filterStates), ($$value) => $.set(filterStates, $$value));
	$.append($$anchor, fragment);
	$.pop();
}