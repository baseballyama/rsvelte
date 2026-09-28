import * as $ from 'svelte/internal/server';
import { LayerCake, Html } from 'layercake';
import { feature } from 'topojson-client';
import { geoAlbersUsa } from 'd3-geo';
import MapLabelsHtml from '../../_components/MapLabels.html.svelte';
import usStates from '../../_data/us-states.topojson.json';
import usStateLabels from '../../_data/us-states-labels.json';

export default function MapLabels_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/*, Svg */
		// This example loads json data as json using @rollup/plugin-json
		const geojson = feature(usStates, usStates.objects.collection);

		const projection = geoAlbersUsa;
		const hideList = ['CT', 'DC', 'DE', 'MA', 'MD', 'NH', 'NJ', 'RI', 'WV'];

		$$renderer.push(`<div class="chart-container svelte-19hr3os">`);

		LayerCake($$renderer, {
			padding: { top: 10 },
			data: geojson,
			children: ($$renderer) => {
				Html($$renderer, {
					children: ($$renderer) => {
						MapLabelsHtml($$renderer, {
							projection,
							features: usStateLabels.filter((d) => !hideList.includes(d.abbr)),
							getLabel: (d) => d.abbr,
							getCoordinates: (d) => d.center
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}