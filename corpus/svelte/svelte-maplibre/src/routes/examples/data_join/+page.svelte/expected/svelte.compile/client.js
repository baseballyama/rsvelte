import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapLibre from '$lib/MapLibre.svelte';
import VectorTileSource from '$lib/VectorTileSource.svelte';
import { mapClasses } from '../styles.js';
import code from './+page.svelte?raw';
import CodeSample from '$site/CodeSample.svelte';
import FillLayer from '$lib/FillLayer.svelte';
import JoinedData from '$lib/JoinedData.svelte';
import { hoverStateFilter } from '$lib';

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(
	`<p>This map shows how to join data to a vector tile layer on the map. The <code>JoinedData</code> component takes an array of records and joins them using the provided <code>idCol</code> to the
  source at run time. These can then be accessed in styling using the <code>['feature-state', colName]</code> syntax. <br/> This should work on PMTiles, MVT and GeoJSON sources. <br/> Ensure that you use <code>promoteId</code> to indicated which column to use to get the id of the
  feature in the source that you are trying to target, and provide a <code>sourceLayer</code> if you are
  trying to join to PMTiles or MVT tiles.</p> <button class="rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100" type="button">Change Data</button> <p> </p> <!> <!>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let dataSet = $.state(0);

	function changeData() {
		if ($.get(dataSet) === 0) {
			$.set(dataSet, 1);
		} else {
			$.set(dataSet, 0);
		}
	}

	var fragment = root_1();
	var button = $.sibling($.first_child(fragment), 2);
	var p = $.sibling(button, 2);
	var text = $.only_child(p);
	var node = $.sibling(p, 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		get class() {
			return mapClasses;
		},
		standardControls: true,
		center: [-87.622088, 41.778781],
		zoom: 10,
		children: ($$anchor, $$slotProps) => {
			VectorTileSource($$anchor, {
				url: 'pmtiles://https://r2-public.protomaps.com/protomaps-sample-datasets/cb_2018_us_zcta510_500k.pmtiles',
				promoteId: 'GEOID10',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => ({
							'fill-opacity': hoverStateFilter(0.7, 0.4),
							'fill-color': ['coalesce', ['feature-state', 'color'], '#102020']
						}));

						FillLayer(node_1, {
							get paint() {
								return $.get($0);
							},
							sourceLayer: 'zcta',
							manageHoverState: true
						});
					}

					var node_2 = $.sibling(node_1, 2);

					{
						let $0 = $.derived(() => $.get(dataSet) === 0
							? [
								{ color: '#ff0000', geoid: 60628 },
								{ color: '#00fF00', geoid: 60608 }
							]
							: [{ color: '#ff0000', geoid: 60628 }]);

						JoinedData(node_2, {
							get data() {
								return $.get($0);
							},
							idCol: 'geoid',
							sourceLayer: 'zcta'
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

	$.template_effect(() => $.set_text(text, `Showing data set ${$.get(dataSet) ?? ''}`));
	$.delegated('click', button, changeData);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);