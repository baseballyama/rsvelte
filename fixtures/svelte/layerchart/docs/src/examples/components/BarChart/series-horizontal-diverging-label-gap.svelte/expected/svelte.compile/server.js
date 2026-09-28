import * as $ from 'svelte/internal/server';
import { BarChart, Bars, Group, Labels, Text, Tooltip } from 'layerchart';
import { max, sum } from 'd3-array';
import { format } from '@layerstack/utils';
import { RangeField } from 'svelte-ux';

export default function Series_horizontal_diverging_label_gap($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Mock world population demographics data
		const data = [
			{ age: '0-4', male: 200, female: 190 },
			{ age: '5-9', male: 180, female: 175 },
			{ age: '10-14', male: 170, female: 165 },
			{ age: '15-19', male: 160, female: 155 },
			{ age: '20-24', male: 150, female: 145 },
			{ age: '25-29', male: 140, female: 135 },
			{ age: '30-34', male: 130, female: 125 },
			{ age: '35-39', male: 120, female: 115 },
			{ age: '40-44', male: 110, female: 105 },
			{ age: '45-49', male: 100, female: 95 },
			{ age: '50-54', male: 90, female: 85 },
			{ age: '55-59', male: 80, female: 75 },
			{ age: '60-64', male: 70, female: 65 },
			{ age: '65-69', male: 60, female: 55 },
			{ age: '70-74', male: 50, female: 45 },
			{ age: '75-79', male: 40, female: 35 },
			{ age: '80-84', male: 30, female: 25 },
			{ age: '85+', male: 20, female: 15 }
		];

		const totalPopulation = sum(data, (d) => d.male + d.female);
		const maxValue = max(data, (d) => Math.max(d.male, d.female)) ?? 0;
		const labelWidth = 32;
		let gap = 50;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="mb-4">`);

			RangeField($$renderer, {
				label: 'Gap',
				min: 0,
				max: 200,
				get value() {
					return gap;
				},

				set value($$value) {
					gap = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			{
				function marks($$renderer, { context }) {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(context.series.visibleSeries);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let s = each_array[$$index];

						Group($$renderer, {
							x: gap / 2 * (s.key === 'male' ? -1 : 1),
							children: ($$renderer) => {
								Bars($$renderer, { seriesKey: s.key, rounded: 'edge', radius: 4, strokeWidth: 1 });
								$$renderer.push(`<!----> `);

								Labels($$renderer, {
									seriesKey: s.key,
									placement: 'outside',
									format: (v) => format(Math.abs(v), 'metric'),
									class: 'fill-surface-content/50 stroke-none'
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]--> `);

					Text($$renderer, {
						data,
						x: () => 0,
						y: 'age',
						value: 'age',
						dy: (context.yScale.bandwidth?.() ?? 0) / 2,
						textAnchor: 'middle',
						verticalAnchor: 'middle',
						fontSize: 12,
						class: 'font-medium fill-surface-content'
					});

					$$renderer.push(`<!---->`);
				}

				function tooltip($$renderer, { context }) {
					{
						function children($$renderer, { data }) {
							if (Tooltip.Header) {
								$$renderer.push('<!--[-->');

								Tooltip.Header($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Age: ${$.escape(context.y(data))}`);
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
										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: 'male',
												color: 'var(--color-primary)',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(format(data.male))} <span class="text-xs text-surface-content/50">(${$.escape(format(data.male / totalPopulation, 'percent'))})</span>`);
												},
												$$slots: { default: true }
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
												label: 'female',
												color: 'var(--color-secondary)',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(format(data.female))} <span class="text-xs text-surface-content/50">(${$.escape(format(data.female / totalPopulation, 'percent'))})</span>`);
												},
												$$slots: { default: true }
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
					y: 'age',
					orientation: 'horizontal',
					xDomain: [-maxValue, maxValue],
					xNice: false,
					axis: false,
					grid: false,
					xPadding: [gap / 2 + labelWidth, gap / 2 + labelWidth],
					series: [
						{
							key: 'male',
							value: (d) => -d.male,
							color: 'var(--color-primary)'
						},

						{
							key: 'female',
							value: (d) => d.female,
							color: 'var(--color-secondary)'
						}
					],
					height: 600,
					marks,
					tooltip,
					$$slots: { marks: true, tooltip: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}