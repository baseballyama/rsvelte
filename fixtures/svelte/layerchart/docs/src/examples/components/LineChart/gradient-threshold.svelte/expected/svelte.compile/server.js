import * as $ from 'svelte/internal/server';
import { LinearGradient, LineChart, Highlight, Spline, Tooltip } from 'layerchart';
import { format } from '@layerstack/utils';
import { getDailyTemperature } from '$lib/data.remote';

const data = await getDailyTemperature();

export default function Gradient_threshold($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function marks($$renderer, { context }) {
				const thresholdOffset = context.yScale(50) / (context.height + context.padding.top + context.padding.bottom);

				{
					function children($$renderer, { gradient }) {
						Spline($$renderer, { stroke: gradient });
					}

					LinearGradient($$renderer, {
						stops: [
							[thresholdOffset, 'var(--color-danger)'],
							[thresholdOffset, 'var(--color-info)']
						],
						units: 'userSpaceOnUse',
						vertical: true,
						children,
						$$slots: { default: true }
					});
				}
			}

			function highlight($$renderer, { context }) {
				if (context.tooltip.data) {
					$$renderer.push('<!--[0-->');

					Highlight($$renderer, {
						lines: true,
						points: {
							fill: context.y(context.tooltip.data) > 50 ? 'var(--color-danger)' : 'var(--color-info)'
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						const value = context.y(data);

						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(format(context.x(data)))}`);
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
											value,
											color: value > 50 ? 'var(--color-danger)' : 'var(--color-info)'
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

			LineChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				yDomain: null,
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