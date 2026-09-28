import * as $ from 'svelte/internal/server';
import { BarChart, Spline, Tooltip, defaultChartPadding } from 'layerchart';
import { getAppleTicker } from '$lib/data.remote.js';

const data = await getAppleTicker();

export default function Compound_separate_scales_with_stacked_charts_and_overridden_marks($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="grid grid-stack p-4 border rounded-sm">`);

		BarChart($$renderer, {
			data,
			x: 'date',
			y: 'volume',
			yNice: true,
			axis: false,
			grid: false,
			props: {
				bars: { radius: 1, class: 'stroke-none fill-surface-content/10' }
			},
			padding: defaultChartPadding({ left: 25 }),
			height: 300
		});

		$$renderer.push(`<!----> `);

		{
			function marks($$renderer) {
				Spline($$renderer, { y: 'open', class: 'stroke-primary' });
				$$renderer.push(`<!----> `);
				Spline($$renderer, { y: 'close', class: 'stroke-secondary' });
				$$renderer.push(`<!---->`);
			}

			function tooltip($$renderer, { context }) {
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
										Tooltip.Item($$renderer, { label: 'open', value: data.open, format: 'currency' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'close', value: data.close, format: 'currency' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'high', value: data.high, format: 'currency' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'low', value: data.low, format: 'currency' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'volume', value: data.volume, format: 'integer' });
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
				x: 'date',
				y: ['open', 'close'],
				yNice: true,
				yDomain: null,
				height: 300,
				props: {
					xAxis: { ticks: 10, rule: true },
					tooltip: { context: { mode: 'band' } }
				},
				padding: defaultChartPadding({ left: 25 }),
				marks,
				tooltip,
				$$slots: { marks: true, tooltip: true }
			});
		}

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { data });
	});
}