import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Axis_labels_inside_bars($$renderer, $$props) {
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
			x: 'value',
			y: 'date',
			labels: true,
			orientation: 'horizontal',
			axis: 'y',
			rule: false,
			props: {
				yAxis: {
					tickLabelProps: {
						textAnchor: 'start',
						dx: 6,
						dy: 2,
						class: 'text-sm fill-surface-300 stroke-none'
					},
					tickLength: 0
				}
			},
			padding: { left: 0, bottom: 16 },
			height: 500
		});

		$.bind_props($$props, { data });
	});
}