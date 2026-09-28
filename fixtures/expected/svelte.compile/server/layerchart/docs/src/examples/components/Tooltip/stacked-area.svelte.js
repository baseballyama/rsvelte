import * as $ from 'svelte/internal/server';
import { stack } from 'd3-shape';

import {
	Area,
	asAny,
	Axis,
	Chart,
	Layer,
	Highlight,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { flatten } from '@layerstack/utils';
import { createDateSeries } from '$lib/utils/data.js';
import TooltipContextControls from '$lib/components/controls/TooltipContextControls.svelte';

export default function Stacked_area($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const keys = ['apples', 'bananas', 'oranges'];
		const stackDateSeries = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer', keys });
		const data = stack().keys(keys)(stackDateSeries);

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

			{
				function children($$renderer, { context }) {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> <!--[-->`);

							const each_array = $.ensure_array_like(data);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let seriesData = each_array[$$index];
								const color = context.cGet(seriesData);

								Area($$renderer, {
									data: seriesData,
									line: { stroke: color, 'stroke-width': 2 },
									fill: color,
									fillOpacity: 0.2
								});
							}

							$$renderer.push(`<!--]--> `);

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
								Tooltip.Header($$renderer, { value: data.data.date, format: 'day' });
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
										$$renderer.push(`<!--[-->`);

										const each_array_1 = $.ensure_array_like(keys);

										for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
											let key = each_array_1[$$index_1];

											if (Tooltip.Item) {
												$$renderer.push('<!--[-->');
												Tooltip.Item($$renderer, { label: key, value: data.data[key] });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(`<!--]-->`);
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
				}

				Chart($$renderer, {
					data,
					flatData: flatten(data),
					x: (d) => asAny(d).data.date,
					y: [0, 1],
					yNice: true,
					c: 'key',
					cDomain: keys,
					cRange: [
						'var(--color-apples)',
						'var(--color-bananas)',
						'var(--color-oranges)'
					],
					padding: defaultChartPadding({ top: 5, left: 28, bottom: 24, right: 15 }),
					tooltipContext: { mode: settings.mode },
					height: 300,
					children,
					$$slots: { default: true }
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