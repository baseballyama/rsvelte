import * as $ from 'svelte/internal/server';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Text } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import { getUsStatesTopology } from '$lib/geo.remote.js';

const topology = await getUsStatesTopology();

export default function Us_country_map($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const states = feature(topology, topology.objects.states);
		const data = { topology, states };

		Chart($$renderer, {
			geo: { projection: geoAlbersUsa, fitGeojson: states },
			height: 600,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<g class="states"><!--[-->`);

						const each_array = $.ensure_array_like(states.features);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let feature = each_array[$$index];

							GeoPath($$renderer, {
								geojson: feature,
								class: 'fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20'
							});
						}

						$$renderer.push(`<!--]--></g><g class="labels pointer-events-none"><!--[-->`);

						const each_array_1 = $.ensure_array_like(states.features);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let feature = each_array_1[$$index_1];

							{
								function children($$renderer, { geoPath }) {
									const [x, y] = geoPath?.centroid(feature) ?? [];
								}

								GeoPath($$renderer, { geojson: feature, children, $$slots: { default: true } });
							}
						}

						$$renderer.push(`<!--]--></g>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}