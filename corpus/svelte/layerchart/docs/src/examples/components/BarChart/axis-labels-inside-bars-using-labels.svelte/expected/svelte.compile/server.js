import * as $ from 'svelte/internal/server';
import { BarChart, Labels, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Axis_labels_inside_bars_using_labels($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		{
			function aboveMarks($$renderer) {
				Labels($$renderer, {
					x: (d) => 0,
					value: 'date',
					class: 'text-sm fill-surface-300 stroke-none'
				});
			}

			BarChart($$renderer, {
				data,
				x: 'value',
				y: 'date',
				labels: true,
				orientation: 'horizontal',
				axis: false,
				padding: defaultChartPadding({ left: 4, right: 10 }),
				height: 500,
				aboveMarks,
				$$slots: { aboveMarks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}