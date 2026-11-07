import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';
import { group } from 'd3-array';

export default function Series_props($$anchor, $$props) {
	$.push($$props, true);

	const data = group(longData, (d) => d.year);
	var $$exports = { data };

	{
		let $0 = $.derived(() => [
			{
				key: '2019',
				data: data.get(2019),
				props: { innerRadius: -20 }
			},

			{
				key: '2018',
				data: data.get(2018),
				props: { outerRadius: -30 }
			}
		]);

		PieChart($$anchor, {
			key: 'fruit',
			value: 'value',
			get cRange() {
				return fruitColors;
			},

			get series() {
				return $.get($0);
			},
			height: 300
		});
	}

	return $.pop($$exports);
}