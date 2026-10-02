import * as $ from 'svelte/internal/server';
import { LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Vertical($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

		$$renderer.push(`<div class="flex justify-center">`);

		LineChart($$renderer, {
			data,
			x: 'value',
			y: 'date',
			orientation: 'vertical',
			width: 400,
			height: 600
		});

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { data });
	});
}