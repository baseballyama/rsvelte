import * as $ from 'svelte/internal/server';
import { Axis, BarChart, Tooltip, defaultChartPadding } from 'layerchart';
import { scaleTime } from 'd3-scale';
import { extent } from 'd3-array';
import { getHydro } from '$lib/data.remote.js';

const data = await getHydro();

export default function Compound_separate_scales_with_stacked_charts_with_inverted_range_top_down($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		1;
		$$renderer.push(`<div class="grid grid-stack p-4 border rounded-sm">`);

		BarChart($$renderer, {
			data,
			x: 'date',
			y: 'rain',
			axis: { placement: 'right', tickMarks: false },
			yDomain: [0, 500],
			yRange: ({ height }) => [0, height],
			padding: { left: 32, right: 32, bottom: 20 },
			props: {
				bars: { rounded: 'none', class: '_stroke-none fill-blue-500' }
			},
			height: 300
		});

		$$renderer.push(`<!----> `);

		{
			function axis($$renderer, { context }) {
				Axis($$renderer, { placement: 'left' });
				$$renderer.push(`<!----> `);

				Axis($$renderer, {
					placement: 'bottom',
					scale: scaleTime(extent(data, (d) => d.date), [0, context.width]),
					tickMultiline: true,
					rule: true
				});

				$$renderer.push(`<!---->`);
			}

			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');
							Tooltip.Header($$renderer, { value: data.date, format: 'day' });
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
										Tooltip.Item($$renderer, { label: 'rain', color: 'hsl(200 100% 50%)', value: data.rain });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'infiltration',
											color: 'hsl(25, 95%, 53%)',
											value: data.infiltration
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'dirtyh2o',
											color: 'hsl(0, 84%, 60%)',
											value: data.dirtyh2o
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'rain_induced',
											color: 'hsl(142, 71%, 45%)',
											value: data.rain_induced
										});

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

			BarChart($$renderer, {
				data,
				x: 'date',
				yDomain: [0, 1000],
				series: [
					{
						key: 'infiltration',
						value: (d) => d.infiltration > 0 ? d.infiltration : 0,
						color: 'hsl(25, 95%, 53%)',
						props: { rounded: 'none' }
					},

					{
						key: 'dirtyh2o',
						color: 'hsl(0, 84%, 60%)',
						props: { rounded: 'none' }
					},

					{
						key: 'rain_induced',
						color: 'hsl(142, 71%, 45%)',
						props: { rounded: 'none' }
					}
				],
				padding: defaultChartPadding({ top: 20, bottom: 30, right: 32, left: 32 }),
				height: 300,
				axis,
				tooltip,
				$$slots: { axis: true, tooltip: true }
			});
		}

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { data });
	});
}