import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Both_axis_grid($$anchor, $$props) {
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
		grid: { x: true },
		height: 300
	});

	return $.pop($$exports);
}