import * as $ from 'svelte/internal/server';

import {
	ArcChart,
	AreaChart,
	BarChart,
	LineChart,
	PieChart,
	ScatterChart
} from 'layerchart';

import * as Chart from '$lib/components/ui/chart/index.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{ date: new Date('2025-01-01T00:00'), value: 30 },
			{ date: new Date('2025-02-01T00:00'), value: 50 },
			{ date: new Date('2025-03-01T00:00'), value: 40 },
			{ date: new Date('2025-04-01T00:00'), value: 70 },
			{ date: new Date('2025-05-01T00:00'), value: 60 },
			{ date: new Date('2025-06-01T00:00'), value: 90 }
		];

		const chartConfig = { default: { label: 'Value', color: 'var(--chart-1)' } };

		const pieData = [
			{ fruit: 'apples', value: 3840, color: 'var(--chart-1)' },
			{ fruit: 'bananas', value: 1920, color: 'var(--chart-2)' },
			{ fruit: 'cherries', value: 960, color: 'var(--chart-3)' },
			{ fruit: 'grapes', value: 400, color: 'var(--chart-4)' }
		];

		const pieChartConfig = {
			apples: { label: 'Apples', color: 'var(--chart-1)' },
			bananas: { label: 'Bananas', color: 'var(--chart-2)' },
			cherries: { label: 'Cherries', color: 'var(--chart-3)' },
			grapes: { label: 'Grapes', color: 'var(--chart-4)' }
		};

		const arcChartConfig = { example: { label: 'Example', color: 'var(--chart-2)' } };

		$$renderer.push(`<div class="grid grid-cols-2 gap-10">`);

		if (Chart.Container) {
			$$renderer.push('<!--[-->');

			Chart.Container($$renderer, {
				config: chartConfig,
				class: 'h-[200px] w-full',
				children: ($$renderer) => {
					{
						function tooltip($$renderer) {
							if (Chart.Tooltip) {
								$$renderer.push('<!--[-->');
								Chart.Tooltip($$renderer, { labelFormatter: (value) => value.toLocaleDateString() });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						AreaChart($$renderer, {
							data,
							x: 'date',
							y: 'value',
							tooltip,
							$$slots: { tooltip: true }
						});
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (Chart.Container) {
			$$renderer.push('<!--[-->');

			Chart.Container($$renderer, {
				config: chartConfig,
				class: 'h-[200px] w-full',
				children: ($$renderer) => {
					{
						function tooltip($$renderer) {
							if (Chart.Tooltip) {
								$$renderer.push('<!--[-->');
								Chart.Tooltip($$renderer, { labelFormatter: (value) => value.toLocaleDateString() });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						LineChart($$renderer, {
							data,
							x: 'date',
							y: 'value',
							tooltip,
							$$slots: { tooltip: true }
						});
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (Chart.Container) {
			$$renderer.push('<!--[-->');

			Chart.Container($$renderer, {
				config: chartConfig,
				class: 'h-[200px] w-full',
				children: ($$renderer) => {
					{
						function tooltip($$renderer) {
							if (Chart.Tooltip) {
								$$renderer.push('<!--[-->');
								Chart.Tooltip($$renderer, { labelFormatter: (value) => value.toLocaleDateString() });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						BarChart($$renderer, {
							data,
							x: 'date',
							y: 'value',
							tooltip,
							$$slots: { tooltip: true }
						});
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (Chart.Container) {
			$$renderer.push('<!--[-->');

			Chart.Container($$renderer, {
				config: chartConfig,
				class: 'h-[200px] w-full',
				children: ($$renderer) => {
					ScatterChart($$renderer, { data, x: 'date', y: 'value' });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (Chart.Container) {
			$$renderer.push('<!--[-->');

			Chart.Container($$renderer, {
				config: pieChartConfig,
				class: 'h-[200px] w-full',
				children: ($$renderer) => {
					{
						function tooltip($$renderer) {
							if (Chart.Tooltip) {
								$$renderer.push('<!--[-->');
								Chart.Tooltip($$renderer, { hideLabel: true });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						PieChart($$renderer, {
							data: pieData,
							key: 'fruit',
							value: 'value',
							cRange: Object.values(pieChartConfig).map((c) => c.color),
							tooltip,
							$$slots: { tooltip: true }
						});
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (Chart.Container) {
			$$renderer.push('<!--[-->');

			Chart.Container($$renderer, {
				config: arcChartConfig,
				class: 'h-[200px] w-full',
				children: ($$renderer) => {
					{
						function tooltip($$renderer) {
							if (Chart.Tooltip) {
								$$renderer.push('<!--[-->');
								Chart.Tooltip($$renderer, { hideLabel: true });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						ArcChart($$renderer, {
							data: [{ key: 'example', value: 70, color: 'var(--chart-2)' }],
							maxValue: 100,
							innerRadius: -20,
							cornerRadius: 10,
							tooltip,
							$$slots: { tooltip: true }
						});
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}