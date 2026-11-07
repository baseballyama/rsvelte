import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Series_custom_highlight_point($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});

	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ right: 10 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'oranges', color: 'var(--color-oranges)' }
			],
			props: { highlight: { points: { r: 8, strokeWidth: 4 } } },
			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}