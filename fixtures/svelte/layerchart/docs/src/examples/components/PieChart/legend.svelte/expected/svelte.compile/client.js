import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { longData } from '$lib/utils/data';
import { fruitColors } from '$lib/utils/fruits';

export default function Legend($$anchor, $$props) {
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
		legend: true
	});

	return $.pop($$exports);
}