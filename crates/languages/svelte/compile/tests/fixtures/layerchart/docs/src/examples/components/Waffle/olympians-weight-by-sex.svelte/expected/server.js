import * as $ from 'svelte/internal/server';
import { Chart, Tooltip, Waffle, Legend } from 'layerchart';
import { rollup, sum } from 'd3-array';
import { getOlympians } from '$lib/data.remote';

const olympians = await getOlympians();

export default function Olympians_weight_by_sex($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Bin athletes by 10kg weight intervals × sex, one row per bin with a
		// column per sex — wide format feeds the chart's series-based stacking.
		const data = Array.from(rollup(olympians.filter((d) => d.weight && d.sex), (v) => v.length, (d) => Math.floor(d.weight / 10) * 10, (d) => d.sex), ([weight, bySex]) => ({ weight, ...Object.fromEntries(bySex) })).sort((a, b) => a.weight - b.weight);

		{
			function legend($$renderer) {
				Legend($$renderer, {
					variant: 'swatches',
					placement: 'top-right',
					orientation: 'horizontal'
				});
			}

			function marks($$renderer, { context }) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(context.series.visibleSeries);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let s = each_array[$$index];

					Waffle($$renderer, { seriesKey: s.key, unit: 10, tooltip: true });
				}

				$$renderer.push(`<!--]-->`);
			}

			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.weight)}–${$.escape(data.weight + 9)} kg`);
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
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(context.series.visibleSeries);

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let s = each_array_1[$$index_1];

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: s.key,
												value: data[s.key],
												color: s.color,
												format: 'integer',
												valueAlign: 'right'
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]--> `);

									if (Tooltip.Separator) {
										$$renderer.push('<!--[-->');
										Tooltip.Separator($$renderer, {});
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'total',
											value: sum(context.series.visibleSeries, (s) => Number(data[s.key]) || 0),
											format: 'integer',
											valueAlign: 'right'
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
				x: 'weight',
				bandPadding: 0.2,
				yNice: true,
				yBaseline: 0,
				series: [
					{ key: 'female', color: 'var(--color-warning)' },
					{ key: 'male', color: 'var(--color-info)' }
				],
				padding: { left: 36, bottom: 24, top: 8, right: 8 },
				tooltipContext: { mode: 'band' },
				height: 400,
				rule: true,
				grid: true,
				legend,
				marks,
				tooltip,
				$$slots: { legend: true, marks: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}