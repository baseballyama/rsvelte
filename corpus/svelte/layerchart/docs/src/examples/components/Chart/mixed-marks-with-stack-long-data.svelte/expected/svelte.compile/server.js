import * as $ from 'svelte/internal/server';
import { Axis, Bars, Chart, Highlight, Layer, Legend, Spline, Tooltip } from 'layerchart';
import { sum } from 'd3-array';

export default function Mixed_marks_with_stack_long_data($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// One row per month × fruit, with the category in a column rather than a column per category
		const data = [
			{ month: 'Jan', fruit: 'apples', value: 320 },
			{ month: 'Jan', fruit: 'bananas', value: 180 },
			{ month: 'Jan', fruit: 'cherries', value: 90 },
			{ month: 'Feb', fruit: 'apples', value: 280 },
			{ month: 'Feb', fruit: 'bananas', value: 220 },
			{ month: 'Feb', fruit: 'cherries', value: 120 },
			{ month: 'Mar', fruit: 'apples', value: 410 },
			{ month: 'Mar', fruit: 'bananas', value: 190 },
			{ month: 'Mar', fruit: 'cherries', value: 140 },
			{ month: 'Apr', fruit: 'apples', value: 360 },
			{ month: 'Apr', fruit: 'bananas', value: 260 },
			{ month: 'Apr', fruit: 'cherries', value: 110 },
			{ month: 'May', fruit: 'apples', value: 450 },
			{ month: 'May', fruit: 'bananas', value: 240 },
			{ month: 'May', fruit: 'cherries', value: 160 },
			{ month: 'Jun', fruit: 'apples', value: 520 },
			{ month: 'Jun', fruit: 'bananas', value: 210 },
			{ month: 'Jun', fruit: 'cherries', value: 180 }
		];

		// The target belongs to the month rather than to any fruit, so it's the line's own data
		const targets = [
			{ month: 'Jan', target: 800 },
			{ month: 'Feb', target: 850 },
			{ month: 'Mar', target: 950 },
			{ month: 'Apr', target: 1050 },
			{ month: 'May', target: 1150 },
			{ month: 'Jun', target: 1250 }
		];

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true, format: 'metric' });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Bars($$renderer, { radius: 2, rounded: 'edge', strokeWidth: 1 });
						$$renderer.push(`<!----> `);

						Spline($$renderer, {
							data: targets,
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
					function children($$renderer, { data: hovered }) {
						const rows = data.filter((d) => d.month === hovered.month);

						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(hovered.month)}`);
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

									const each_array = $.ensure_array_like(rows);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let row = each_array[$$index];

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: row.fruit,
												value: row.value,
												color: context.cGet(row),
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
											value: sum(rows, (d) => d.value),
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
											value: targets.find((t) => t.month === hovered.month)?.target,
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
				y: 'value',
				c: 'fruit',
				cRange: [
					'var(--color-apples)',
					'var(--color-bananas)',
					'var(--color-cherries)'
				],
				bandPadding: 0.3,
				yNice: true,
				padding: { left: 40, bottom: 24, top: 8, right: 8 },
				tooltipContext: { mode: 'band' },
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}