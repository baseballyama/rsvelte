import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding } from 'layerchart';
import { scaleTime } from 'd3-scale';

export default function Radial_horizontal_duration($$anchor, $$props) {
	$.push($$props, true);

	const durationData = [
		{
			category: 'One',
			start: new Date('2021-01-01'),
			end: new Date('2021-03-01')
		},

		{
			category: 'One',
			start: new Date('2021-04-01'),
			end: new Date('2021-08-15')
		},

		{
			category: 'Two',
			start: new Date('2021-03-01'),
			end: new Date('2021-06-01')
		},

		{
			category: 'Two',
			start: new Date('2021-08-01'),
			end: new Date('2021-10-01')
		},

		{
			category: 'Three',
			start: new Date('2021-02-01'),
			end: new Date('2021-07-01')
		},

		{
			category: 'Four',
			start: new Date('2021-06-09'),
			end: new Date('2021-09-01')
		},

		{
			category: 'Four',
			start: new Date('2021-10-01'),
			end: new Date('2021-12-15')
		},

		{
			category: 'Five',
			start: new Date('2021-02-01'),
			end: new Date('2021-04-15')
		},

		{
			category: 'Five',
			start: new Date('2021-10-01'),
			end: new Date('2021-12-31')
		}
	];

	const data = durationData;
	var $$exports = { data };

	{
		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
		};

		let $0 = $.derived(scaleTime);
		let $1 = $.derived(() => defaultChartPadding({ top: 15, bottom: 15 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: ['start', 'end'],
			get xScale() {
				return $.get($0);
			},
			y: 'category',
			xDomain: [null, null],
			xNice: false,
			yRange: ({ height }) => [height / 5, height / 2],
			c: 'category',
			cRange: [
				'var(--color-success)',
				'var(--color-danger)',
				'var(--color-warning)',
				'var(--color-info)',
				'var(--color-secondary)'
			],
			radial: true,
			orientation: 'horizontal',
			props: {
				xAxis: { format: 'month' },
				tooltip: { context: { mode: 'bounds' } }
			},

			get padding() {
				return $.get($1);
			},
			height: 400,
			tooltip,
			$$slots: { tooltip: true }
		});
	}

	return $.pop($$exports);
}