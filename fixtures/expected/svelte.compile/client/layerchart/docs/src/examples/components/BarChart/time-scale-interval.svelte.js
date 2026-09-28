import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { timeDay } from 'd3-time';

export default function Time_scale_interval($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	{
		let $0 = $.derived(() => data.filter((d) => Math.random() > 0.7));

		BarChart($$anchor, {
			get data() {
				return $.get($0);
			},
			x: 'date',
			y: 'value',
			get xInterval() {
				return timeDay;
			},
			height: 300
		});
	}

	return $.pop($$exports);
}