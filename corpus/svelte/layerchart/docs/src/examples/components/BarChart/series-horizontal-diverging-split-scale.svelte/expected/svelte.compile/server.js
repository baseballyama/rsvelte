import * as $ from 'svelte/internal/server';
import { Chart, Rect, Text, Tooltip } from 'layerchart';
import { scaleBand, scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import { format } from '@layerstack/utils';
import { RangeField } from 'svelte-ux';

export default function Series_horizontal_diverging_split_scale($$renderer, $$props) {
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

		// Shared max so both sides use the same scale and remain comparable
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
					const mid = context.width / 2;
					const xMale = scaleLinear().domain([0, maxValue]).range([mid - gap / 2, labelWidth]);
					const xFemale = scaleLinear().domain([0, maxValue]).range([mid + gap / 2, context.width - labelWidth]);

					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(data);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let d = each_array[$$index];
						const y = context.yScale(d.age);
						const h = context.yScale.bandwidth?.() ?? 0;

						Rect($$renderer, {
							x: xMale(d.male),
							y,
							width: xMale(0) - xMale(d.male),
							height: h,
							corners: [4, 0, 0, 4],
							fill: 'var(--color-primary)'
						});

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							x: xMale(d.male) - 4,
							y: y + h / 2,
							value: format(d.male, 'metric'),
							textAnchor: 'end',
							verticalAnchor: 'middle',
							fontSize: 12,
							class: 'fill-surface-content/50'
						});

						$$renderer.push(`<!----> `);

						Rect($$renderer, {
							x: xFemale(0),
							y,
							width: xFemale(d.female) - xFemale(0),
							height: h,
							corners: [0, 4, 4, 0],
							fill: 'var(--color-secondary)'
						});

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							x: xFemale(d.female) + 4,
							y: y + h / 2,
							value: format(d.female, 'metric'),
							textAnchor: 'start',
							verticalAnchor: 'middle',
							fontSize: 12,
							class: 'fill-surface-content/50'
						});

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							x: mid,
							y: y + h / 2,
							value: d.age,
							textAnchor: 'middle',
							verticalAnchor: 'middle',
							fontSize: 12,
							class: 'font-medium fill-surface-content'
						});

						$$renderer.push(`<!---->`);
					}

					$$renderer.push(`<!--]-->`);
				}

				function tooltip($$renderer) {
					{
						function children($$renderer, { data }) {
							if (Tooltip.Header) {
								$$renderer.push('<!--[-->');

								Tooltip.Header($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Age: ${$.escape(data.age)}`);
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
												value: data.male
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
												value: data.female
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

				Chart($$renderer, {
					data,
					x: () => 0,
					y: 'age',
					yScale: scaleBand().padding(0.4),
					yDomain: data.map((d) => d.age),
					axis: false,
					grid: false,
					tooltipContext: { mode: 'band' },
					highlight: { area: { class: 'fill-surface-content/10' } },
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