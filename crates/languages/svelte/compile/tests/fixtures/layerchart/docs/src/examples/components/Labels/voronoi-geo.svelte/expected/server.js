import * as $ from 'svelte/internal/server';

import {
	geoEqualEarth,
	geoEquirectangular,
	geoMercator,
	geoNaturalEarth1
} from 'd3-geo';

import { feature } from 'topojson-client';
import { Field, RangeField, SelectField, Switch } from 'svelte-ux';
import { Chart, Labels, Layer, Points } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import { getCountriesTopology, getWorldAirports } from '$lib/geo.remote';

const [topology, allAirports] = await Promise.all([getCountriesTopology(), getWorldAirports()]);
const airports = allAirports.filter((_, i) => i % 20 === 0);

export default function Voronoi_geo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = feature(topology, topology.objects.countries);

		const projections = [
			{ label: 'Equirectangular', value: geoEquirectangular },
			{ label: 'Natural Earth', value: geoNaturalEarth1 },
			{ label: 'Equal Earth', value: geoEqualEarth },
			{ label: 'Mercator', value: geoMercator }
		];

		const linkTypeOptions = [
			{ label: 'Straight', value: 'straight' },
			{ label: 'Swoop', value: 'swoop' },
			{ label: 'Rounded', value: 'rounded' },
			{ label: 'Square', value: 'square' },
			{ label: 'Beveled', value: 'beveled' }
		];

		let projection = geoNaturalEarth1;
		let linkType = 'straight';
		let useLinks = true;
		let occludeLabels = true;
		let spacing = 3;
		const data = airports;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-wrap items-center gap-4 mb-2 screenshot-hidden">`);

			SelectField($$renderer, {
				label: 'Projection',
				options: projections,
				clearable: false,
				toggleIcon: null,
				stepper: true,
				class: 'w-60',
				get value() {
					return projection;
				},

				set value($$value) {
					projection = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			SelectField($$renderer, {
				label: 'Links',
				options: linkTypeOptions,
				clearable: false,
				toggleIcon: null,
				stepper: true,
				class: 'w-60',
				get value() {
					return linkType;
				},

				set value($$value) {
					linkType = $$value;
					$$settled = false;
				},

				$$slots: {
					append: ($$renderer) => {
						$$renderer.push(`<div slot="append" class="flex items-center pl-2" role="none">`);

						Switch($$renderer, {
							size: 'md',
							get checked() {
								return useLinks;
							},

							set checked($$value) {
								useLinks = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div>`);
					}
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Occlude',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						$$renderer.push(`<div class="flex items-center gap-2 w-60">`);

						RangeField($$renderer, {
							min: 0,
							max: 12,
							disabled: !occludeLabels,
							class: 'flex-1',
							get value() {
								return spacing;
							},

							set value($$value) {
								spacing = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Switch($$renderer, {
							size: 'md',
							id,
							get checked() {
								return occludeLabels;
							},

							set checked($$value) {
								occludeLabels = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div>`);
					}
				}
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				data,
				x: 'longitude',
				y: 'latitude',
				geo: { projection, fitGeojson: { type: 'Sphere' } },
				height: 500,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							GeoPath($$renderer, {
								geojson: { type: 'Sphere' },
								class: 'fill-surface-100 stroke-surface-content/20'
							});

							$$renderer.push(`<!----> <!--[-->`);

							const each_array = $.ensure_array_like(countries.features);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let country = each_array[$$index];

								GeoPath($$renderer, {
									geojson: country,
									class: 'fill-surface-content/10 stroke-surface-100'
								});
							}

							$$renderer.push(`<!--]--> `);
							Points($$renderer, { r: 1.5, class: 'fill-surface-content' });
							$$renderer.push(`<!----> `);

							Labels($$renderer, {
								value: (d) => d.name.split(' ')[0],
								layout: 'voronoi',
								links: useLinks
									? { type: linkType, class: 'stroke-surface-content/40' }
									: false,
								occlude: occludeLabels ? { padding: spacing } : false,
								fontSize: 9,
								class: 'fill-surface-content stroke-surface-100 stroke-[3px] [paint-order:stroke] pointer-events-none'
							});

							$$renderer.push(`<!---->`);
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
		$.bind_props($$props, { data });
	});
}