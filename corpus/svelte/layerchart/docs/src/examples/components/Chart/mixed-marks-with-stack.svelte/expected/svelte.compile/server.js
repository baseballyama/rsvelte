import * as $ from 'svelte/internal/server';
import { Axis, Bars, Chart, Highlight, Layer, Legend, Spline, Tooltip } from 'layerchart';
import { sum } from 'd3-array';

export default function Mixed_marks_with_stack($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{
				month: 'Jan',
				apples: 320,
				bananas: 180,
				cherries: 90,
				target: 800
			},

			{
				month: 'Feb',
				apples: 280,
				bananas: 220,
				cherries: 120,
				target: 850
			},

			{
				month: 'Mar',
				apples: 410,
				bananas: 190,
				cherries: 140,
				target: 950
			},

			{
				month: 'Apr',
				apples: 360,
				bananas: 260,
				cherries: 110,
				target: 1050
			},

			{
				month: 'May',
				apples: 450,
				bananas: 240,
				cherries: 160,
				target: 1150
			},

			{
				month: 'Jun',
				apples: 520,
				bananas: 210,
				cherries: 180,
				target: 1250
			}
		];

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true, format: 'metric' });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(context.series.visibleSeries);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let s = each_array[$$index];

							Bars($$renderer, { seriesKey: s.key, radius: 2, rounded: 'edge', strokeWidth: 1 });
						}

						$$renderer.push(`<!--]--> `);

						Spline($$renderer, {
							y: 'target',
							stroke: 'var(--color-surface-content)',
							class: 'stroke-2 [stroke-dasharray:4_3]'
						});

						$$renderer.push(`<!----> `);
						Highlight($$renderer, { area: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Legend($$renderer, { placement: 'top-right' });
				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.month)}`);
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
											value: sum(context.series.visibleSeries, (s) => data[s.key]),
											format: 'integer',
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
											label: 'target',
											value: data.target,
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
				x: 'month',
				series: [
					{ key: 'apples', color: 'var(--color-apples)' },
					{ key: 'bananas', color: 'var(--color-bananas)' },
					{ key: 'cherries', color: 'var(--color-cherries)' }
				],
				bandPadding: 0.3,
				yNice: true,
				padding: { left: 40, bottom: 24, top: 20, right: 8 },
				tooltipContext: { mode: 'band' },
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}