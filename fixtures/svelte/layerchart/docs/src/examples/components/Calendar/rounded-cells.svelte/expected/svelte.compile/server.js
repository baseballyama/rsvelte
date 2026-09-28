import * as $ from 'svelte/internal/server';
import { scaleThreshold } from 'd3-scale';
import { timeYear } from 'd3-time';
import { Calendar, Chart, Layer, Rect, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { endOfInterval } from '@layerstack/utils';

export default function Rounded_cells($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const now = new Date();
		const firstDayOfYear = timeYear.floor(now);
		const lastDayOfYear = endOfInterval('year', now);

		const data = createDateSeries({ count: 365 * 4, min: 10, max: 100, value: 'integer' }).map((d) => {
			return {
				...d,
				value: Math.random() > 0.2 ? d.value : null // set null for some values
			};
		});

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						{
							function children($$renderer, { cells, cellSize }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(cells);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let cell = each_array[$$index];
									const padding = 1;

									Rect($$renderer, {
										x: cell.x + padding,
										y: cell.y + padding,
										width: cellSize[0] - padding * 2,
										height: cellSize[1] - padding * 2,
										rx: 4,
										fill: cell.color ?? 'rgb(0 0 0 / 5%)',
										onpointermove: (e) => context.tooltip?.show(e, cell.data),
										onpointerleave: (e) => context.tooltip?.hide()
									});
								}

								$$renderer.push(`<!--]-->`);
							}

							Calendar($$renderer, {
								start: firstDayOfYear,
								end: lastDayOfYear,
								children,
								$$slots: { default: true }
							});
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
			}

			Chart($$renderer, {
				data,
				x: 'date',
				c: 'value',
				cScale: scaleThreshold(),
				cDomain: [25, 50, 75],
				cRange: [
					'var(--color-primary-100)',
					'var(--color-primary-300)',
					'var(--color-primary-500)',
					'var(--color-primary-700)'
				],
				padding: { top: 20 },
				height: 140,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}