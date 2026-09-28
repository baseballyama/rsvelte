import * as $ from 'svelte/internal/server';
import { ChartGroup, LineChart, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { rollup, sum } from 'd3-array';

export default function Faceted_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const regions = ['North', 'South', 'West'];

		// One series per region, over the same days
		const data = regions.flatMap((region) => createDateSeries({
			count: 30,
			min: 100,
			max: 400,
			value: 'integer',
			keys: ['value']
		}).map((d) => ({ ...d, region })));

		const totals = Array.from(rollup(data, (rows) => sum(rows, (d) => d.value), (d) => +d.date), ([date, value]) => ({ date: new Date(date), value })).sort((a, b) => +a.date - +b.date);

		ChartGroup($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2"><div class="border rounded-sm p-2"><div class="text-sm text-surface-content/70">By region</div> `);

				{
					function tooltip($$renderer, { context }) {
						{
							function children($$renderer, { data }) {
								if (Tooltip.List) {
									$$renderer.push('<!--[-->');

									Tooltip.List($$renderer, {
										children: ($$renderer) => {
											if (Tooltip.Item) {
												$$renderer.push('<!--[-->');

												Tooltip.Item($$renderer, {
													label: data.region,
													value: data.value,
													color: context.cScale?.(context.c(data)),
													valueAlign: 'right'
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
								Tooltip.Root($$renderer, { facetAll: true, children, $$slots: { default: true } });
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
						c: 'region',
						cRange: [
							'var(--color-info)',
							'var(--color-success)',
							'var(--color-warning)'
						],
						fx: 'region',
						highlight: { lines: true, points: true, facetAll: true },
						height: 140,
						padding: { left: 40, bottom: 20, top: 20 },
						tooltip,
						$$slots: { tooltip: true }
					});
				}

				$$renderer.push(`<!----></div> <div class="border rounded-sm p-2"><div class="text-sm text-surface-content/70 mb-4">Total</div> `);

				LineChart($$renderer, {
					data: totals,
					x: 'date',
					y: 'value',
					height: 120,
					padding: { left: 40, bottom: 20 }
				});

				$$renderer.push(`<!----></div></div>`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}