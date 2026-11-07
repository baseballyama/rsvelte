import * as $ from 'svelte/internal/server';
import { ArcChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruitColors';
import { longData } from '$lib/utils/data';

export default function Series_start_90($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);

		ArcChart($$renderer, {
			data,
			key: 'fruit',
			value: 'value',
			cRange: fruitColors,
			range: [90, -270],
			outerRadius: -25,
			innerRadius: -20,
			cornerRadius: 10,
			height: 300
		});

		$.bind_props($$props, { data });
	});
}