import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AreaChart } from 'layerchart';

export default function All_zero($$anchor, $$props) {
	$.push($$props, true);

	const data = Array.from({ length: 30 }, (_, i) => ({ date: new Date(2025, 7, 17 + i), value: 0 }));
	var $$exports = { data };

	AreaChart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		height: 300
	});

	return $.pop($$exports);
}