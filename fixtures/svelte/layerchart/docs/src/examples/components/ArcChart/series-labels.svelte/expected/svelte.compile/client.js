import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArcChart } from 'layerchart';

export default function Series_labels($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ key: 'move', value: 400, maxValue: 1000, color: '#ef4444' },
		{ key: 'exercise', value: 20, maxValue: 30, color: '#a3e635' },
		{ key: 'stand', value: 10, maxValue: 12, color: '#22d3ee' }
	];

	var $$exports = { data };

	{
		let $0 = $.derived(() => data.map((d) => {
			return { key: d.key, data: [d], maxValue: d.maxValue, color: d.color };
		}));

		ArcChart($$anchor, {
			key: 'key',
			value: 'value',
			get series() {
				return $.get($0);
			},
			outerRadius: -25,
			innerRadius: -20,
			cornerRadius: 10,
			labels: {
				placement: 'middle',
				startOffset: '0%',
				value: 'key',
				class: 'fill-black pointer-events-none text-xs'
			},
			height: 180
		});
	}

	return $.pop($$exports);
}