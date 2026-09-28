import * as $ from 'svelte/internal/server';
import { timeDay } from 'd3-time';
import { Bars, Axis, Chart, Layer, Highlight, Tooltip } from 'layerchart';
import TooltipContextControls from '$lib/components/controls/TooltipContextControls.svelte';
import { createDateSeries } from '$lib/utils/data.js';

export default function Multiple_overlapping_bars($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		let charts = {
			multiBars: {
				mode: 'band',
				highlight: ['area'],
				axis: undefined,
				snapToDataX: false,
				snapToDataY: false
			}
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			TooltipContextControls($$renderer, {
				get settings() {
					return charts.multiBars;
				},

				set settings($$value) {
					charts.multiBars = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				data,
				x: 'date',
				xInterval: timeDay,
				y: (d) => Math.max(d.value, d.baseline),
				yDomain: [0, null],
				yNice: true,
				padding: { top: 5, left: 28, bottom: 24 },
				tooltipContext: { mode: charts.multiBars.mode, debug: false },
				height: 300,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> `);

							Bars($$renderer, {
								y: 'baseline',
								radius: 4,
								strokeWidth: 1,
								class: 'fill-surface-content/10'
							});

							$$renderer.push(`<!----> `);

							Bars($$renderer, {
								y: 'value',
								radius: 4,
								strokeWidth: 1,
								insets: { x: 4 },
								class: 'fill-primary'
							});

							$$renderer.push(`<!----> `);

							Highlight($$renderer, {
								points: charts.multiBars.highlight.includes('points'),
								lines: charts.multiBars.highlight.includes('lines'),
								area: charts.multiBars.highlight.includes('area'),
								bar: charts.multiBars.highlight.includes('bar'),
								axis: charts.multiBars.axis
							});

							$$renderer.push(`<!---->`);
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
											Tooltip.Item($$renderer, { label: 'value', value: data.value });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'baseline', value: data.baseline });
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

							Tooltip.Root($$renderer, {
								x: charts.multiBars.snapToDataX ? 'data' : 'pointer',
								y: charts.multiBars.snapToDataY ? 'data' : 'pointer',
								children,
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				},
				$$slots: { default: true }
			});

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