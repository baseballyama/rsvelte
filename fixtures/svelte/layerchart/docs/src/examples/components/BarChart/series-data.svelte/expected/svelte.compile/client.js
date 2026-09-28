import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Series_data($$anchor, $$props) {
	$.push($$props, true);

	const dateSeriesData = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	const dateSeriesBaselineData = dateSeriesData.map((d) => ({ ...d, value: d.baseline }));
	const data = { dateSeriesData, dateSeriesBaselineData };
	var $$exports = { data };

	{
		let $0 = $.derived(() => [
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
		]);

		BarChart($$anchor, {
			x: 'date',
			y: 'value',
			get series() {
				return $.get($0);
			},
			seriesLayout: 'overlap',
			height: 300
		});
	}

	return $.pop($$exports);
}