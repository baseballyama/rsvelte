import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Series($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		BarChart($$renderer, {
			data,
			x: 'date',
			series: [
				{
					key: 'baseline',
					color: 'var(--color-surface-content)',
					props: { fillOpacity: 0.2 }
				},

				{
					key: 'value',
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