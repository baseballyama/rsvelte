import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { scaleTime } from 'd3-scale';

export default function Override_axis_ticks_with_custom_scale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 100,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		BarChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			props: {
				xAxis: {
					ticks: (scale) => scaleTime(scale.domain(), scale.range()).ticks()
				}
			},
			height: 300
		});

		$.bind_props($$props, { data });
	});
}