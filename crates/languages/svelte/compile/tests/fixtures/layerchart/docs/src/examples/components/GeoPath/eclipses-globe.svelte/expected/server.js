import * as $ from 'svelte/internal/server';
import { geoOrthographic } from 'd3-geo';
import { extent } from 'd3-array';
import { scaleDiverging } from 'd3-scale';
import { interpolateGreens, interpolatePurples } from 'd3-scale-chromatic';
import { feature } from 'topojson-client';
import { Chart, Legend, Layer, Tooltip } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import GeoPathEclipsesControls from '$lib/components/controls/GeoPathGlobeControls2.svelte';
import { format } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import { TimerState } from '@layerstack/svelte-state';
import { getCountriesTopology, getEclipses } from '$lib/geo.remote.js';

const topology = await getCountriesTopology();
const eclipsesData = await getEclipses();

export default function Eclipses_globe($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// 'https://www.visionscarto.net/empreintes-d-eclipses',
		// 'http://xjubier.free.fr/en/site_pages/Solar_Eclipses.html',
		// 'https://stanke.co/creating-orthographic-maps-in-tableau/',
		// 'https://www.washingtonpost.com/graphics/national/eclipse/'
		const countries = feature(topology, topology.objects.countries);

		const eclipses = feature(eclipsesData, eclipsesData.objects.eclipses);
		let context = null;
		let velocity = 3;

		const timer = new TimerState({
			delay: 1,
			tick: () => {
				const value = context.transform.translate;

				context.transform.translate = { x: value.x += velocity, y: value.y };
			},
			disabled: true
		});

		const dateExtents = $.derived(() => extent(eclipses.features.map((f) => f.properties.Date)));
		const colorScale = $.derived(() => scaleDiverging([dateExtents()[0] ?? 0, new Date(), dateExtents()[1] ?? 0], (t) => t < 0.5 ? interpolatePurples(1 - t) : interpolateGreens(t)));
		const data = { countries, eclipses };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			GeoPathEclipsesControls($$renderer, {
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
					Legend($$renderer, {
						scale: colorScale(),
						title: 'Eclipse date',
						tickFormat: 'year'
					});

					$$renderer.push(`<!----> `);

					Layer($$renderer, {
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

							const each_array = $.ensure_array_like(eclipses.features);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let feature = each_array[$$index];
								const hasColor = context.tooltip.data == null || context.tooltip.data.ID === feature.properties.ID;

								GeoPath($$renderer, {
									geojson: feature,
									fill: hasColor ? colorScale()(feature.properties.Date) : undefined,
									stroke: 'none',
									class: cls('transition-colors', !hasColor && 'fill-surface-content/10'),
									onpointermove: (e) => context.tooltip.show(e, feature.properties),
									onpointerleave: (e) => context.tooltip.hide()
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { data }) {
							$$renderer.push(`<!---->${$.escape(format(data.Date, 'day', { variant: 'long' }))}`);
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
					padding: { top: 60 },
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