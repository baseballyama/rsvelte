import * as $ from 'svelte/internal/server';
import { AreaChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Series_tooltip_click($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

		AreaChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			onTooltipClick: (e, detail) => {
				console.log(e, detail);
				alert(JSON.stringify(detail));
			},
			padding: defaultChartPadding({ right: 10 }),
			height: 300
		});

		$.bind_props($$props, { data });
	});
}