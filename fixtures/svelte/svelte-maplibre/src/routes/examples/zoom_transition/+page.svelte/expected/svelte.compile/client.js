import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import GeoJSON from '$lib/GeoJSON.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import states from '$site/states.json';
import counties from '$site/counties.json';
import { isTextLayer } from '$lib/filters.js';
import FillLayer from '$lib/FillLayer.svelte';
import SymbolLayer from '$lib/SymbolLayer.svelte';
import LineLayer from '$lib/LineLayer.svelte';
import { geoCentroid } from 'd3-geo';
import ZoomRange from '$lib/ZoomRange.svelte';
import { zoomTransition } from '$lib/expressions.js';

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(
	`<p>This example uses the ZoomRange component and zoomTransition function to fade smoothly between
  states and counties as the map zooms.</p> <div class="w-full self-start"><label class="flex w-full flex-wrap gap-x-2"><span> </span> <input class="w-32" type="range"/></label> <p> </p></div> <!> <!>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	function calculateCenters(g) {
		let centers = g.features.map((f) => {
			return {
				...f,
				geometry: { type: 'Point', coordinates: geoCentroid(f) }
			};
		});

		return { type: 'FeatureCollection', features: centers };
	}

	const stateCenters = calculateCenters(states);
	const countyCenters = calculateCenters(counties);
	let zoomThreshold = $.state(5);
	let currentZoom = $.state(4);
	var fragment = root_1();
	var div = $.sibling($.first_child(fragment), 2);
	var label = $.child(div);
	var span = $.child(label);
	var text = $.only_child(span);
	var input = $.sibling(span, 2);

	$.remove_input_defaults(input);
	$.set_attribute(input, 'min', 0);
	$.set_attribute(input, 'max', 10);
	$.set_attribute(input, 'step', 0.1);
	$.reset(label);

	var p = $.sibling(label, 2);
	var text_1 = $.only_child(p);

	$.reset(div);

	var node = $.sibling(div, 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		get class() {
			return mapClasses;
		},
		standardControls: true,
		center: [-98.137, 40.137],
		zoom: 4,
		onzoomend: ({ target: map }) => $.set(currentZoom, map.getZoom(), true),
		filterLayers: (l) => !isTextLayer(l, 'carto'),
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => $.get(zoomThreshold) + 0.5);

				ZoomRange(node_1, {
					get maxzoom() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						const fadeStates = $.derived(() => zoomTransition($.get(zoomThreshold) - 1, 0.8, $.get(zoomThreshold) + 0.5, 0));
						const fadeStatesText = $.derived(() => zoomTransition($.get(zoomThreshold) - 1, 1, $.get(zoomThreshold), 0.2));
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						GeoJSON(node_2, {
							id: 'states',
							get data() {
								return states;
							},
							promoteId: 'GEOID',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_3 = $.first_child(fragment_3);

								{
									let $0 = $.derived(() => ({ 'fill-color': 'green', 'fill-opacity': $.get(fadeStates) }));

									FillLayer(node_3, {
										get paint() {
											return $.get($0);
										}
									});
								}

								var node_4 = $.sibling(node_3, 2);

								{
									let $0 = $.derived(() => ({
										'line-color': 'white',
										'line-width': 1,
										'line-opacity': $.get(fadeStates)
									}));

									LineLayer(node_4, {
										get paint() {
											return $.get($0);
										}
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_2, 2);

						GeoJSON(node_5, {
							id: 'state-centers',
							get data() {
								return stateCenters;
							},
							promoteId: 'GEOID',
							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => ({
										'text-color': '#333',
										'text-opacity': $.get(fadeStatesText),
										'text-halo-color': '#eee',
										'text-halo-width': 0.5,
										'text-halo-blur': 0.5
									}));

									let $1 = $.derived(() => ({
										'text-allow-overlap': true,
										'text-field': ['get', 'STUSPS'],
										'text-size': zoomTransition(3, 16, 5, 24)
									}));

									SymbolLayer($$anchor, {
										filter: ['!=', ['get', 'STUSPS'], 'DC'],
										get paint() {
											return $.get($0);
										},

										get layout() {
											return $.get($1);
										}
									});
								}
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			}

			var node_6 = $.sibling(node_1, 2);

			{
				let $0 = $.derived(() => $.get(zoomThreshold) - 0.5);

				ZoomRange(node_6, {
					get minzoom() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						const fadeCounties = $.derived(() => zoomTransition($.get(zoomThreshold) - 0.5, 0, $.get(zoomThreshold) + 0.5, 0.8));
						const fadeCountiesText = $.derived(() => zoomTransition($.get(zoomThreshold), 0.2, $.get(zoomThreshold) + 0.5, 1));
						var fragment_5 = root();
						var node_7 = $.first_child(fragment_5);

						GeoJSON(node_7, {
							id: 'counties',
							get data() {
								return counties;
							},
							promoteId: 'GEOID',
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var node_8 = $.first_child(fragment_6);

								{
									let $0 = $.derived(() => ({ 'fill-color': 'orange', 'fill-opacity': $.get(fadeCounties) }));

									FillLayer(node_8, {
										get paint() {
											return $.get($0);
										}
									});
								}

								var node_9 = $.sibling(node_8, 2);

								{
									let $0 = $.derived(() => ({
										'line-color': 'white',
										'line-width': 1,
										'line-opacity': $.get(fadeCounties)
									}));

									LineLayer(node_9, {
										get paint() {
											return $.get($0);
										}
									});
								}

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});

						var node_10 = $.sibling(node_7, 2);

						GeoJSON(node_10, {
							id: 'county-centers',
							get data() {
								return countyCenters;
							},
							promoteId: 'GEOID',
							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => ({
										'text-color': 'black',
										'text-opacity': $.get(fadeCountiesText)
									}));

									let $1 = $.derived(() => ({
										'text-field': ['get', 'NAME'],
										'text-size': zoomTransition(5, 12, 10, 24)
									}));

									SymbolLayer($$anchor, {
										get paint() {
											return $.get($0);
										},

										get layout() {
											return $.get($1);
										}
									});
								}
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node, 2);

	CodeSample(node_11, {
		get code() {
			return code;
		}
	});

	$.template_effect(
		($0) => {
			$.set_text(text, `Transition at zoom level: ${$.get(zoomThreshold) ?? ''}`);
			$.set_text(text_1, `Current Zoom: ${$0 ?? ''}`);
		},
		[() => $.get(currentZoom).toFixed(1)]
	);

	$.bind_value(input, () => $.get(zoomThreshold), ($$value) => $.set(zoomThreshold, $$value));
	$.append($$anchor, fragment);
	$.pop();
}