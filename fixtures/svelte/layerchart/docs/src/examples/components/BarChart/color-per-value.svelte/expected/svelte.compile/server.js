import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding } from 'layerchart';
import { longData } from '$lib/utils/data.js';

export default function Color_per_value($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);

		BarChart($$renderer, {
			data,
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
			padding: defaultChartPadding({ left: 24 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}