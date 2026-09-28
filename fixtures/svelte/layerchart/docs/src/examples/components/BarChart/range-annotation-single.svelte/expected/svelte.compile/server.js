import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Range_annotation_single($$renderer, $$props) {
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
			y: 'value',
			annotations: [
				{
					type: 'range',
					x: [data[2].date, data[2].date],
					pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } }
				}
			],
			height: 300
		});

		$.bind_props($$props, { data });
	});
}