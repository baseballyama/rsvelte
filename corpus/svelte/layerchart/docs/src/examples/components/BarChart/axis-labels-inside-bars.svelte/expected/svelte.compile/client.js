import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Axis_labels_inside_bars($$anchor, $$props) {
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
		x: 'value',
		y: 'date',
		labels: true,
		orientation: 'horizontal',
		axis: 'y',
		rule: false,
		props: {
			yAxis: {
				tickLabelProps: {
					textAnchor: 'start',
					dx: 6,
					dy: 2,
					class: 'text-sm fill-surface-300 stroke-none'
				},
				tickLength: 0
			}
		},
		padding: { left: 0, bottom: 16 },
		height: 500
	});

	return $.pop($$exports);
}