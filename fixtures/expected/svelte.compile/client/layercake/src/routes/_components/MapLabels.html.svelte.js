import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Html } from 'layercake';
import { feature } from 'topojson-client';
import { geoAlbersUsa } from 'd3-geo';
import MapLabelsHtml from '../../_components/MapLabels.html.svelte';
import usStates from '../../_data/us-states.topojson.json';
import usStateLabels from '../../_data/us-states-labels.json';

var root = $.from_html(`<div class="chart-container svelte-19hr3os"><!></div>`);

export default function MapLabels_html($$anchor, $$props) {
	$.push($$props, true);

	/*, Svg */
	// This example loads json data as json using @rollup/plugin-json
	const geojson = feature(usStates, usStates.objects.collection);

	const projection = geoAlbersUsa;
	const hideList = ['CT', 'DC', 'DE', 'MA', 'MD', 'NH', 'NJ', 'RI', 'WV'];
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
					{
						let $0 = $.derived(() => usStateLabels.filter((d) => !hideList.includes(d.abbr)));

						MapLabelsHtml($$anchor, {
							get projection() {
								return projection;
							},

							get features() {
								return $.get($0);
							},
							getLabel: (d) => d.abbr,
							getCoordinates: (d) => d.center
						});
					}
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