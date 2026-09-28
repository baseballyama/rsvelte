import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';

export default function Legend_responsive($$anchor, $$props) {
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

	return $.pop($$exports);
}