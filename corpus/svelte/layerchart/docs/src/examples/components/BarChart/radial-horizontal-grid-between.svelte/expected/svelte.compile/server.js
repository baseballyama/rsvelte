import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding } from 'layerchart';

export default function Radial_horizontal_grid_between($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{ browser: 'chrome', visitors: 200 },
			{ browser: 'firefox', visitors: 150 },
			{ browser: 'safari', visitors: 120 },
			{ browser: 'edge', visitors: 100 },
			{ browser: 'other', visitors: 90 }
		];

		BarChart($$renderer, {
			data,
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
			grid: { bandAlign: 'between' },
			padding: defaultChartPadding({ top: 15, bottom: 15 }),
			height: 400
		});

		$.bind_props($$props, { data });
	});
}