import * as $ from 'svelte/internal/server';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Rect } from 'layerchart';
import { GeoClipPath, GeoPath, Graticule } from 'layerchart/geo';
import { getUsStatesTopology } from '$lib/geo.remote.js';

const topology = await getUsStatesTopology();

export default function Basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const nation = feature(topology, topology.objects.nation);
		const states = feature(topology, topology.objects.states);

		Chart($$renderer, {
			geo: { projection: geoAlbersUsa, fitGeojson: states },
			height: 400,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						GeoClipPath($$renderer, {
							geojson: nation,
							invert: true,
							children: ($$renderer) => {
								Graticule($$renderer, { class: 'stroke-primary/30' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(states.features);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let feature = each_array[$$index];

							GeoPath($$renderer, {
								geojson: feature,
								class: 'fill-none stroke-surface-content/20'
							});
						}

						$$renderer.push(`<!--]--> `);
						GeoPath($$renderer, { geojson: nation, class: 'fill-none stroke-surface-content' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}