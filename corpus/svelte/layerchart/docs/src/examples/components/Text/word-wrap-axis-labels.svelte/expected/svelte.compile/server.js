import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding } from 'layerchart';
import { schemeCategory10 } from 'd3-scale-chromatic';

export default function Word_wrap_axis_labels($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{ value: 67, label: 'This is\n1st really\nlong text' },
			{ value: 97, label: 'This is\n2nd really\nlong text' },
			{ value: 61, label: 'This is\n3rd really\nlong text' }
		];

		BarChart($$renderer, {
			data,
			x: 'value',
			y: 'label',
			labels: { placement: 'inside' },
			cRange: schemeCategory10,
			orientation: 'horizontal',
			padding: defaultChartPadding({ top: 20, left: 60 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}