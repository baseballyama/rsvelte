import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Vertical_fixed_width($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		BarChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			height: 300,
			props: { bars: { width: 20 } }
		});

		$.bind_props($$props, { data });
	});
}