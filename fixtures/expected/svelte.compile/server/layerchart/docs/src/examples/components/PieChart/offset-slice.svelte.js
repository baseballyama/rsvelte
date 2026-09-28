import * as $ from 'svelte/internal/server';
import { Arc, PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';

export default function Offset_slice($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);

		{
			function arc($$renderer, { index, props }) {
				Arc($$renderer, $.spread_props([props, { offset: index === 1 ? 16 : undefined }]));
			}

			PieChart($$renderer, {
				data,
				key: 'fruit',
				value: 'value',
				cRange: fruitColors,
				height: 300,
				arc,
				$$slots: { arc: true }
			});
		}

		$.bind_props($$props, { data });
	});
}