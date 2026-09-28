import * as $ from 'svelte/internal/server';

import {
	Area,
	Axis,
	Chart,
	Circle,
	Highlight,
	Layer,
	Point,
	Text,
	Tooltip,
	defaultChartPadding,
	pivotLonger
} from 'layerchart';

import { flatGroup } from 'd3-array';
import { cls } from '@layerstack/tailwind';
import { createDateSeries } from '$lib/utils/data.js';

export default function Multiple_series_highlight_on_hover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const keys = ['apples', 'bananas', 'oranges'];
		const multiSeriesData = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
		const multiSeriesFlatData = pivotLonger(multiSeriesData, keys, 'fruit', 'value');
		const dataByFruit = flatGroup(multiSeriesFlatData, (d) => d.fruit);

		const fruitColors = {
			apples: 'var(--color-apples)',
			bananas: 'var(--color-bananas)',
			oranges: 'var(--color-oranges)'
		};

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!---->`);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----><!--[-->`);

						const each_array = $.ensure_array_like(dataByFruit);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let [fruit, data] = each_array[$$index];
							const active = context.tooltip.data == null || context.tooltip.data.fruit === fruit;
							const color = context.cScale?.(fruit);

							$$renderer.push(`<g${$.attr_class($.clsx(cls(!active && 'opacity-20 saturate-0')))}>`);

							Area($$renderer, {
								data,
								fill: color,
								fillOpacity: 0.3,
								line: { class: 'stroke-2', stroke: color }
							});

							$$renderer.push(`<!---->`);

							{
								function children($$renderer, { x, y }) {
									Circle($$renderer, { cx: x, cy: y, r: 4, fill: color });
									$$renderer.push(`<!---->`);

									Text($$renderer, {
										x,
										y,
										value: fruit,
										verticalAnchor: 'middle',
										dx: 6,
										dy: -2,
										class: 'text-xs',
										fill: color
									});

									$$renderer.push(`<!---->`);
								}

								Point($$renderer, {
									d: data[data.length - 1],
									children,
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!----></g>`);
						}

						$$renderer.push(`<!--]-->`);
						Highlight($$renderer, { points: true, lines: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

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
										Tooltip.Item($$renderer, { label: data.fruit, value: data.value });
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
				data: multiSeriesFlatData,
				x: 'date',
				y: 'value',
				yDomain: [0, null],
				yNice: true,
				c: 'fruit',
				cDomain: Object.keys(fruitColors),
				cRange: Object.values(fruitColors),
				padding: defaultChartPadding({ top: 10, bottom: 20, left: 20, right: 60 }),
				tooltipContext: { mode: 'quadtree' },
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data: multiSeriesFlatData });
	});
}