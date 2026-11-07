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

import TooltipContextControls2 from '$lib/components/controls/TooltipContextControls2.svelte';
import { createDateSeries } from '$lib/utils/data.js';

export default function Anchor_location($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		let anchor = 'top-left';
		let snap = 'pointer';
		let contained = 'container';
		let portal = true;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			TooltipContextControls2($$renderer, {
				get anchor() {
					return anchor;
				},

				set anchor($$value) {
					anchor = $$value;
					$$settled = false;
				},

				get snap() {
					return snap;
				},

				set snap($$value) {
					snap = $$value;
					$$settled = false;
				},

				get contained() {
					return contained;
				},

				set contained($$value) {
					contained = $$value;
					$$settled = false;
				},

				get portal() {
					return portal;
				},

				set portal($$value) {
					portal = $$value;
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
				tooltipContext: { mode: 'quadtree-x' },
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
							Highlight($$renderer, { points: true, lines: true });
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
								anchor,
								x: snap,
								xOffset: ['top', 'center', 'bottom'].includes(anchor ?? '') ? 0 : 10,
								y: snap,
								yOffset: ['left', 'center', 'right'].includes(anchor ?? '') ? 0 : 10,
								contained,
								portal,
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