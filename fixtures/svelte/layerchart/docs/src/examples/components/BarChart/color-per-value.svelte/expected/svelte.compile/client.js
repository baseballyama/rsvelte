import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';
import { longData } from '$lib/utils/data.js';

export default function Color_per_value($$anchor, $$props) {
	$.push($$props, true);

	const data = longData.filter((d) => d.year === 2019);
	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 24 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'fruit',
			y: 'value',
			c: 'fruit',
			cRange: [
				'var(--color-apples)',
				'var(--color-bananas)',
				'var(--color-cherries)',
				'var(--color-grapes)'
			],
			props: { yAxis: { format: 'metric' } },
			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}