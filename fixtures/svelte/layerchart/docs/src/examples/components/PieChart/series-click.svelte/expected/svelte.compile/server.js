import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';
import { group } from 'd3-array';

export default function Series_click($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = group(longData, (d) => d.year);

		PieChart($$renderer, {
			key: 'fruit',
			value: 'value',
			cRange: fruitColors,
			series: Array.from(data, ([key, data]) => ({ key: key.toString(), data })),
			outerRadius: -25,
			innerRadius: -20,
			cornerRadius: 5,
			padAngle: 0.01,
			height: 300,
			onArcClick: (e, detail) => {
				console.log(e, detail);
				alert(JSON.stringify(detail));
			}
		});

		$.bind_props($$props, { data });
	});
}