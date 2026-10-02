import * as $ from 'svelte/internal/server';
import ArcChart from '../ArcChart/ArcChart.svelte';

export default function ArcChartTooltip($$renderer) {
	const data = [
		{ browser: 'other', visitors: 90, color: 'gray' },
		{ browser: 'edge', visitors: 173, color: 'green' },
		{ browser: 'firefox', visitors: 187, color: 'orange' },
		{ browser: 'safari', visitors: 200, color: 'blue' },
		{ browser: 'chrome', visitors: 275, color: 'red' }
	];

	const series = data.map((datum) => ({
		key: datum.browser,
		label: datum.browser,
		color: datum.color,
		data: [datum]
	}));

	{
		function tooltip($$renderer, { context }) {
			const visibleSeries = context.tooltip.series.filter((series) => series.value !== undefined);

			$$renderer.push(`<div class="arc-chart-tooltip"><!--[-->`);

			const each_array = $.ensure_array_like(visibleSeries);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let series = each_array[$$index];

				$$renderer.push(`<span class="arc-chart-tooltip-label">${$.escape(series.label)}</span> <span class="arc-chart-tooltip-value">${$.escape(series.value)}</span>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		ArcChart($$renderer, {
			data,
			label: 'browser',
			value: 'visitors',
			innerRadius: 40,
			outerRadius: 70,
			height: 240,
			width: 240,
			series,
			tooltip,
			$$slots: { tooltip: true }
		});
	}
}