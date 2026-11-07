import * as $ from 'svelte/internal/server';
import { AnnotationRange, BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Bar_chart__value_($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		const dateSeriesData = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		{
			function belowMarks($$renderer, { context }) {
				AnnotationRange($$renderer, {
					y: [75, null],
					pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } }
				});
			}

			BarChart($$renderer, {
				data: dateSeriesData,
				x: 'date',
				y: 'value',
				height: 300,
				belowMarks,
				$$slots: { belowMarks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}