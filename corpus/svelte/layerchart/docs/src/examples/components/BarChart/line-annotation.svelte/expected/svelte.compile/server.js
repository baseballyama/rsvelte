import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { mean } from 'd3-array';

export default function Line_annotation($$renderer, $$props) {
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
					type: 'line',
					y: mean(data, (d) => d.value),
					label: 'Avg',
					props: {
						line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
						label: { fill: 'var(--color-danger)' }
					}
				}
			],
			height: 300
		});

		$.bind_props($$props, { data });
	});
}