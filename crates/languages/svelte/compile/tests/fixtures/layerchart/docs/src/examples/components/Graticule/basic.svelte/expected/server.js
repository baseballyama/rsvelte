import * as $ from 'svelte/internal/server';

import {
	geoAlbersUsa,
	geoAlbers,
	geoEqualEarth,
	geoEquirectangular,
	geoMercator,
	geoNaturalEarth1,
	geoOrthographic,
	geoStereographic,
	geoGnomonic
} from 'd3-geo';

import { feature } from 'topojson-client';
import { Chart, Layer, Tooltip } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import GraticuleControls from '$lib/components/controls/GraticuleControls.svelte';
import { getCountriesTopology } from '$lib/geo.remote';

const topology = await getCountriesTopology();

export default function Basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
			stepX: 10,
			stepY: 10,
			projection: geoOrthographic,
			rotate: { yaw: 0, pitch: -30, roll: 20 },
			scale: 0
		};

		const projections = [
			{ label: 'Albers', value: geoAlbers },
			{ label: 'Albers USA', value: geoAlbersUsa },
			{ label: 'Equal Earth', value: geoEqualEarth },
			{ label: 'Equirectangular', value: geoEquirectangular },
			{ label: 'Mercator', value: geoMercator },
			{ label: 'Natural Earth', value: geoNaturalEarth1 },
			{ label: 'Orthographic', value: geoOrthographic },
			{ label: 'Stereographic', value: geoStereographic },
			{ label: 'Gnomonic', value: geoGnomonic }
		];

		const geojson = $.derived(() => feature(topology, topology.objects.countries));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			GraticuleControls($$renderer, {
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

			{
				function children($$renderer, { context }) {
					Layer($$renderer, {
						children: ($$renderer) => {
							GeoPath($$renderer, { geojson: { type: 'Sphere' }, class: 'stroke-surface-content' });
							$$renderer.push(`<!----> `);

							Graticule($$renderer, {
								stepX: config.stepX,
								stepY: config.stepY,
								class: 'stroke-surface-content/20 pointer-events-none'
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(context.tooltip.data?.properties.name)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				Chart($$renderer, {
					geo: {
						projection: config.projection,
						fitGeojson: geojson(),
						rotate: config.rotate
					},
					padding: { top: 10, bottom: 10 },
					height: 600,
					children,
					$$slots: { default: true }
				});
			}

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