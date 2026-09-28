import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';

export default function Tooltip_click($$anchor, $$props) {
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
		onTooltipClick: (e, detail) => {
			console.log(e, detail);
			alert(JSON.stringify(detail));
		}
	});

	return $.pop($$exports);
}