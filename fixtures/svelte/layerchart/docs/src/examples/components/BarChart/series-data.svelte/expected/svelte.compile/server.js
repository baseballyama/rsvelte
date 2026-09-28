import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Series_data($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dateSeriesData = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		const dateSeriesBaselineData = dateSeriesData.map((d) => ({ ...d, value: d.baseline }));
		const data = { dateSeriesData, dateSeriesBaselineData };

		BarChart($$renderer, {
			x: 'date',
			y: 'value',
			series: [
				{
					key: 'baseline',
					data: dateSeriesBaselineData,
					color: 'var(--color-surface-content)',
					props: { fillOpacity: 0.2 }
				},

				{
					key: 'value',
					data: dateSeriesData,
					color: 'var(--color-primary)',
					props: { insets: { x: 8 } }
				}
			],
			seriesLayout: 'overlap',
			height: 300
		});

		$.bind_props($$props, { data });
	});
}