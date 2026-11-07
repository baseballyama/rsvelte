import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';
import { group } from 'd3-array';

export default function Series($$anchor, $$props) {
	$.push($$props, true);

	const data = group(longData, (d) => d.year);
	var $$exports = { data };

	{
		let $0 = $.derived(() => Array.from(data, ([key, data]) => ({ key: key.toString(), data })));

		PieChart($$anchor, {
			key: 'fruit',
			get cRange() {
				return fruitColors;
			},
			value: 'value',
			get series() {
				return $.get($0);
			},
			outerRadius: -25,
			innerRadius: -20,
			cornerRadius: 5,
			padAngle: 0.01,
			height: 300
		});
	}

	return $.pop($$exports);
}