import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';

export default function Donut($$anchor, $$props) {
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
		innerRadius: -20,
		cornerRadius: 5,
		padAngle: 0.02,
		height: 300
	});

	return $.pop($$exports);
}