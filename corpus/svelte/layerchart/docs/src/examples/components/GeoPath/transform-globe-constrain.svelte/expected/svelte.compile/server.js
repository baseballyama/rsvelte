import * as $ from 'svelte/internal/server';
import { geoOrthographic } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import { getCountriesTopology } from '$lib/geo.remote.js';

const topology = await getCountriesTopology();

export default function Transform_globe_constrain($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = feature(topology, topology.objects.countries);
		const data = { topology, countries };

		Chart($$renderer, {
			geo: { projection: geoOrthographic, fitGeojson: countries },
			transform: {
				mode: 'projection',
				constrain: ({ scale, translate }) => ({
					scale,
					translate: { x: translate.x, y: Math.max(-90, Math.min(90, translate.y)) }
				})
			},
			padding: { top: 5, bottom: 5, left: 5, right: 5 },
			height: 400,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						GeoPath($$renderer, { geojson: { type: 'Sphere' }, class: 'fill-blue-400/20' });
						$$renderer.push(`<!----> `);
						Graticule($$renderer, { class: 'stroke-surface-content/20' });
						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(countries.features);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let feature = each_array[$$index];

							GeoPath($$renderer, {
								geojson: feature,
								class: 'stroke-surface-100/30 fill-surface-content/70'
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}