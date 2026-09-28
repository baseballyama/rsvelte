import * as $ from 'svelte/internal/server';
import { flatGroup } from 'd3-array';

import {
	Axis,
	Chart,
	Circle,
	Highlight,
	Layer,
	Spline,
	Text,
	Tooltip,
	pivotLonger
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';

export default function Multiple_series($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const keys = ['apples', 'bananas', 'oranges'];
		const multiSeriesData = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
		const data = pivotLonger(multiSeriesData, keys, 'fruit', 'value');
		const dataByFruit = flatGroup(data, (d) => d.fruit);

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

						const each_array = $.ensure_array_like(dataByFruit);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let [fruit, data] = each_array[$$index];
							const color = context.cScale?.(fruit);

							{
								function endContent($$renderer) {
									Circle($$renderer, { r: 4, fill: color });
									$$renderer.push(`<!----> `);

									Text($$renderer, {
										value: fruit,
										verticalAnchor: 'middle',
										dx: 6,
										dy: -2,
										class: 'text-xs',
										fill: color
									});

									$$renderer.push(`<!---->`);
								}

								Spline($$renderer, {
									data,
									class: 'stroke-2',
									stroke: color,
									endContent,
									$$slots: { endContent: true }
								});
							}
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
						Tooltip.Root($$renderer, { children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			Chart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				yDomain: [0, null],
				yNice: true,
				c: 'fruit',
				cDomain: Object.keys(fruitColors),
				cRange: Object.values(fruitColors),
				padding: { top: 25, left: 25, bottom: 25, right: 48 },
				tooltipContext: { mode: 'quadtree' },
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}