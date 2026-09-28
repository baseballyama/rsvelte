import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { scaleTime } from 'd3-scale';

export default function Override_axis_ticks_with_custom_scale($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 100,
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
		props: {
			xAxis: {
				ticks: (scale) => scaleTime(scale.domain(), scale.range()).ticks()
			}
		},
		height: 300
	});

	return $.pop($$exports);
}