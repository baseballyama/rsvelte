import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';

export default function Donut($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);

		PieChart($$renderer, {
			data,
			key: 'fruit',
			value: 'value',
			cRange: fruitColors,
			innerRadius: -20,
			cornerRadius: 5,
			padAngle: 0.02,
			height: 300
		});

		$.bind_props($$props, { data });
	});
}