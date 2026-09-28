import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { sum } from 'd3-array';

import {
	Bars,
	Axis,
	Chart,
	Highlight,
	Layer,
	Tooltip,
	groupStackData,
	defaultChartPadding
} from 'layerchart';

import { longData } from '$lib/utils/data.js';

export default function Horizontal_grouped_and_stacked($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const colorKeys = [...new Set(longData.map((x) => x.fruit))];

		const keyColors = [
			'var(--color-info)',
			'var(--color-success)',
			'var(--color-warning)',
			'var(--color-danger)'
		];

		const data = groupStackData(longData, { xKey: 'year', groupBy: 'basket', stackBy: 'fruit' });

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left', rule: true });
						$$renderer.push(`<!----> `);
						Bars($$renderer, { strokeWidth: 1 });
						$$renderer.push(`<!----> `);
						Highlight($$renderer, { area: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.year)}`);
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

									const each_array = $.ensure_array_like(data.data);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let d = each_array[$$index];

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: `${$.stringify(d.fruit)} (basket ${$.stringify(d.basket)})`,
												value: d.value,
												color: context.cScale?.(d.fruit),
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
											value: sum([...data.data], (d) => d.value),
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
				x: 'values',
				xNice: true,
				y: 'year',
				yScale: scaleBand().paddingInner(0.4).paddingOuter(0.2),
				c: 'fruit',
				cDomain: colorKeys,
				cRange: keyColors,
				y1: 'basket',
				y1Scale: scaleBand().padding(0.1),
				y1Domain: [1, 2],
				y1Range: ({ yScale }) => [0, yScale.bandwidth?.()],
				padding: defaultChartPadding({ left: 32, bottom: 20, right: 15 }),
				tooltipContext: { mode: 'band' },
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}