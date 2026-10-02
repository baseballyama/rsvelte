import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';

export default function Radial_horizontal_color_per_value($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ browser: 'chrome', visitors: 200 },
		{ browser: 'firefox', visitors: 150 },
		{ browser: 'safari', visitors: 120 },
		{ browser: 'edge', visitors: 100 },
		{ browser: 'other', visitors: 90 }
	];

	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ top: 15, bottom: 15 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: 'visitors',
			y: 'browser',
			yRange: ({ height }) => [height / 5, height / 2],
			c: 'browser',
			cRange: [
				'var(--color-primary)',
				'var(--color-danger)',
				'var(--color-warning)',
				'var(--color-success)',
				'var(--color-secondary)'
			],
			radial: true,
			orientation: 'horizontal',
			height: 400,
			get padding() {
				return $.get($0);
			}
		});
	}

	return $.pop($$exports);
}