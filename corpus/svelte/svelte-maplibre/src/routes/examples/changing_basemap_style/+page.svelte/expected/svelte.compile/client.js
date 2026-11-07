import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { SymbolLayer, MapLibre, GeoJSON, FillLayer, LineLayer } from '$lib';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import states from '$site/states.json?url';
import quakeImageUrl from '$site/earthquake.png';
import tsunamiImageUrl from '$site/tsunami.png';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="controls svelte-r0s2ik"><select class="controls-select svelte-r0s2ik"><option>Light</option><option>dark</option></select> <select class="controls-select svelte-r0s2ik"><option>States Dataset</option><option>Colorado Dataset</option></select></div> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let showBorder = true;
	let showFill = true;
	let fillColor = '#006600';
	let borderColor = '#003300';
	let selected = $.state('light');

	let style = $.derived(() => $.get(selected) === 'light'
		? 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
		: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json');

	const coloradoPolygon = {
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				properties: {},
				geometry: {
					type: 'Polygon',
					coordinates: [[[-109, 37], [-102, 37], [-102, 41], [-109, 41], [-109, 37]]]
				}
			}
		]
	};

	const pointsData = {
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				properties: { image: 'quake' },
				geometry: { type: 'Point', coordinates: [-127.5, 45.5] }
			},

			{
				type: 'Feature',
				properties: { image: 'tsunami' },
				geometry: { type: 'Point', coordinates: [-91.6, 28.7] }
			}
		]
	};

	let dataOption = $.state('states');
	let dataset = $.derived(() => $.get(dataOption) === 'states' ? states : coloradoPolygon);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var select = $.child(div);
	var option = $.child(select);

	option.value = option.__value = 'light';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'dark';
	$.reset(select);
	$.init_select(select);

	var select_1 = $.sibling(select, 2);
	var option_2 = $.child(select_1);

	option_2.value = option_2.__value = 'states';

	var option_3 = $.sibling(option_2);

	option_3.value = option_3.__value = 'colorado';
	$.reset(select_1);
	$.init_select(select_1);
	$.reset(div);

	var node = $.sibling(div, 2);

	{
		let $0 = $.derived(() => [
			{ id: 'quake', url: quakeImageUrl },
			{ id: 'tsunami', url: tsunamiImageUrl }
		]);

		MapLibre(node, {
			get style() {
				return $.get(style);
			},

			get class() {
				return mapClasses;
			},
			standardControls: true,
			center: [-98.137, 40.137],
			zoom: 3,
			get images() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				GeoJSON(node_1, {
					id: 'states',
					get data() {
						return $.get(dataset);
					},
					promoteId: 'STATEFP',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								FillLayer($$anchor, {
									paint: { 'fill-color': fillColor, 'fill-opacity': 0.5 },
									beforeLayerType: 'symbol'
								});
							};

							$.if(node_2, ($$render) => {
								if (showFill) $$render(consequent);
							});
						}

						var node_3 = $.sibling(node_2, 2);

						{
							var consequent_1 = ($$anchor) => {
								LineLayer($$anchor, {
									layout: { 'line-cap': 'round', 'line-join': 'round' },
									paint: { 'line-color': borderColor, 'line-width': 3 },
									beforeLayerType: 'symbol'
								});
							};

							$.if(node_3, ($$render) => {
								if (showBorder) $$render(consequent_1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_1, 2);

				GeoJSON(node_4, {
					get data() {
						return pointsData;
					},

					children: ($$anchor, $$slotProps) => {
						SymbolLayer($$anchor, { layout: { 'icon-image': ['get', 'image'] } });
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	var node_5 = $.sibling(node, 2);

	CodeSample(node_5, {
		get code() {
			return code;
		}
	});

	$.bind_select_value(select, () => $.get(selected), ($$value) => $.set(selected, $$value));
	$.bind_select_value(select_1, () => $.get(dataOption), ($$value) => $.set(dataOption, $$value));
	$.append($$anchor, fragment);
	$.pop();
}