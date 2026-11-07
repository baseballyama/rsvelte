import * as $ from 'svelte/internal/server';
import { BarChart, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { scaleThreshold, scaleTime } from 'd3-scale';
import { format } from '@layerstack/utils';

export default function Single_dimension($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 50,
			min: 0,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		{
			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
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
											label: 'Status',
											value: context.c(data),
											color: context.cScale?.(context.c(data))
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

			BarChart($$renderer, {
				data,
				x: 'date',
				y: (d) => 1,
				c: 'value',
				cScale: scaleThreshold(),
				cDomain: [10, 50],
				cRange: [
					'var(--color-danger)',
					'var(--color-warning)',
					'var(--color-success)'
				],
				axis: 'x',
				bandPadding: 0.1,
				grid: false,
				props: {
					bars: { radius: 4, strokeWidth: 0, rounded: 'all' },
					highlight: {
						bar: {
							radius: 4,
							fill: 'none',
							stroke: 'currentColor',
							strokeWidth: 2
						}
					},
					xAxis: {
						ticks: (scale) => scaleTime(scale.domain(), scale.range()).ticks()
					},
					rule: { y: false }
				},
				height: 60,
				tooltip,
				$$slots: { tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}