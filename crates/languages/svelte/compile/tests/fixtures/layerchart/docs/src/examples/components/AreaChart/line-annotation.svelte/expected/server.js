import * as $ from 'svelte/internal/server';
import { AreaChart, defaultChartPadding } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Line_annotation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		AreaChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			padding: defaultChartPadding({ left: 25 }),
			height: 300,
			annotations: [
				{
					type: 'line',
					y: 500,
					label: 'Max',
					labelXOffset: 4,
					labelYOffset: 2,
					props: {
						label: { fill: 'var(--color-danger)' },
						line: { dashArray: [2, 2], stroke: 'var(--color-danger)' }
					}
				}
			]
		});

		$.bind_props($$props, { data });
	});
}