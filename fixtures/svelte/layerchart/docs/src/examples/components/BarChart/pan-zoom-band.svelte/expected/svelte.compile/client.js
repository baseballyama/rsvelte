import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { getRandomInteger, usStateAbbreviations } from '$lib/utils/data.js';

export default function Pan_zoom_band($$anchor, $$props) {
	$.push($$props, true);

	const data = usStateAbbreviations.map((state) => ({ state, value: getRandomInteger(20, 100) }));
	var $$exports = { data };

	BarChart($$anchor, {
		get data() {
			return data;
		},
		x: 'state',
		y: 'value',
		clip: true,
		transform: { mode: 'domain', axis: 'x', scaleExtent: [1, 10] },
		props: { xAxis: { tickSpacing: 25 } },
		height: 300
	});

	return $.pop($$exports);
}