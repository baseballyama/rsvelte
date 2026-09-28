import * as $ from 'svelte/internal/server';
import { geoOrthographic } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoEdgeFade, GeoPath, GeoPoint, GeoSpline, Graticule } from 'layerchart/geo';
import { getWorldLinks, getCountriesTopology } from '$lib/geo.remote.js';

const topology = await getCountriesTopology();
const worldLinks = await getWorldLinks();

export default function Draggable_globe($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = feature(topology, topology.objects.countries);
		const data = { countries, worldLinks };

		Chart($$renderer, {
			geo: { projection: geoOrthographic, fitGeojson: countries },
			transform: { mode: 'projection' },
			padding: { top: 80, bottom: 80, left: 80, right: 80 },
			height: 800,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						GeoPath($$renderer, { geojson: { type: 'Sphere' }, class: 'fill-blue-400/50' });
						$$renderer.push(`<!----> `);
						Graticule($$renderer, { class: 'stroke-surface-content/20 pointer-events-none' });
						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(countries.features);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let country = each_array[$$index];

							GeoPath($$renderer, {
								geojson: country,
								class: 'stroke-surface-content/50 fill-white pointer-events-none'
							});
						}

						$$renderer.push(`<!--]--> <!--[-->`);

						const each_array_1 = $.ensure_array_like(worldLinks);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let link = each_array_1[$$index_1];

							GeoEdgeFade($$renderer, {
								link,
								children: ($$renderer) => {
									GeoPoint($$renderer, {
										lat: link.source[1],
										long: link.source[0],
										r: 2,
										class: 'fill-black'
									});

									$$renderer.push(`<!----> `);

									GeoPoint($$renderer, {
										lat: link.target[1],
										long: link.target[0],
										r: 2,
										class: 'fill-black'
									});

									$$renderer.push(`<!----> `);
									GeoSpline($$renderer, { link, class: 'stroke-gray-500/30 stroke-2' });
									$$renderer.push(`<!----> `);
									GeoSpline($$renderer, { link, class: 'stroke-danger stroke-2', loft: 1.3 });
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
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