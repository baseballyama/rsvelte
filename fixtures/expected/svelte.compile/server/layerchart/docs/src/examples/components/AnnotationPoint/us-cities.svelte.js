import * as $ from 'svelte/internal/server';
import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import { AnnotationPoint, Chart, Layer } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import { getUsStatesTopology } from '$lib/geo.remote';

const topology = await getUsStatesTopology();

export default function Us_cities($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const states = feature(topology, topology.objects.states);

		const annotations = [
			{
				label: 'Seattle',
				lon: -122.3321,
				lat: 47.6062,
				labelPlacement: 'top-left',
				labelXOffset: 10,
				labelYOffset: 10,
				props: {
					circle: { class: 'fill-secondary stroke-surface-100' },
					label: { class: 'fill-surface-content text-xs font-bold' }
				}
			},

			{
				label: 'Los Angeles',
				lon: -118.2437,
				lat: 34.0522,
				labelPlacement: 'bottom-left',
				labelXOffset: 10,
				labelYOffset: 10,
				props: {
					circle: { class: 'fill-secondary stroke-surface-100' },
					label: { class: 'fill-surface-content text-xs font-bold' }
				}
			},

			{
				label: 'Houston',
				lon: -95.3698,
				lat: 29.7604,
				labelPlacement: 'bottom',
				labelYOffset: 10,
				props: {
					circle: { class: 'fill-secondary stroke-surface-100' },
					label: { class: 'fill-surface-content text-xs font-bold' }
				}
			},

			{
				label: 'Chicago',
				lon: -87.6298,
				lat: 41.8781,
				labelPlacement: 'top',
				labelYOffset: 10,
				props: {
					circle: { class: 'fill-secondary stroke-surface-100' },
					label: { class: 'fill-surface-content text-xs font-bold' }
				}
			},

			{
				label: 'New York',
				lon: -74.006,
				lat: 40.7128,
				labelPlacement: 'bottom-right',
				labelXOffset: 10,
				labelYOffset: 10,
				props: {
					circle: { class: 'fill-secondary stroke-surface-100' },
					label: { class: 'fill-surface-content text-xs font-bold' }
				}
			},

			{
				label: 'Miami',
				lon: -80.1918,
				lat: 25.7617,
				labelPlacement: 'top-right',
				labelXOffset: 10,
				labelYOffset: 10,
				props: {
					circle: { class: 'fill-secondary stroke-surface-100' },
					label: { class: 'fill-surface-content text-xs font-bold' }
				}
			}
		];

		const data = { topology, states };

		Chart($$renderer, {
			geo: { projection: geoAlbersUsa, fitGeojson: states },
			height: 500,
			padding: { right: 40 },
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						GeoPath($$renderer, {
							geojson: states,
							class: 'fill-surface-content/10 stroke-surface-100'
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(annotations);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let annotation = each_array[$$index];

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