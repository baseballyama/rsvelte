import * as $ from 'svelte/internal/server';
import { geoNaturalEarth1 } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoLegend, GeoPath } from 'layerchart/geo';
import { getCountriesTopology } from '$lib/geo.remote.js';

const topology = await getCountriesTopology();

export default function Tick_format($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = feature(topology, topology.objects.countries);

		Chart($$renderer, {
			geo: { projection: geoNaturalEarth1, fitGeojson: countries },
			transform: { mode: 'projection', scrollMode: 'scale' },
			padding: { bottom: 60 },
			height: 500,
			clip: true,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						GeoPath($$renderer, {
							geojson: countries,
							class: 'fill-surface-100 stroke-surface-content'
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				GeoLegend($$renderer, {
					units: 'km',
					tickFormat: 'metric',
					placement: 'bottom-left',
					class: 'm-2'
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}