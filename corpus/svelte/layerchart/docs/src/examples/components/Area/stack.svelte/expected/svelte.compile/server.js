import * as $ from 'svelte/internal/server';

import {
	Area,
	Axis,
	Chart,
	Highlight,
	Layer,
	Tooltip,
	asAny,
	defaultChartPadding
} from 'layerchart';

import { stack } from 'd3-shape';
import flatten from '$lib/utils/flatten.js';
import { createDateSeries } from '$lib/utils/data.js';

export default function Stack($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const keys = ['apples', 'bananas', 'oranges'];
		const multiSeriesData = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
		const stackData = stack().keys(keys)(multiSeriesData);

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
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(stackData);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let seriesData = each_array[$$index];
							const color = context.cGet(seriesData);

							Area($$renderer, {
								data: seriesData,
								line: { stroke: color, 'stroke-width': 2 },
								fill: color,
								fillOpacity: 0.2
							});
						}

						$$renderer.push(`<!--]--> `);
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
							Tooltip.Header($$renderer, { value: data.data.date, format: 'day' });
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
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(keys);

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let key = each_array_1[$$index_1];

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: key,
												value: data.data[key],
												color: context.cScale?.(key)
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
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
				data: stackData,
				flatData: flatten(stackData),
				x: (d) => asAny(d).data.date,
				y: [0, 1],
				yNice: true,
				c: 'key',
				cDomain: Object.keys(fruitColors),
				cRange: Object.values(fruitColors),
				tooltipContext: { mode: 'quadtree-x' },
				padding: defaultChartPadding({ left: 25, bottom: 20, right: 15 }),
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data: stackData });
	});
}