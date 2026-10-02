import * as $ from 'svelte/internal/server';
import { sum } from 'd3-array';
import { cls } from '@layerstack/tailwind';
import { format } from '@layerstack/utils';
import { Arc, Chart, Group, Layer, Pie, Text, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Tooltip_with_arcs_slot($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
		const dataSum = $.derived(() => sum(data, (d) => d.value));

		const keyColors = [
			'var(--color-info)',
			'var(--color-success)',
			'var(--color-warning)',
			'var(--color-danger)'
		];

		const keyClasses = [
			{ shape: 'fill-info', content: 'fill-info-content' },
			{ shape: 'fill-success', content: 'fill-success-content' },
			{ shape: 'fill-warning', content: 'fill-warning-content' },
			{ shape: 'fill-danger', content: 'fill-danger-content' }
		];

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						{
							function children($$renderer, { arcs }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(arcs);

								for (let index = 0, $$length = each_array.length; index < $$length; index++) {
									let arc = each_array[index];
									const colors = keyClasses[index];
									const isHighlighted = context.tooltip.data?.date === arc.data.date;
									const isFaded = context.tooltip.data != null && context.tooltip.data.date !== arc.data.date;

									Group($$renderer, {
										onpointerenter: (e) => context.tooltip.show(e, arc.data),
										onpointermove: (e) => context.tooltip.show(e, arc.data),
										onpointerleave: (e) => context.tooltip.hide(),
										preventTouchMove: true,
										class: cls(isFaded && 'opacity-50'),
										children: ($$renderer) => {
											{
												function children($$renderer, { getArcTextProps }) {
													Text($$renderer, $.spread_props([
														{ value: format(arc.data.value / dataSum(), 'percent') },
														getArcTextProps('centroid'),
														{ class: cls('text-base', colors.content) }
													]));
												}

												Arc($$renderer, {
													startAngle: arc.startAngle,
													endAngle: arc.endAngle,
													padAngle: arc.padAngle,
													class: colors.shape,
													offset: isHighlighted ? 16 : 0,
													children,
													$$slots: { default: true }
												});
											}
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]-->`);
							}

							Pie($$renderer, { children, $$slots: { default: true } });
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');
							Tooltip.Header($$renderer, { value: data.date, format: 'day' });
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
											label: 'value',
											value: data.value,
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
											label: 'percent',
											value: data.value / dataSum(),
											format: 'percent',
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
				x: 'value',
				c: 'date',
				cRange: keyColors,
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}