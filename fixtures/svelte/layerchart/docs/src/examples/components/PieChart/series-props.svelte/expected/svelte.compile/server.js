import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';
import { group } from 'd3-array';

export default function Series_props($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = group(longData, (d) => d.year);

		PieChart($$renderer, {
			key: 'fruit',
			value: 'value',
			cRange: fruitColors,
			series: [
				{
					key: '2019',
					data: data.get(2019),
					props: { innerRadius: -20 }
				},

				{
					key: '2018',
					data: data.get(2018),
					props: { outerRadius: -30 }
				}
			],
			height: 300
		});

		$.bind_props($$props, { data });
	});
}