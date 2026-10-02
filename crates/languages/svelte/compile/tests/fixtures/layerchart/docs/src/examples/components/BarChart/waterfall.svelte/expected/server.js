import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding, Line, Text, Tooltip } from 'layerchart';
import { format } from '@layerstack/utils';

export default function Waterfall($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const rawData = [
			{ label: 'Product Revenue', value: 420000 },
			{ label: 'Services Revenue', value: 210000 },
			{ label: 'Fixed Costs', value: -170000 },
			{ label: 'Variable Costs', value: -140000 }
		];

		let runningTotal = 0;

		const items = rawData.map((d) => {
			const start = runningTotal;

			runningTotal += d.value;

			return {
				...d,
				start,
				end: runningTotal,
				type: d.value >= 0 ? 'increase' : 'decrease'
			};
		});

		const data = [
			...items,
			{
				label: 'Total',
				value: runningTotal,
				start: 0,
				end: runningTotal,
				type: 'total'
			}
		];

		{
			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.label)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tooltip.List) {
							$$renderer.push('<!--[-->');

							Tooltip.List($$renderer, {
								children: ($$renderer) => {
									if (data.type === 'total' || data.start === 0) {
										$$renderer.push('<!--[0-->');

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: 'Value',
												value: data.end,
												format: 'currencyRound',
												valueAlign: 'right'
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: 'Start',
												value: data.start,
												format: 'currencyRound',
												valueAlign: 'right'
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: 'Change',
												value: `${data.value >= 0 ? '+' : ''}${$.stringify(format(data.value, 'currencyRound'))}`,
												valueAlign: 'right'
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: 'End',
												value: data.end,
												format: 'currencyRound',
												valueAlign: 'right'
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
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

			function aboveMarks($$renderer, { context }) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(data);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let d = each_array[i];
					const bandLeft = context.xScale(d.label);
					const bandCenter = bandLeft + context.xScale.bandwidth() / 2;
					const bandRight = bandLeft + context.xScale.bandwidth();
					const isNegative = d.value < 0;

					if (i < data.length - 1) {
						$$renderer.push('<!--[0-->');

						Line($$renderer, {
							x1: bandRight,
							x2: context.xScale(data[i + 1].label),
							y1: context.yScale(d.end),
							y2: context.yScale(d.end),
							stroke: 'currentColor',
							dashArray: [4, 3],
							strokeWidth: 1,
							opacity: 0.3
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					Text($$renderer, {
						x: bandCenter,
						y: context.yScale(d.end),
						dy: 2 * (isNegative ? 1 : -1),
						verticalAnchor: isNegative ? 'start' : 'end',
						textAnchor: 'middle',
						class: 'text-xs fill-current',
						value: format(d.value, 'metric')
					});

					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]-->`);
			}

			BarChart($$renderer, {
				data,
				x: 'label',
				y: ['start', 'end'],
				yDomain: [0, null],
				yNice: true,
				c: 'type',
				cDomain: ['increase', 'decrease', 'total'],
				cRange: [
					'var(--color-success)',
					'var(--color-danger)',
					'var(--color-info)'
				],
				bandPadding: 0.3,
				labels: false,
				rule: true,
				props: {
					yAxis: { format: 'metric' },
					bars: { rounded: 'all', radius: 2, strokeWidth: 0 }
				},
				padding: defaultChartPadding({ top: 24 }),
				height: 300,
				tooltip,
				aboveMarks,
				$$slots: { tooltip: true, aboveMarks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}