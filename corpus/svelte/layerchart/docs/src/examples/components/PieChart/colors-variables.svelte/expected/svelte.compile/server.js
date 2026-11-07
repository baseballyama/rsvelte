import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';

export default function Colors_variables($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);

		PieChart($$renderer, {
			data,
			key: 'fruit',
			value: 'value',
			height: 300,
			cRange: fruitColors
		});

		$.bind_props($$props, { data });
	});
}