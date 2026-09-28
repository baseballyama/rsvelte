import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';

export default function Legend_custom_label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);

		PieChart($$renderer, {
			data,
			key: 'fruit',
			value: 'value',
			cRange: fruitColors,
			label: (d) => {
				switch (d.fruit) {
					case 'apples':
						return 'Apples 🍏';

					case 'bananas':
						return 'Bananas 🍌';

					case 'cherries':
						return 'Cherries 🍒';

					case 'grapes':
						return 'Grapes 🍇';
				}
			},
			height: 300,
			legend: true
		});

		$.bind_props($$props, { data });
	});
}