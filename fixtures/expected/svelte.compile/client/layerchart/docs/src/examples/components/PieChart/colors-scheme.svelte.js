import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart } from 'layerchart';
import { longData } from '$lib/utils/data';
import { schemeTableau10 } from 'd3-scale-chromatic';

export default function Colors_scheme($$anchor, $$props) {
	$.push($$props, true);

	const data = longData.filter((d) => d.year === 2019);
	var $$exports = { data };

	PieChart($$anchor, {
		get data() {
			return data;
		},
		key: 'fruit',
		value: 'value',
		height: 300,
		get cRange() {
			return schemeTableau10;
		}
	});

	return $.pop($$exports);
}