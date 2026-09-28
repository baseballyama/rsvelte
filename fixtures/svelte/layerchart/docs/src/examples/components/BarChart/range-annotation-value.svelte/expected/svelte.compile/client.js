import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Range_annotation_value($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	BarChart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		annotations: [
			{
				type: 'range',
				y: [75, null],
				pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } }
			},

			{
				type: 'line',
				label: 'Max',
				y: 75,
				props: { line: { dashArray: [2, 2] } }
			}
		],
		height: 300
	});

	return $.pop($$exports);
}