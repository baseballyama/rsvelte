import * as $ from 'svelte/internal/server';
import { geoOrthographic } from 'd3-geo';
import { feature } from 'topojson-client';
import { cls } from '@layerstack/tailwind';
import { TimerState } from '@layerstack/svelte-state';
import { Chart, Layer, Tooltip } from 'layerchart';
import { GeoPath, GeoPoint, GeoVisible, Graticule } from 'layerchart/geo';
import GeoPathSubmarineControls from '$lib/components/controls/GeoPathSubmarineControls.svelte';

import {
	getCountriesTopology,
	getSubmarineCables,
	getSubmarineCablesLandingPoints
} from '$lib/geo.remote.js';

const topology = await getCountriesTopology();
const cables = await getSubmarineCables();
const landingPoints = await getSubmarineCablesLandingPoints();

export default function Submarine_cables_globe($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = feature(topology, topology.objects.countries);
		let context = void 0;
		let velocity = 3;

		const timer = new TimerState({
			delay: 1,
			tick: () => {
				if (!context) return;

				const value = context.transform.translate;

				context.transform.translate = { x: value.x += velocity, y: value.y };
			},
			disabled: true
		});

		const data = { countries, cables, landingPoints };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			GeoPathSubmarineControls($$renderer, {
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
							GeoPath($$renderer, {
								geojson: { type: 'Sphere' },
								class: 'fill-surface-200 stroke-surface-content/20'
							});

							$$renderer.push(`<!----> `);
							Graticule($$renderer, { class: 'stroke-surface-content/20' });
							$$renderer.push(`<!----> `);

							GeoPath($$renderer, {
								geojson: countries,
								class: 'stroke-surface-100/30 fill-surface-content'
							});

							$$renderer.push(`<!----> <!--[-->`);

							const each_array = $.ensure_array_like(cables.features);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let feature = each_array[$$index];
								const hasColor = context.tooltip.data == null || context.tooltip.data.id === feature.properties.id;

								GeoPath($$renderer, {
									geojson: feature,
									stroke: hasColor ? feature.properties.color : undefined,
									class: cls('stroke-2 fill-none transition-colors', !hasColor && 'stroke-surface-content/10'),
									onpointermove: (e) => context.tooltip.show(e, feature.properties),
									onpointerleave: (e) => context.tooltip.hide()
								});
							}

							$$renderer.push(`<!--]--> <!--[-->`);

							const each_array_1 = $.ensure_array_like(landingPoints.features);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let feature = each_array_1[$$index_1];
								const [long, lat] = feature.geometry.coordinates;

								GeoVisible($$renderer, {
									lat,
									long,
									children: ($$renderer) => {
										GeoPoint($$renderer, {
											lat,
											long,
											r: 2,
											class: 'fill-surface-content stroke-surface-100 stroke',
											onpointermove: (e) => context.tooltip.show(e, feature.properties),
											onpointerleave: (e) => context.tooltip.hide()
										});
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { data }) {
							$$renderer.push(`<!---->${$.escape(data.name)}`);
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