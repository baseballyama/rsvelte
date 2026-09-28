import * as $ from 'svelte/internal/server';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoLegend, GeoPath } from 'layerchart/geo';
import { getUsCountiesTopology } from '$lib/geo.remote';

const topology = await getUsCountiesTopology();

export default function Variants($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const states = feature(topology, topology.objects.states);

		$$renderer.push(`<div class="grid gap-6"><!--[-->`);

		const each_array = $.ensure_array_like(['bracket', 'alternating']);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let variant = each_array[$$index];

			$$renderer.push(`<div><div class="text-sm font-semibold mb-1">${$.escape(variant)}</div> `);

			Chart($$renderer, {
				geo: { projection: geoAlbersUsa, fitGeojson: states },
				height: 300,
				padding: { bottom: 60 },
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

					$$renderer.push(`<!----> `);
					GeoLegend($$renderer, { variant, units: 'mi', placement: 'bottom-left', class: 'm-2' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}