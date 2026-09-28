import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArcChart } from 'layerchart';

export default function Radius_fixed($$anchor, $$props) {
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
		outerRadius: 80,
		innerRadius: 60,
		trackOuterRadius: 75,
		trackInnerRadius: 65,
		cornerRadius: 10,
		height: 160
	});

	return $.pop($$exports);
}