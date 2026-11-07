import * as $ from 'svelte/internal/server';
import { Chart, Layer, defaultChartPadding } from 'layerchart';
import { GeoCircle, GeoPath, Graticule } from 'layerchart/geo';

import {
	geoAlbersUsa,
	geoAlbers,
	geoEqualEarth,
	geoEquirectangular,
	geoMercator,
	geoNaturalEarth1,
	geoOrthographic
} from 'd3-geo';

import { range } from 'd3-array';
import { feature } from 'topojson-client';
import GeoCircleControls from '$lib/components/controls/GeoCirclePlaygroundControls.svelte';
import { getCountriesTopology } from '$lib/geo.remote';

const topology = await getCountriesTopology();

export default function Playground($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
			example: 'single',
			latitude: 0,
			longitude: 0,
			radius: 600,
			precision: 6,
			projection: geoNaturalEarth1
		};

		const projections = [
			{ label: 'Albers', value: geoAlbers },
			{ label: 'Albers USA', value: geoAlbersUsa },
			{ label: 'Equal Earth', value: geoEqualEarth },
			{ label: 'Equirectangular', value: geoEquirectangular },
			{ label: 'Mercator', value: geoMercator },
			{ label: 'Natural Earth', value: geoNaturalEarth1 },
			{ label: 'Orthographic', value: geoOrthographic }
		];

		const geojson = $.derived(() => feature(topology, topology.objects.countries));

		const features = $.derived(() => config.projection === geoAlbersUsa
			? geojson().features.filter((f) => f.properties.name === 'United States of America')
			: geojson().features);

		const step = 10;

		const coordinates = range(-80, 80 + step, step).flatMap((y) => {
			return range(-180, 180 + step, step).map((x) => {
				return [x, y];
			});
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			GeoCircleControls($$renderer, {
				projections,
				get config() {
					return config;
				},

				set config($$value) {
					config = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				geo: { projection: config.projection, fitGeojson: geojson() },
				padding: defaultChartPadding({ left: 10, right: 10 }),
				height: 600,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							GeoPath($$renderer, {
								geojson: { type: 'Sphere' },
								class: 'stroke-surface-content/30',
								id: 'globe'
							});

							$$renderer.push(`<!----> `);
							Graticule($$renderer, { class: 'stroke-surface-content/20' });
							$$renderer.push(`<!----> <!--[-->`);

							const each_array = $.ensure_array_like(features());

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let feature = each_array[$$index];

								GeoPath($$renderer, {
									geojson: feature,
									class: 'stroke-surface-content/30 fill-surface-content/20 pointer-events-none'
								});
							}

							$$renderer.push(`<!--]--> `);

							if (config.example === 'single') {
								$$renderer.push('<!--[0-->');

								GeoCircle($$renderer, {
									center: [config.longitude, config.latitude],
									radius: config.radius / (6371 * Math.PI * 2) * 360,
									precision: config.precision,
									class: 'fill-danger stroke-none'
								});
							} else if (config.example === 'multi') {
								$$renderer.push(`<!--[1--><!--[-->`);

								const each_array_1 = $.ensure_array_like(coordinates);

								for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
									let coords = each_array_1[$$index_1];

									GeoCircle($$renderer, {
										center: [coords[0], coords[1]],
										radius: step / 4,
										precision: config.precision,
										class: 'stroke-danger'
									});
								}

								$$renderer.push(`<!--]-->`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
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
	});
}