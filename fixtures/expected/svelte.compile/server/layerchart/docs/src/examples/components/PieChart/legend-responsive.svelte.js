import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';

export default function Legend_responsive($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);

		PieChart($$renderer, {
			data,
			key: 'fruit',
			value: 'value',
			cRange: fruitColors,
			height: 300,
			padding: { bottom: 32 },
			legend: {
				classes: {
					root: 'w-full',
					items: 'justify-center',
					swatch: 'size-2',
					item: 'text-xs'
				}
			}
		});

		$.bind_props($$props, { data });
	});
}