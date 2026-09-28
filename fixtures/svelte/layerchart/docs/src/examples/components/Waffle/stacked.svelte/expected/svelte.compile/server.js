import * as $ from 'svelte/internal/server';
import { Chart, Tooltip, Waffle } from 'layerchart';
import { sum } from 'd3-array';
import { createDateSeries } from '$lib/utils/data.js';

export default function Stacked($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 6,
			min: 200,
			max: 1200,
			value: 'integer',
			keys: ['apples', 'bananas', 'cherries', 'grapes']
		}).map((d, i) => ({
			...d,
			period: `Q${i % 4 + 1} '${(20 + Math.floor(i / 4)) % 100}`
		}));

		{
			function marks($$renderer, { context }) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(context.series.visibleSeries);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let s = each_array[$$index];

					Waffle($$renderer, { seriesKey: s.key, unit: 50, tooltip: true });
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
									$$renderer.push(`<!---->${$.escape(data.period)}`);
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
				x: 'period',
				bandPadding: 0.2,
				yNice: true,
				yBaseline: 0,
				series: [
					{ key: 'apples', color: 'var(--color-apples)' },
					{ key: 'bananas', color: 'var(--color-bananas)' },
					{ key: 'cherries', color: 'var(--color-cherries)' },
					{ key: 'grapes', color: 'var(--color-grapes)' }
				],
				padding: { left: 36, bottom: 40, top: 8, right: 8 },
				tooltipContext: { mode: 'band' },
				height: 400,
				rule: true,
				grid: true,
				legend: true,
				marks,
				tooltip,
				$$slots: { marks: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}