import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { longData } from '$lib/utils/data';
import { fruitColors } from '$lib/utils/fruits';

export default function Arc($$anchor, $$props) {
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
		height: 180,
		range: [-90, 90],
		outerRadius: 160,
		innerRadius: -20,
		cornerRadius: 10,
		padAngle: 0.02,
		props: { group: { y: 160 / 2 } }
	});

	return $.pop($$exports);
}