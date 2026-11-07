import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { longData } from '$lib/utils/data';

export default function Colors_data_prop($$anchor, $$props) {
	$.push($$props, true);

	const data = longData.filter((d) => d.year === 2019).map((d, i) => {
		return {
			...d,
			color: [
				'var(--color-apples)',
				'var(--color-bananas)',
				'var(--color-cherries)',
				'var(--color-grapes)'
			][i]
		};
	});

	var $$exports = { data };

	PieChart($$anchor, {
		get data() {
			return data;
		},
		key: 'fruit',
		value: 'value',
		c: 'color',
		height: 300
	});

	return $.pop($$exports);
}