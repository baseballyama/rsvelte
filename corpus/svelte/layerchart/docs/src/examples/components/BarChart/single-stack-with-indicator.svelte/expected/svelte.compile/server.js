import * as $ from 'svelte/internal/server';
import { Axis, BarChart, Polygon, Text, Tooltip } from 'layerchart';

export let tags = ['gauge'];

export default function Single_stack_with_indicator($$renderer, $$props) {
	const data = [
		{ label: 'Severe thinness', start: 15, end: 16 },
		{ label: 'Thinness', start: 16, end: 18.5 },
		{ label: 'Normal', start: 18.5, end: 25 },
		{ label: 'Overweight', start: 25, end: 30 },
		{ label: 'Obese', start: 30, end: 35 },
		{ label: 'Severe obese', start: 35, end: 40 }
	];

	{
		function axis($$renderer, { context }) {
			{
				function tickLabel($$renderer, { props }) {
					Text($$renderer, $.spread_props([
						props,
						{ textAnchor: props.value === '40' ? 'end' : 'start' }
					]));
				}

				Axis($$renderer, {
					placement: 'bottom',
					tickLength: 0,
					ticks: [15, 16, 18.5, 25, 30, 35, 40],
					tickLabel,
					$$slots: { tickLabel: true }
				});
			}
		}

		function aboveMarks($$renderer, { context }) {
			Polygon($$renderer, {
				cx: context.xScale(26.5),
				cy: -3,
				r: 6,
				points: 3,
				rotate: 90,
				class: 'fill-black stroke-white dark:fill-white dark:stroke-black'
			});
		}

		function tooltip($$renderer, { context }) {
			{
				function children($$renderer, { data }) {
					if (Tooltip.List) {
						$$renderer.push('<!--[-->');

						Tooltip.List($$renderer, {
							children: ($$renderer) => {
								if (Tooltip.Item) {
									$$renderer.push('<!--[-->');
									Tooltip.Item($$renderer, { label: 'Label:', value: data.label });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Tooltip.Item) {
									$$renderer.push('<!--[-->');

									Tooltip.Item($$renderer, {
										label: 'Range:',
										value: `${$.stringify(data.start)} - ${$.stringify(data.end)}`
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				if (Tooltip.Root) {
					$$renderer.push('<!--[-->');
					Tooltip.Root($$renderer, { children, $$slots: { default: true } });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		}

		BarChart($$renderer, {
			data,
			x: ['start', 'end'],
			y: (d) => 1,
			xBaseline: null,
			xNice: false,
			c: 'label',
			cRange: [
				'var(--color-blue-500)',
				'var(--color-blue-400)',
				'var(--color-teal-500)',
				'var(--color-yellow-500)',
				'var(--color-orange-500)',
				'var(--color-red-500)'
			],
			bandPadding: 0,
			padding: { top: 12, bottom: 12 },
			orientation: 'horizontal',
			props: { tooltip: { context: { mode: 'bounds' } } },
			height: 40,
			axis,
			aboveMarks,
			tooltip,
			$$slots: { axis: true, aboveMarks: true, tooltip: true }
		});
	}

	$.bind_props($$props, { data });
}