import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding, Tooltip } from 'layerchart';
import { scaleTime } from 'd3-scale';
import { timeMinute, timeDay } from 'd3-time';
import { Duration } from 'svelte-ux';
import { getRandomInteger } from '$lib/utils/data.js';

export default function Duration_bars($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const count = 10;
		const now = timeDay.floor(new Date());
		let lastStartDate = now;

		const data = Array.from({ length: count }).map((_, i) => {
			const startDate = timeMinute.offset(lastStartDate, getRandomInteger(0, 60));
			const endDate = timeMinute.offset(startDate, getRandomInteger(0, 60));

			lastStartDate = startDate;

			return { name: `Item ${i + 1}`, startDate, endDate };
		});

		{
			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.name)}`);
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
											format: { type: 'time', options: { variant: 'short' } }
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
											format: { type: 'time', options: { variant: 'short' } }
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
				y: 'name',
				grid: { x: false, y: true, bandAlign: 'between' },
				orientation: 'horizontal',
				padding: defaultChartPadding({ left: 36, right: 20 }),
				height: 300,
				tooltip,
				$$slots: { tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}