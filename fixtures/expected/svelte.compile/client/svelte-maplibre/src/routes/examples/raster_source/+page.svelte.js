import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import RasterTileSource from '$lib/RasterTileSource.svelte';
import RasterLayer from '$lib/RasterLayer.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import LineLayer from '$lib/LineLayer.svelte';

var root = $.from_html(`<p>This map shows how to use raster sources on the map. Data from <a href="https://uk-air.defra.gov.uk/data/wms-services" target="_blank">UK-AIR</a>.</p> <fieldset class="flex gap-x-4"><legend>Pollution layer</legend> <label><input type="radio"/> PM2.5</label> <label><input type="radio"/> PM10</label> <label><input type="radio"/> NO2</label></fieldset> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let pollutant = $.state('PM25_viridis');
	let url = $.derived(() => `https://ukair.maps.rcdo.co.uk/ukairserver/services/aq_amb_2021/${$.get(pollutant)}/MapServer/WMSServer?bbox={bbox-epsg-3857}&request=GetMap&version=1.3.0&format=image%2Fpng&crs=EPSG%3A3857&width=256&height=256&styles=&layers=20`);
	var fragment = root();
	var fieldset = $.sibling($.first_child(fragment), 2);
	var label = $.sibling($.child(fieldset), 2);
	var input = $.child(label);

	$.remove_input_defaults(input);
	input.value = input.__value = 'PM25_viridis';
	$.next();
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'PM10_viridis';
	$.next();
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_2 = $.child(label_2);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 'NOx_viridis';
	$.next();
	$.reset(label_2);
	$.reset(fieldset);

	var node = $.sibling(fieldset, 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		get class() {
			return mapClasses;
		},
		standardControls: true,
		bounds: [-5.96, 49.89, 2.31, 55.94],
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [$.get(url)]);

				RasterTileSource($$anchor, {
					get tiles() {
						return $.get($0);
					},
					tileSize: 256,
					children: ($$anchor, $$slotProps) => {
						RasterLayer($$anchor, { paint: { 'raster-opacity': 0.5 } });
					},
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	CodeSample(node_1, {
		get code() {
			return code;
		}
	});

	$.bind_group(binding_group, [], input, () => $.get(pollutant), ($$value) => $.set(pollutant, $$value));
	$.bind_group(binding_group, [], input_1, () => $.get(pollutant), ($$value) => $.set(pollutant, $$value));
	$.bind_group(binding_group, [], input_2, () => $.get(pollutant), ($$value) => $.set(pollutant, $$value));
	$.append($$anchor, fragment);
	$.pop();
}