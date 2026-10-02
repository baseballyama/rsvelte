import * as $ from 'svelte/internal/server';

import {
	Area,
	AreaChart,
	Highlight,
	LinearGradient,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';
import { format } from '@layerstack/utils';

export default function Threshold_gradient($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: -20, max: 50, value: 'integer' });

		const colors = {
			positive: 'var(--color-success)',
			negative: 'var(--color-danger)'
		};

		{
			function marks($$renderer, { context }) {
				const thresholdValue = 0;
				const thresholdOffset = context.yScale(thresholdValue) / (context.height + context.padding.bottom);

				{
					function children($$renderer, { gradient }) {
						Area($$renderer, {
							y0: (d) => thresholdValue,
							line: { stroke: gradient },
							fill: gradient,
							fillOpacity: 0.2
						});
					}

					LinearGradient($$renderer, {
						stops: [
							[thresholdOffset, colors.positive],
							[thresholdOffset, colors.negative]
						],
						units: 'userSpaceOnUse',
						vertical: true,
						children,
						$$slots: { default: true }
					});
				}
			}

			function highlight($$renderer, { context }) {
				const value = context.tooltip?.data && context.y(context.tooltip?.data);

				Highlight($$renderer, {
					lines: true,
					points: { fill: value < 0 ? colors.negative : colors.positive }
				});
			}

			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						const value = context.y(data);

						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(format(context.x(data), 'day'))}`);
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

										Tooltip.Item($$renderer, {
											label: 'value',
											value: context.y(data),
											color: value < 0 ? colors.negative : colors.positive
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
						Tooltip.Root($$renderer, { children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			AreaChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				padding: defaultChartPadding({ right: 15 }),
				height: 300,
				marks,
				highlight,
				tooltip,
				$$slots: { marks: true, highlight: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}