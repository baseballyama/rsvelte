import * as $ from 'svelte/internal/server';
import { AnnotationLine, BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Bar_chart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		{
			function aboveMarks($$renderer, { context }) {
				AnnotationLine($$renderer, {
					y: 50,
					label: 'Avg',
					props: {
						line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
						label: { fill: 'var(--color-danger)' }
					}
				});
			}

			BarChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				height: 300,
				padding: { top: 10, bottom: 20, left: 25 },
				aboveMarks,
				$$slots: { aboveMarks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}