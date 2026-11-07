import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding, Tooltip } from 'layerchart';
import { scaleTime } from 'd3-scale';
import { Duration } from 'svelte-ux';
import { getUsEvents } from '$lib/data.remote';

const data = await getUsEvents();

export default function Duration_bars_dense($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
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

			BarChart($$renderer, {
				data,
				x: ['startDate', 'endDate'],
				xScale: scaleTime(),
				y: 'event',
				axis: 'x',
				grid: { x: true, y: false, bandAlign: 'between' },
				rule: false,
				orientation: 'horizontal',
				padding: defaultChartPadding({ right: 25 }),
				height: 300,
				tooltip,
				$$slots: { tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}