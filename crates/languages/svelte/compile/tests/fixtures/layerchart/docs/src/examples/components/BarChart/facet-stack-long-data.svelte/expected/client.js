import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';
import { longData } from '$lib/utils/data.js';

export default function Facet_stack_long_data($$anchor, $$props) {
	$.push($$props, true);

	const data = longData;
	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ axis: 'y', legend: true, bottom: 24 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
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

			get padding() {
				return $.get($0);
			},

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
	}

	return $.pop($$exports);
}