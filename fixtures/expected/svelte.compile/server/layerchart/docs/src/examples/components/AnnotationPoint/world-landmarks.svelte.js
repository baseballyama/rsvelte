import * as $ from 'svelte/internal/server';
import { geoNaturalEarth1 } from 'd3-geo';
import { feature } from 'topojson-client';
import { AnnotationPoint, Chart, Layer } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import { getCountriesTopology } from '$lib/geo.remote';

const topology = await getCountriesTopology();

export default function World_landmarks($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = feature(topology, topology.objects.countries);

		const annotations = [
			{
				label: 'Statue of Liberty',
				lon: -74.0445,
				lat: 40.6892,
				labelPlacement: 'left',
				labelXOffset: 10,
				props: {
					circle: { class: 'fill-secondary stroke-surface-100' },
					label: { class: 'fill-surface-content text-xs font-bold' }
				}
			},

			{
				label: 'Machu Picchu',
				lon: -72.545,
				lat: -13.1631,
				labelPlacement: 'bottom-left',
				labelXOffset: 10,
				labelYOffset: 10,
				props: {
					circle: { class: 'fill-secondary stroke-surface-100' },
					label: { class: 'fill-surface-content text-xs font-bold' }
				}
			},

			{
				label: 'Eiffel Tower',
				lon: 2.2945,
				lat: 48.8584,
				labelPlacement: 'top-right',
				labelXOffset: 10,
				labelYOffset: 10,
				props: {
					circle: { class: 'fill-secondary stroke-surface-100' },
					label: { class: 'fill-surface-content text-xs font-bold' }
				}
			},

			{
				label: 'Pyramids of Giza',
				lon: 31.1342,
				lat: 29.9792,
				labelPlacement: 'bottom-left',
				labelXOffset: 10,
				labelYOffset: 10,
				props: {
					circle: { class: 'fill-secondary stroke-surface-100' },
					label: { class: 'fill-surface-content text-xs font-bold' }
				}
			},

			{
				label: 'Mt. Everest',
				lon: 86.925,
				lat: 27.9881,
				labelPlacement: 'top',
				labelYOffset: 10,
				props: {
					circle: { class: 'fill-secondary stroke-surface-100' },
					label: { class: 'fill-surface-content text-xs font-bold' }
				}
			},

			{
				label: 'Great Wall',
				lon: 117.2381,
				lat: 40.3587,
				labelPlacement: 'top-right',
				labelXOffset: 10,
				labelYOffset: 10,
				props: {
					circle: { class: 'fill-secondary stroke-surface-100' },
					label: { class: 'fill-surface-content text-xs font-bold' }
				}
			},

			{
				label: 'Sydney Opera House',
				lon: 151.2153,
				lat: -33.8568,
				labelPlacement: 'bottom',
				labelYOffset: 10,
				props: {
					circle: { class: 'fill-secondary stroke-surface-100' },
					label: { class: 'fill-surface-content text-xs font-bold' }
				}
			}
		];

		const data = { topology, countries };

		Chart($$renderer, {
			geo: { projection: geoNaturalEarth1, fitGeojson: countries },
			height: 500,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(countries.features);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let f = each_array[i];

							GeoPath($$renderer, {
								geojson: f,
								class: 'fill-surface-content/10 stroke-surface-100'
							});
						}

						$$renderer.push(`<!--]--> <!--[-->`);

						const each_array_1 = $.ensure_array_like(annotations);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let annotation = each_array_1[$$index_1];

							AnnotationPoint($$renderer, $.spread_props([
								annotation,
								{ x: annotation.lon, y: annotation.lat, r: 4, link: true }
							]));
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