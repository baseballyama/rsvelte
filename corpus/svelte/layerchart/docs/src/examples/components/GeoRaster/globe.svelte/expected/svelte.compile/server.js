import * as $ from 'svelte/internal/server';
import { geoOrthographic } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, GeoRaster, Graticule } from 'layerchart/geo';
import { getCountriesTopology } from '$lib/geo.remote.js';

const topology = await getCountriesTopology();

export default function Globe($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = feature(topology, topology.objects.countries);

		// NASA Blue Marble — equirectangular / plate carrée. Served locally from
		// `static/images/` to avoid CORS issues when reading pixel data.
		const imageUrl = '/images/blue-marble.jpg';

		const data = { topology, countries };

		Chart($$renderer, {
			geo: { projection: geoOrthographic, fitGeojson: { type: 'Sphere' } },
			transform: {
				mode: 'projection',
				constrain: ({ scale, translate }) => ({
					scale,
					translate: { x: translate.x, y: Math.max(-90, Math.min(90, translate.y)) }
				})
			},
			padding: { top: 5, bottom: 5, left: 5, right: 5 },
			height: 500,
			children: ($$renderer) => {
				Layer($$renderer, {
					type: 'canvas',
					children: ($$renderer) => {
						GeoRaster($$renderer, { image: imageUrl, interpolate: 'bilinear' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Layer($$renderer, {
					type: 'svg',
					children: ($$renderer) => {
						GeoPath($$renderer, {
							geojson: { type: 'Sphere' },
							class: 'fill-none stroke-surface-content/40'
						});

						$$renderer.push(`<!----> `);
						Graticule($$renderer, { class: 'stroke-surface-content/15' });
						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(countries.features);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let feature = each_array[$$index];

							GeoPath($$renderer, {
								geojson: feature,
								class: 'fill-none stroke-surface-content/40'
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}