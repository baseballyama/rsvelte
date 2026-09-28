import * as $ from 'svelte/internal/server';

import {
	LineChart,
	Highlight,
	pivotLonger,
	Spline,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';
import { group } from 'd3-array';
import { cls } from '@layerstack/tailwind';
import { format } from '@layerstack/utils';

export default function Series_individual_tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const keys = ['apples', 'bananas', 'oranges'];
		const data = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
		const flatData = pivotLonger(data, keys, 'fruit', 'value');
		const dataByFruit = group(flatData, (d) => d.fruit);

		{
			function marks($$renderer, { context }) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(context.series.visibleSeries);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let s = each_array[$$index];
					const active = (context.tooltip.data == null || s.key === context.tooltip.data?.fruit) && (context.series.highlightKey === null || s.key === context.series.highlightKey);

					Spline($$renderer, {
						data,
						y: s.key,
						stroke: s.color,
						class: cls(!active && 'opacity-20 saturate-0')
					});
				}

				$$renderer.push(`<!--]-->`);
			}

			function highlight($$renderer, { context }) {
				const activeSeriesColor = context.series.series.find((s) => s.key === context.tooltip.data?.fruit)?.color;

				Highlight($$renderer, { lines: true, points: { fill: activeSeriesColor } });
			}

			function tooltip($$renderer, { context }) {
				const activeSeriesColor = context.series.series.find((s) => s.key === context.tooltip.data?.fruit)?.color;

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
											label: data.fruit,
											value: data.value,
											color: activeSeriesColor
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
				data: flatData,
				x: 'date',
				y: 'value',
				series: [
					{ key: 'apples', color: 'var(--color-apples)' },
					{ key: 'bananas', color: 'var(--color-bananas)' },
					{ key: 'oranges', color: 'var(--color-oranges)' }
				],
				props: { tooltip: { context: { mode: 'quadtree' } } },
				brush: true,
				legend: true,
				padding: defaultChartPadding({ legend: true, right: 10 }),
				height: 300,
				marks,
				highlight,
				tooltip,
				$$slots: { marks: true, highlight: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data: dataByFruit });
	});
}