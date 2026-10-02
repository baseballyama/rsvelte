import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArcChart } from 'layerchart';

export default function Color($$anchor, $$props) {
	$.push($$props, true);

	const data = [{ key: 'Example', value: 70, color: 'var(--color-success)' }];
	var $$exports = { data };

	ArcChart($$anchor, {
		get data() {
			return data;
		},
		key: 'key',
		value: 'value',
		maxValue: 100,
		range: [-90, 90],
		outerRadius: 80,
		innerRadius: -20,
		cornerRadius: 10,
		props: { group: { y: 40 } },
		height: 120
	});

	return $.pop($$exports);
}