import * as $ from 'svelte/internal/server';

import {
	Axis,
	Chart,
	Layer,
	Highlight,
	Points,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { createTimeSeries } from '$lib/utils/data.js';
import TooltipContextControls from '$lib/components/controls/TooltipContextControls.svelte';

export default function Single_date_time($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createTimeSeries({
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		let settings = {
			mode: 'quadtree-x',
			highlight: ['points', 'lines'],
			axis: 'x',
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
				x: 'startDate',
				y: 'name',
				xNice: true,
				yNice: true,
				padding: defaultChartPadding({ left: 36, bottom: 36, right: 20 }),
				tooltipContext: { mode: settings.mode },
				height: 300,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: { dashArray: 2 }, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom' });
							$$renderer.push(`<!----> `);
							Points($$renderer, { class: 'fill-primary' });
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
												label: 'date',
												value: data.startDate,
												format: { type: 'time', options: { variant: 'short' } }
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