import * as $ from 'svelte/internal/server';
import { geoOrthographic } from 'd3-geo';
import { scaleSqrt } from 'd3-scale';
import { Chart, Layer, Tooltip } from 'layerchart';
import { GeoCircle, GeoPath, Graticule } from 'layerchart/geo';
import { feature } from 'topojson-client';
import EarthquakeControls from '$lib/components/controls/GeoCircleEarthquakeControls.svelte';
import { TimerState } from '@layerstack/svelte-state';
import { getTectonicPlates, getEarthquakes, getCountriesTopology } from '$lib/geo.remote.js';

const topology = await getCountriesTopology();
const tectonicPlates = await getTectonicPlates();
const earthquakes = await getEarthquakes();

export default function Earthquake_globe($$renderer, $$props) {
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

		const data = { countries, tectonicPlates, earthquakes };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			EarthquakeControls($$renderer, {
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
					Layer($$renderer, {
						disableHitCanvas: timer.running,
						children: ($$renderer) => {
							GeoPath($$renderer, { geojson: { type: 'Sphere' }, class: 'fill-blue-400/50' });
							$$renderer.push(`<!----> `);
							Graticule($$renderer, { class: 'stroke-surface-content/20' });
							$$renderer.push(`<!----> `);

							GeoPath($$renderer, {
								geojson: countries,
								class: 'stroke-surface-100/30 fill-surface-content'
							});

							$$renderer.push(`<!----> `);
							GeoPath($$renderer, { geojson: tectonicPlates, class: 'stroke-danger-100/30' });
							$$renderer.push(`<!----> <!--[-->`);

							const each_array = $.ensure_array_like(earthquakes);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let eq = each_array[$$index];

								GeoCircle($$renderer, {
									center: [eq.longitude, eq.latitude],
									radius: context.rScale(Math.exp(eq.magnitude)),
									class: 'stroke-danger fill-danger/20',
									onpointermove: (e) => context.tooltip.show(e, eq),
									onpointerleave: () => context.tooltip.hide()
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { data }) {
							if (Tooltip.Header) {
								$$renderer.push('<!--[-->');

								Tooltip.Header($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(data.place)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tooltip.List) {
								$$renderer.push('<!--[-->');

								Tooltip.List($$renderer, {
									children: ($$renderer) => {
										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'Latitude', value: data.latitude, format: 'decimal' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'Longitude', value: data.longitude, format: 'decimal' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'Magnitude', value: data.magnitude, format: 'decimal' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						if (Tooltip.Root) {
							$$renderer.push('<!--[-->');
							Tooltip.Root($$renderer, { context, children, $$slots: { default: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				}

				Chart($$renderer, {
					data: earthquakes,
					x: 'longitude',
					y: 'latitude',
					r: 'magnitude',
					rScale: scaleSqrt(),
					rDomain: [0, 100],
					rRange: [0, 1],
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