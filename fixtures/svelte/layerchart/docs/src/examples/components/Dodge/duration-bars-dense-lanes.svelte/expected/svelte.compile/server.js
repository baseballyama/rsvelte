import * as $ from 'svelte/internal/server';
import { Chart, Dodge, Rect, Tooltip } from 'layerchart';
import { Duration } from 'svelte-ux';
import { getUsEvents } from '$lib/data.remote';

const data = await getUsEvents();

export default function Duration_bars_dense_lanes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function marks($$renderer, { context }) {
				const rowHeight = 40;
				const rowPadding = 10;
				const barHeight = rowHeight - rowPadding;
				const startX = (d) => context.xScale(d.startDate);
				const endX = (d) => context.xScale(d.endDate);

				{
					function children($$renderer, { items }) {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(items);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let { data: ev, y, index } = each_array[$$index];

							Rect($$renderer, {
								x: startX(ev),
								y: y - barHeight / 2,
								width: endX(ev) - startX(ev),
								height: barHeight,
								rx: 3,
								class: 'fill-primary',
								onpointermove: (e) => context.tooltip.show(e, ev),
								onpointerleave: context.tooltip.hide
							});
						}

						$$renderer.push(`<!--]-->`);
					}

					Dodge($$renderer, {
						data,
						axis: 'y',
						anchor: 'top',
						padding: 2,
						rx: (d) => (endX(d) - startX(d)) / 2,
						ry: rowHeight / 2,
						position: (d) => (startX(d) + endX(d)) / 2,
						children,
						$$slots: { default: true }
					});
				}
			}

			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.event)}`);
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
											label: 'start',
											value: data.startDate,
											valueAlign: 'right',
											format: 'day'
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
											label: 'end',
											value: data.endDate,
											valueAlign: 'right',
											format: 'day'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

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
											label: 'duration',
											valueAlign: 'right',
											children: ($$renderer) => {
												Duration($$renderer, { start: data.startDate, end: data.endDate, totalUnits: 2 });
											},
											$$slots: { default: true }
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
						Tooltip.Root($$renderer, { context, children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			Chart($$renderer, {
				data,
				x: ['startDate', 'endDate'],
				xNice: true,
				padding: { top: 12, bottom: 24, left: 10, right: 25 },
				height: 300,
				axis: 'x',
				grid: { x: true },
				props: { tooltip: { context: { mode: 'bounds' } } },
				marks,
				tooltip,
				$$slots: { marks: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}