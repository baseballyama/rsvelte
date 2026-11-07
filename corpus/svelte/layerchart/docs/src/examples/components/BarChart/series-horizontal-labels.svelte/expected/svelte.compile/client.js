import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Series_horizontal_labels($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 2,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 30, right: 25 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			y: 'date',
			orientation: 'horizontal',
			series: [
				{
					key: 'baseline',
					color: 'var(--color-surface-content)',
					props: { fillOpacity: 0.2 }
				},

				{
					key: 'value',
					color: 'var(--color-primary)',
					props: { insets: { y: 4 } }
				}
			],
			seriesLayout: 'overlap',
			labels: { seriesKey: 'value', placement: 'inside', fill: 'white' },
			get padding() {
				return $.get($0);
			},
			height: 200
		});
	}

	return $.pop($$exports);
}