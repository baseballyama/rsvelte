import * as $ from 'svelte/internal/server';
import { scaleSequential } from 'd3-scale';
import { interpolateYlGnBu } from 'd3-scale-chromatic';
import { geoAlbersUsa } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { Chart, Circle, Density, Layer, Tooltip } from 'layerchart';
import { GeoPath } from 'layerchart/geo';
import TransformControls from '$lib/components/controls/TransformContextControls.svelte';
import { getWalmarts, getUsStatesTopology } from '$lib/geo.remote.js';

const walmarts = await getWalmarts();
const geojson = await getUsStatesTopology();

export default function Walmart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const states = feature(geojson, geojson.objects.states);
		const nation = feature(geojson, geojson.objects.nation);
		const statemesh = mesh(geojson, geojson.objects.states, (a, b) => a !== b);

		{
			function children($$renderer, { context }) {
				TransformControls($$renderer, {});
				$$renderer.push(`<!----> `);

				Layer($$renderer, {
					children: ($$renderer) => {
						Density($$renderer, {
							data: walmarts,
							x: 'longitude',
							y: 'latitude',
							bandwidth: 10,
							fillOpacity: 0.7
						});

						$$renderer.push(`<!----> `);

						GeoPath($$renderer, {
							geojson: statemesh,
							class: 'fill-none stroke-surface-content/30',
							strokeWidth: 0.5 / context.transform.scale
						});

						$$renderer.push(`<!----> `);

						GeoPath($$renderer, {
							geojson: nation,
							class: 'fill-none stroke-surface-content',
							strokeWidth: 1 / context.transform.scale
						});

						$$renderer.push(`<!----> `);

						Circle($$renderer, {
							cx: 'longitude',
							cy: 'latitude',
							r: 1 / context.transform.scale,
							fill: 'currentColor'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Layer($$renderer, {
					children: ($$renderer) => {
						if (context.tooltip.data) {
							$$renderer.push('<!--[0-->');

							Circle($$renderer, {
								data: [context.tooltip.data],
								cx: 'longitude',
								cy: 'latitude',
								r: 4 / context.transform.scale,
								strokeWidth: 1 / context.transform.scale,
								class: 'stroke-surface-content/30 fill-surface-content/10 pointer-events-none',
								motion: 'spring'
							});
						} else {
							$$renderer.push('<!--[-1-->');
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
									$$renderer.push(`<!---->${$.escape(data.city)}, ${$.escape(data.state)}`);
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
										Tooltip.Item($$renderer, { label: 'Type', value: data.type });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Opened', value: data.date, format: 'day' });
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
						Tooltip.Root($$renderer, { children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			Chart($$renderer, {
				data: walmarts,
				x: 'longitude',
				y: 'latitude',
				cScale: scaleSequential(interpolateYlGnBu),
				geo: { projection: geoAlbersUsa, fitGeojson: states },
				transform: { mode: 'canvas', scrollMode: 'scale', motion: 'spring' },
				tooltipContext: { mode: 'quadtree' },
				clip: true,
				height: 500,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data: walmarts });
	});
}