import 'svelte/internal/disclose-version';
import { getDailyTemperatures } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';
import { flatGroup } from 'd3-array';

const data = await getDailyTemperatures();

export default function Large_series($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		let $0 = $.derived(() => flatGroup(data, (d) => d.year).map(([year, data]) => {
			return {
				key: year.toString(),
				data,
				color: year >= 2023
					? 'var(--color-primary)'
					: 'var(--color-surface-content)',
				props: { opacity: year === 2024 ? 1 : year === 2023 ? 0.5 : 0.1 }
			};
		}));

		let $1 = $.derived(() => defaultChartPadding({ left: 30 }));

		LineChart($$anchor, {
			x: 'date',
			y: 'value',
			yDomain: null,
			props: {
				spline: { class: 'stroke' },
				xAxis: { format: 'month' },
				yAxis: { ticks: 4, format: (v) => v + '° F' },
				highlight: { points: false },
				tooltip: { context: { mode: 'manual' } }
			},

			get series() {
				return $.get($0);
			},

			get padding() {
				return $.get($1);
			},
			height: 500
		});
	}

	return $.pop($$exports);
}