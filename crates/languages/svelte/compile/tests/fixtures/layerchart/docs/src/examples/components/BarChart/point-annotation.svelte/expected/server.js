import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Point_annotation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		$$renderer.push(`<div class="h-[300px] p-4 border rounded-sm">`);

		BarChart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			annotations: [
				{
					type: 'point',
					x: data[data.length - 1].date,
					r: 4,
					label: 'Today',
					labelPlacement: 'bottom',
					labelYOffset: 16,
					props: {
						circle: { class: 'fill-secondary' },
						label: { class: 'text-xs fill-secondary font-bold' }
					}
				}
			],
			height: 300
		});

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { data });
	});
}