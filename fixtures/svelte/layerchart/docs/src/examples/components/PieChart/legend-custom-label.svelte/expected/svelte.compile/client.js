import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';

export default function Legend_custom_label($$anchor, $$props) {
	$.push($$props, true);

	const data = longData.filter((d) => d.year === 2019);
	var $$exports = { data };

	PieChart($$anchor, {
		get data() {
			return data;
		},
		key: 'fruit',
		value: 'value',
		get cRange() {
			return fruitColors;
		},

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

	return $.pop($$exports);
}