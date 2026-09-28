import * as $ from 'svelte/internal/server';

import {
	Area,
	Axis,
	Chart,
	Layer,
	Highlight,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';
import TooltipContextControls from '$lib/components/controls/TooltipContextControls.svelte';

export default function Area_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		let settings = {
			mode: 'quadtree-x',
			highlight: ['points', 'lines'],
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
				y: 'value',
				yDomain: [0, null],
				yNice: true,
				padding: defaultChartPadding({ top: 5, left: 28, bottom: 24, right: 15 }),
				tooltipContext: { mode: settings.mode },
				height: 300,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> `);

							Area($$renderer, {
								class: 'fill-primary/30',
								line: { class: 'stroke-primary stroke-2' }
							});

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