import * as $ from 'svelte/internal/server';
import { geoOrthographic } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import { RangeField, Switch, Field } from 'svelte-ux';
import { getCountriesTopology } from '$lib/geo.remote.js';

const topology = await getCountriesTopology();

export default function Transform_globe_inertia($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = feature(topology, topology.objects.countries);
		let decay = 0.99;
		let minVelocity = 0.1;
		let enabled = true;
		const data = { topology, countries };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex gap-3 items-end mb-2 screenshot-hidden">`);

			Field($$renderer, {
				label: 'Enabled',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							size: 'md',
							get checked() {
								return enabled;
							},

							set checked($$value) {
								enabled = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Decay',
				min: 0.9,
				max: 0.999,
				step: 0.001,
				get value() {
					return decay;
				},

				set value($$value) {
					decay = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Min velocity',
				min: 0.01,
				max: 0.5,
				step: 0.01,
				get value() {
					return minVelocity;
				},

				set value($$value) {
					minVelocity = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				geo: { projection: geoOrthographic, fitGeojson: countries },
				transform: {
					mode: 'projection',
					motion: 'spring',
					inertia: enabled ? { decay, minVelocity } : false,
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