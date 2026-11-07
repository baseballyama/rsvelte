import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Override_color($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' }).map((d) => {
		return { ...d, visits: d.value };
	});

	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ right: 10 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			series: [{ key: 'value', color: 'var(--color-secondary)' }],
			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}