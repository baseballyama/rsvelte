import * as $ from 'svelte/internal/server';
import { geoMercator, geoOrthographic } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, GeoRaster, Graticule } from 'layerchart/geo';
import { RangeField } from 'svelte-ux';
import GeoTileControls from '$lib/components/controls/GeoTileControls.svelte';
import { getCountriesTopology } from '$lib/geo.remote.js';

const topology = await getCountriesTopology();

export default function Tiles_globe($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = feature(topology, topology.objects.countries);
		const TILE_SIZE = 256;
		let serviceUrl = (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
		let doubleScale = false;
		let zoom = 2;

		// Stitched Web Mercator mosaic: one canvas covering the full world at the
		// selected zoom level. Re-fetched whenever `serviceUrl` or `zoom` changes.
		let mosaic = null;

		// 2^z tiles per side
		// Source projection for the mosaic: Web Mercator sized to exactly match the
		// stitched canvas dimensions. Re-created when `zoom` changes.
		const sourceProjection = $.derived(() => () => {
			const size = (1 << zoom) * TILE_SIZE;

			return geoMercator().scale(size / (2 * Math.PI)).translate([size / 2, size / 2]).precision(0);
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[1fr_auto] gap-3 items-end mb-2">`);

			GeoTileControls($$renderer, {
				get serviceUrl() {
					return serviceUrl;
				},

				set serviceUrl($$value) {
					serviceUrl = $$value;
					$$settled = false;
				},

				get doubleScale() {
					return doubleScale;
				},

				set doubleScale($$value) {
					doubleScale = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Zoom',
				min: 0,
				max: 4,
				step: 1,
				get value() {
					return zoom;
				},

				set value($$value) {
					zoom = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				geo: { projection: geoOrthographic, fitGeojson: { type: 'Sphere' } },
				transform: {
					mode: 'projection',
					constrain: ({ scale, translate }) => ({
						scale,
						translate: { x: translate.x, y: Math.max(-90, Math.min(90, translate.y)) }
					})
				},
				padding: { top: 10, bottom: 10, left: 10, right: 10 },
				height: 500,
				children: ($$renderer) => {
					Layer($$renderer, {
						type: 'canvas',
						children: ($$renderer) => {
							if (mosaic) {
								$$renderer.push('<!--[0-->');

								GeoRaster($$renderer, {
									image: mosaic,
									sourceProjection: sourceProjection(),
									interpolate: 'bilinear'
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
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
									class: 'fill-none stroke-surface-content/30'
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
	});
}