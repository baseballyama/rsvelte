import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Html } from 'layercake';
import { feature } from 'topojson-client';
import { geoAlbersUsa, geoCentroid } from 'd3-geo';
import MapPointsHtml from '../../_components/MapPoints.html.svelte';
import usStates from '../../_data/us-states.topojson.json';

var root = $.from_html(`<div class="chart-container svelte-1kbg7r8"><!></div>`);

export default function MapPoints_html($$anchor, $$props) {
	$.push($$props, true);

	// This example loads json data as json using @rollup/plugin-json
	const geojson = feature(usStates, usStates.objects.collection);

	const projection = geoAlbersUsa;

	const features = geojson.features.map((d) => {
		return {
			properties: d.properties,
			geometry: { coordinates: geoCentroid(d) }
		};
	});

	var div = root();
	var node = $.child(div);

	LayerCake(node, {
		padding: { top: 10 },
		get data() {
			return geojson;
		},

		children: ($$anchor, $$slotProps) => {
			Html($$anchor, {
				children: ($$anchor, $$slotProps) => {
					MapPointsHtml($$anchor, {
						get projection() {
							return projection;
						},

						get features() {
							return features;
						}
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