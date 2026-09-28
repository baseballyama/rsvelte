import * as $ from 'svelte/internal/server';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoLegend, GeoPath } from 'layerchart/geo';
import { getUsCountiesTopology } from '$lib/geo.remote';

const topology = await getUsCountiesTopology();

export default function Stacked_units($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const states = feature(topology, topology.objects.states);

		Chart($$renderer, {
			geo: { projection: geoAlbersUsa, fitGeojson: states },
			transform: { mode: 'projection', scrollMode: 'scale' },
			padding: { bottom: 80 },
			height: 500,
			clip: true,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						GeoPath($$renderer, {
							geojson: states,
							class: 'fill-surface-100 stroke-surface-content'
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="absolute bottom-0 left-0 m-2 flex flex-col">`);
				GeoLegend($$renderer, { units: 'km', labelPlacement: 'top' });
				$$renderer.push(`<!----> `);
				GeoLegend($$renderer, { units: 'mi' });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	});
}