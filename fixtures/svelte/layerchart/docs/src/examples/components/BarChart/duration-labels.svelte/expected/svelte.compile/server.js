import * as $ from 'svelte/internal/server';
import { BarChart, defaultChartPadding, Tooltip } from 'layerchart';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
import { scaleTime } from 'd3-scale';
import { format } from '@layerstack/utils';

export default function Duration_labels($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let placement = 'inside';

		const data = [
			{
				category: 'One',
				start: new Date('2021-01-01'),
				end: new Date('2021-03-01')
			},

			{
				category: 'One',
				start: new Date('2021-04-01'),
				end: new Date('2021-08-15')
			},

			{
				category: 'Two',
				start: new Date('2021-03-01'),
				end: new Date('2021-06-01')
			},

			{
				category: 'Two',
				start: new Date('2021-08-01'),
				end: new Date('2021-10-01')
			},

			{
				category: 'Three',
				start: new Date('2021-02-01'),
				end: new Date('2021-07-01')
			},

			{
				category: 'Four',
				start: new Date('2021-06-09'),
				end: new Date('2021-09-01')
			},

			{
				category: 'Four',
				start: new Date('2021-10-01'),
				end: new Date('2021-12-15')
			},

			{
				category: 'Five',
				start: new Date('2021-02-01'),
				end: new Date('2021-04-15')
			},

			{
				category: 'Five',
				start: new Date('2021-10-01'),
				end: new Date('2021-12-31')
			}
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Field($$renderer, {
				label: 'Placement',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						get value() {
							return placement;
						},

						set value($$value) {
							placement = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'inside',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Inside`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'outside',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Outside`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function tooltip($$renderer, { context }) {
					{
						function children($$renderer, { data }) {
							if (Tooltip.Header) {
								$$renderer.push('<!--[-->');

								Tooltip.Header($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(format(context.y(data)))}`);
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
											Tooltip.Item($$renderer, { label: 'Start', value: data.start, format: 'day' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'End', value: data.end, format: 'day' });
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

				BarChart($$renderer, {
					data,
					x: ['start', 'end'],
					xScale: scaleTime(),
					y: 'category',
					xBaseline: undefined,
					xNice: false,
					c: 'category',
					cRange: [
						'var(--color-success)',
						'var(--color-danger)',
						'var(--color-warning)',
						'var(--color-info)',
						'var(--color-secondary)'
					],
					grid: { y: true, bandAlign: 'between' },
					orientation: 'horizontal',
					labels: {
						placement,
						format: { type: 'day', options: { variant: 'short' } },
						fill: placement === 'inside' ? 'white' : undefined
					},
					props: {
						xAxis: { format: 'month' },
						tooltip: { context: { mode: 'bounds' } }
					},
					padding: defaultChartPadding({ left: 30 }),
					height: 400,
					tooltip,
					$$slots: { tooltip: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}