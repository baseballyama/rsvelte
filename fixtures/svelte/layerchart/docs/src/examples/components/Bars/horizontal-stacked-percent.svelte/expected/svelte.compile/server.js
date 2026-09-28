import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { stackOffsetExpand } from 'd3-shape';
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

export default function Horizontal_stacked_percent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const colorKeys = [...new Set(longData.map((x) => x.fruit))];

		const keyColors = [
			'var(--color-info)',
			'var(--color-success)',
			'var(--color-warning)',
			'var(--color-danger)'
		];

		const data = groupStackData(longData, { xKey: 'year', stackBy: 'fruit', offset: stackOffsetExpand });

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'bottom',
							grid: true,
							rule: true,
							format: 'percentRound'
						});

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
												label: d.fruit,
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
											format: 'percentRound',
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