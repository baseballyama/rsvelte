import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding } from 'layerchart';
import { longData } from '$lib/utils/data.js';

export default function Facet_stack_long_data($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData;

		BarChart($$renderer, {
			data,
			fx: 'year',
			x: 'basket',
			y: 'value',
			c: 'fruit',
			axis: 'y',
			bandPadding: 0.2,
			tooltipContext: { mode: 'facet' },
			facet: {
				padding: 0.1,
				axis: { placement: 'bottom', tickLabelProps: { dy: 8 } }
			},
			padding: defaultChartPadding({ axis: 'y', legend: true, bottom: 24 }),
			cRange: [
				'var(--color-apples)',
				'var(--color-bananas)',
				'var(--color-cherries)',
				'var(--color-grapes)'
			],
			legend: true,
			props: {
				facetAxis: { format: 'none' },
				yAxis: { format: 'metric' },
				tooltip: { header: { format: 'none' } }
			},
			height: 300
		});

		$.bind_props($$props, { data });
	});
}