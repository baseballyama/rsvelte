import * as $ from 'svelte/internal/server';
import { AreaChart, ChartGroup, LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Synced_legend($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 10,
			max: 100,
			value: 'integer',
			keys: ['apples', 'bananas', 'oranges']
		});

		const series = [
			{ key: 'apples', color: 'var(--color-apples)' },
			{ key: 'bananas', color: 'var(--color-bananas)' },
			{ key: 'oranges', color: 'var(--color-oranges)' }
		];

		const padding = defaultChartPadding({ legend: true, right: 10 });

		ChartGroup($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2">`);
				LineChart($$renderer, { data, x: 'date', series, padding, height: 200 });
				$$renderer.push(`<!----> `);
				AreaChart($$renderer, { data, x: 'date', series, padding, height: 200, legend: true });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}