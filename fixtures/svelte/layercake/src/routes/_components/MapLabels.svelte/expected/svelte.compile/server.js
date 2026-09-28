import * as $ from 'svelte/internal/server';
import { LayerCake, Svg } from 'layercake';
import { feature } from 'topojson-client';
import { geoAlbersUsa } from 'd3-geo';
import MapLabels from '../../_components/MapLabels.svg.svelte';
import usStates from '../../_data/us-states.topojson.json';
import usStateLabels from '../../_data/us-states-labels.json';

export default function MapLabels_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads json data as json using @rollup/plugin-json
		const geojson = feature(usStates, usStates.objects.collection);

		const projection = geoAlbersUsa;
		const hideList = ['CT', 'DC', 'DE', 'MA', 'MD', 'NH', 'NJ', 'RI', 'WV'];

		$$renderer.push(`<div class="chart-container svelte-bqyd75">`);

		LayerCake($$renderer, {
			padding: { top: 10 },
			data: geojson,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						MapLabels($$renderer, {
							projection,
							features: usStateLabels.filter((d) => !hideList.includes(d.abbr)),
							getCoordinates: (d) => d.center,
							getLabel: (d) => d.abbr
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