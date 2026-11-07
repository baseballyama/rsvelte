import * as $ from 'svelte/internal/server';
import { scaleThreshold } from 'd3-scale';
import { range } from 'd3-array';
import { Calendar, Chart, Group, Layer, Text, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { endOfInterval } from '@layerstack/utils';

export default function Multiple_years($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 365 * 4, min: 10, max: 100, value: 'integer' }).map((d) => {
			return {
				...d,
				value: Math.random() > 0.2 ? d.value : null // set null for some values
			};
		});

		Chart($$renderer, {
			data,
			x: 'date',
			c: 'value',
			cScale: scaleThreshold().unknown('transparent'),
			cDomain: [25, 50, 75],
			cRange: [
				'var(--color-primary-100)',
				'var(--color-primary-300)',
				'var(--color-primary-500)',
				'var(--color-primary-700)'
			],
			padding: { top: 20, left: 20 },
			height: 450,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(range(2021, 2024));

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let year = each_array[i];
							const start = new Date(year, 0, 1);
							const end = endOfInterval('year', start);

							Group($$renderer, {
								y: 140 * i,
								children: ($$renderer) => {
									Text($$renderer, {
										value: year,
										class: 'text-xs',
										rotate: 270,
										x: -20,
										y: 16 * 7 / 2,
										textAnchor: 'middle',
										verticalAnchor: 'start'
									});

									$$renderer.push(`<!----> `);
									Calendar($$renderer, { start, end, tooltip: true, cellSize: 16, monthPath: true });
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
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

						if (data.value != null) {
							$$renderer.push('<!--[0-->');

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
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
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
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}