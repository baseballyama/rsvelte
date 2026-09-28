import * as $ from 'svelte/internal/server';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Axis_labels_inside($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

		LineChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			xNice: true,
			height: 300,
			props: {
				yAxis: {
					tickLabelProps: { textAnchor: 'start', verticalAnchor: 'end', dx: 4 },
					tickLength: 0,
					rule: true
				}
			},
			padding: { left: 0, top: 12, right: 10, bottom: 24 }
		});

		$.bind_props($$props, { data });
	});
}