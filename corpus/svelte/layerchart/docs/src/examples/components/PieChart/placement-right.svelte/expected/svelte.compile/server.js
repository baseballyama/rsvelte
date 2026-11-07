import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';

export default function Placement_right($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);

		PieChart($$renderer, {
			data,
			key: 'fruit',
			value: 'value',
			cRange: fruitColors,
			height: 300,
			placement: 'right',
			legend: { placement: 'left', orientation: 'vertical' }
		});

		$.bind_props($$props, { data });
	});
}