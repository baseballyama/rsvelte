import * as $ from 'svelte/internal/server';
import { geoOrthographic } from 'd3-geo';
import { feature } from 'topojson-client';
import { Chart, Layer, Tooltip } from 'layerchart';
import { GeoProjection, GeoPath, Graticule } from 'layerchart/geo';
import GeoPathTranslucentControls from '$lib/components/controls/GeoPathGlobeControls2.svelte';
import { TimerState } from '@layerstack/svelte-state';
import { getCountriesTopology } from '$lib/geo.remote.js';

const topology = await getCountriesTopology();

export default function Translucent_globe($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = feature(topology, topology.objects.countries);
		let context = void 0;
		let velocity = 3;

		const timer = new TimerState({
			delay: 1,
			tick: () => {
				if (!context) return;

				const curr = context.transform.translate;

				context.transform.translate = { x: curr.x += velocity, y: curr.y };
			},
			disabled: true
		});

		const data = { topology, countries };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			GeoPathTranslucentControls($$renderer, {
				timer,
				get velocity() {
					return velocity;
				},

				set velocity($$value) {
					velocity = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { context }) {
					const [yaw, pitch, roll] = context.geo.projection?.rotate() ?? [0, 0, 0];

					Layer($$renderer, {
						children: ($$renderer) => {
							GeoPath($$renderer, { geojson: { type: 'Sphere' }, class: 'fill-blue-400/20' });
							$$renderer.push(`<!----> `);

							GeoProjection($$renderer, {
								projection: geoOrthographic,
								fitGeojson: countries,
								rotate: { yaw: yaw + 180, pitch: -pitch, roll: -roll },
								reflectX: true,
								children: ($$renderer) => {
									Graticule($$renderer, { class: 'stroke-surface-content/5' });
									$$renderer.push(`<!----> <!--[-->`);

									const each_array = $.ensure_array_like(countries.features);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let country = each_array[$$index];

										GeoPath($$renderer, {
											geojson: country,
											class: 'stroke-surface-content/5 fill-surface-content/10'
										});
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);
							Graticule($$renderer, { class: 'stroke-surface-content/20' });
							$$renderer.push(`<!----> <!--[-->`);

							const each_array_1 = $.ensure_array_like(countries.features);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let country = each_array_1[$$index_1];

								GeoPath($$renderer, {
									geojson: country,
									class: 'stroke-surface-100/30 fill-surface-content/70 cursor-pointer hover:fill-primary/70',
									tooltip: true
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { data }) {
							$$renderer.push(`<!---->${$.escape(data.properties.name)}`);
						}

						if (Tooltip.Root) {
							$$renderer.push('<!--[-->');
							Tooltip.Root($$renderer, { children, $$slots: { default: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				}

				Chart($$renderer, {
					geo: { projection: geoOrthographic, fitGeojson: countries },
					transform: { mode: 'projection' },
					ondragstart: timer.stop,
					padding: { top: 5, bottom: 5, left: 5, right: 5 },
					height: 600,
					get context() {
						return context;
					},

					set context($$value) {
						context = $$value;
						$$settled = false;
					},
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
		$.bind_props($$props, { data });
	});
}