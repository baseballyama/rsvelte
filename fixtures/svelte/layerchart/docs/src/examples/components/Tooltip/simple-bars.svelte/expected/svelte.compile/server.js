import * as $ from 'svelte/internal/server';
import { timeDay } from 'd3-time';
import { Bars, Axis, Chart, Layer, Highlight, Tooltip } from 'layerchart';
import TooltipContextControls from '$lib/components/controls/TooltipContextControls.svelte';
import { createDateSeries } from '$lib/utils/data.js';

export default function Simple_bars($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		let settings = {
			mode: 'band',
			highlight: ['area'],
			axis: undefined,
			snapToDataX: false,
			snapToDataY: false
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			TooltipContextControls($$renderer, {
				get settings() {
					return settings;
				},

				set settings($$value) {
					settings = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				data,
				x: 'date',
				xInterval: timeDay,
				y: 'value',
				yDomain: [0, null],
				yNice: true,
				padding: { top: 5, left: 28, bottom: 24 },
				tooltipContext: { mode: settings.mode },
				height: 300,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> `);
							Bars($$renderer, { radius: 4, strokeWidth: 1, class: 'fill-primary' });
							$$renderer.push(`<!----> `);

							Highlight($$renderer, {
								points: settings.highlight.includes('points'),
								lines: settings.highlight.includes('lines'),
								area: settings.highlight.includes('area'),
								axis: settings.axis
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
								x: settings.snapToDataX ? 'data' : 'pointer',
								y: settings.snapToDataY ? 'data' : 'pointer',
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