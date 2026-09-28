import * as $ from 'svelte/internal/server';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Series_vertical($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 10,
			max: 100,
			value: 'integer',
			keys: ['apples', 'bananas', 'oranges']
		});

		$$renderer.push(`<div class="flex justify-center">`);

		LineChart($$renderer, {
			data,
			y: 'date',
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'oranges', color: 'var(--color-oranges)' }
			],
			orientation: 'vertical',
			padding: defaultChartPadding({ bottom: 25, left: 25 }),
			height: 600,
			width: 400
		});

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { data });
	});
}