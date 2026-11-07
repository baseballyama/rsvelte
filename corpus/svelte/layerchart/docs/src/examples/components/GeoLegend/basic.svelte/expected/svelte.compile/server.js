import * as $ from 'svelte/internal/server';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoLegend, GeoPath } from 'layerchart/geo';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import { getUsCountiesTopology } from '$lib/geo.remote';

const topology = await getUsCountiesTopology();

export default function Basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const states = feature(topology, topology.objects.states);

		Chart($$renderer, {
			geo: { projection: geoAlbersUsa, fitGeojson: states },
			transform: { mode: 'projection', scrollMode: 'scale' },
			padding: { bottom: 60 },
			height: 500,
			clip: true,
			children: ($$renderer) => {
				TransformContextControls($$renderer, {});
				$$renderer.push(`<!----> `);

				Layer($$renderer, {
					children: ($$renderer) => {
						GeoPath($$renderer, {
							geojson: states,
							class: 'fill-surface-100 stroke-surface-content'
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				GeoLegend($$renderer, {
					title: 'Miles',
					units: 'mi',
					placement: 'bottom-left',
					class: 'm-2'
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}