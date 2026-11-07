import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { scaleLog } from 'd3-scale';

export default function Scale_override($$anchor, $$props) {
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
		let $0 = $.derived(scaleLog);

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			get yScale() {
				return $.get($0);
			},
			yDomain: [1, 100],
			props: { yAxis: { ticks: [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 100] } },
			height: 300
		});
	}

	return $.pop($$exports);
}