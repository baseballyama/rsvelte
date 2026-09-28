import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArcChart } from 'layerchart';

export default function Radius_percent($$anchor, $$props) {
	$.push($$props, true);

	const data = [{ key: 'Example', value: 70 }];
	var $$exports = { data };

	ArcChart($$anchor, {
		get data() {
			return data;
		},
		key: 'key',
		value: 'value',
		maxValue: 100,
		innerRadius: 0.8,
		trackOuterRadius: 0.95,
		trackInnerRadius: 0.9,
		cornerRadius: 10,
		height: 160
	});

	return $.pop($$exports);
}