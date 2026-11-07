import * as $ from 'svelte/internal/server';
import { Axis, Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';
import { scaleLinear } from 'd3-scale';
import { getNewPassengerCars } from '$lib/data.remote.js';

const data = await getNewPassengerCars();

export default function Compound_dual_axis_with_single_chart_using_remapped_scale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'left',
							rule: true,
							format: 'metric',
							label: '↑ sales (M)',
							labelPlacement: 'start',
							labelProps: { class: 'fill-primary' }
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							placement: 'right',
							scale: scaleLinear(context.y1Scale?.domain() ?? [], [context.height, 0]),
							ticks: context.y1Scale?.ticks?.(),
							rule: true,
							label: 'efficiency (mpg) ↑',
							labelPlacement: 'start',
							labelProps: { class: 'fill-secondary' }
						});

						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', format: 'none', rule: true });
						$$renderer.push(`<!----> `);
						Spline($$renderer, { class: 'stroke-2 stroke-primary' });
						$$renderer.push(`<!----> `);

						Spline($$renderer, {
							y: (d) => context.y1Scale?.(d.efficiency),
							class: 'stroke-2 stroke-secondary'
						});

						$$renderer.push(`<!----> `);
						Highlight($$renderer, { lines: true, points: true });
						$$renderer.push(`<!----> `);

						Highlight($$renderer, {
							points: { class: 'fill-secondary' },
							y: (d) => context.y1Scale?.(d.efficiency)
						});

						$$renderer.push(`<!---->`);
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
									$$renderer.push(`<!---->${$.escape(data.year)}`);
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
										Tooltip.Item($$renderer, { label: 'sales', value: data.sales, format: 'currencyRound' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'efficiency', value: data.efficiency });
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
				data,
				x: 'year',
				y: 'sales',
				yDomain: [0, null],
				yNice: true,
				y1: 'efficiency',
				y1Range: ({ yScale }) => yScale.domain(),
				padding: { top: 24, bottom: 24, left: 24, right: 24 },
				tooltipContext: { mode: 'quadtree-x' },
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}