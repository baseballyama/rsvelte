import * as $ from 'svelte/internal/server';

import {
	geoEqualEarth,
	geoEquirectangular,
	geoMercator,
	geoNaturalEarth1,
	geoOrthographic,
	geoStereographic
} from 'd3-geo';

import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, GeoRaster, Graticule } from 'layerchart/geo';
import { SelectField } from 'svelte-ux';
import { getCountriesTopology } from '$lib/geo.remote.js';

const topology = await getCountriesTopology();

export default function Projections($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = feature(topology, topology.objects.countries);

		const projections = [
			{ label: 'Natural Earth', value: geoNaturalEarth1 },
			{ label: 'Equal Earth', value: geoEqualEarth },
			{ label: 'Equirectangular', value: geoEquirectangular },
			{ label: 'Mercator', value: geoMercator },
			{ label: 'Stereographic', value: geoStereographic },
			{ label: 'Orthographic', value: geoOrthographic }
		];

		let projection = projections[0].value;
		const data = { topology, countries };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="mb-4 screenshot-hidden">`);

			SelectField($$renderer, {
				label: 'Projection',
				options: projections,
				clearable: false,
				toggleIcon: null,
				stepper: true,
				get value() {
					return projection;
				},

				set value($$value) {
					projection = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				geo: { projection, fitGeojson: { type: 'Sphere' } },
				padding: { top: 10, bottom: 10, left: 10, right: 10 },
				height: 500,
				children: ($$renderer) => {
					Layer($$renderer, {
						type: 'canvas',
						children: ($$renderer) => {
							GeoRaster($$renderer, { image: '/images/blue-marble.jpg', interpolate: 'bilinear' });
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

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}