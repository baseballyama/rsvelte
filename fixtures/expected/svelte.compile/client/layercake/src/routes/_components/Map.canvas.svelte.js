import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Canvas } from 'layercake';
import { feature } from 'topojson-client';
import { geoAlbersUsa } from 'd3-geo';
import MapCanvas from '../../_components/Map.canvas.svelte';
import usStates from '../../_data/us-states.topojson.json';

var root = $.from_html(`<div class="chart-container svelte-fglxwc"><!></div>`);

export default function Map_canvas($$anchor, $$props) {
	$.push($$props, true);

	// For a map example with a tooltip, check out https://layercake.graphics/example/MapSvg
	// This example loads json data as json using @rollup/plugin-json
	const geojson = feature(usStates, usStates.objects.collection);

	const projection = geoAlbersUsa;
	var div = root();
	var node = $.child(div);

	LayerCake(node, {
		padding: { top: 10 },
		get data() {
			return geojson;
		},

		children: ($$anchor, $$slotProps) => {
			Canvas($$anchor, {
				children: ($$anchor, $$slotProps) => {
					MapCanvas($$anchor, {
						get projection() {
							return projection;
						},
						fill: '#fff'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}