import * as $ from 'svelte/internal/server';

import {
	Area,
	AreaChart,
	Highlight,
	Tooltip,
	defaultChartPadding,
	pivotLonger
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

				const each_array = $.ensure_array_like(context.series.series);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let s = each_array[$$index];
					const activeSeries = context.tooltip?.data == null || context.tooltip?.data?.fruit === s.key;

					$$renderer.push(`<g${$.attr_class($.clsx(cls(!activeSeries && 'opacity-20 saturate-0')))}>`);

					Area($$renderer, {
						data: s.data,
						line: { stroke: s.color },
						fill: s.color,
						fillOpacity: 0.3
					});

					$$renderer.push(`<!----></g>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			function highlight($$renderer, { context }) {
				const activeSeries = context.series.series.find((s) => s.key === context.tooltip?.data?.fruit);

				Highlight($$renderer, { lines: true, points: { fill: activeSeries?.color } });
			}

			function tooltip($$renderer, { context }) {
				const activeSeries = context.series.series.find((s) => s.key === context.tooltip?.data?.fruit);

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
											label: data?.fruit,
											value: data?.value,
											color: activeSeries?.color
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
				x: 'date',
				y: 'value',
				series: [
					{
						key: 'apples',
						data: dataByFruit.get('apples'),
						color: 'var(--color-apples)'
					},

					{
						key: 'bananas',
						data: dataByFruit.get('bananas'),
						color: 'var(--color-bananas)'
					},

					{
						key: 'oranges',
						data: dataByFruit.get('oranges'),
						color: 'var(--color-oranges)'
					}
				],
				props: { tooltip: { context: { mode: 'quadtree' } } },
				padding: defaultChartPadding({ right: 15 }),
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