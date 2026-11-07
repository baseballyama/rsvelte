import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { longData } from '$lib/utils/data';
import { fruitColors } from '$lib/utils/fruits';

export default function Arc($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);

		PieChart($$renderer, {
			data,
			key: 'fruit',
			value: 'value',
			cRange: fruitColors,
			height: 180,
			range: [-90, 90],
			outerRadius: 160,
			innerRadius: -20,
			cornerRadius: 10,
			padAngle: 0.02,
			props: { group: { y: 160 / 2 } }
		});

		$.bind_props($$props, { data });
	});
}