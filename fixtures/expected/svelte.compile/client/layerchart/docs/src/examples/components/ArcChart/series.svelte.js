import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArcChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruitColors';
import { longData } from '$lib/utils/data';

export default function Series($$anchor, $$props) {
	$.push($$props, true);

	const data = longData.filter((d) => d.year === 2019);
	var $$exports = { data };

	ArcChart($$anchor, {
		get data() {
			return data;
		},
		key: 'fruit',
		value: 'value',
		get cRange() {
			return fruitColors;
		},
		outerRadius: -25,
		innerRadius: -20,
		cornerRadius: 10,
		height: 300
	});

	return $.pop($$exports);
}