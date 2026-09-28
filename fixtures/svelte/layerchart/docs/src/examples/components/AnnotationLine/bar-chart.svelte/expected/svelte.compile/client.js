import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AnnotationLine, BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Bar_chart($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	{
		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			AnnotationLine($$anchor, {
				y: 50,
				label: 'Avg',
				props: {
					line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
					label: { fill: 'var(--color-danger)' }
				}
			});
		};

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			padding: { top: 10, bottom: 20, left: 25 },
			aboveMarks,
			$$slots: { aboveMarks: true }
		});
	}

	return $.pop($$exports);
}