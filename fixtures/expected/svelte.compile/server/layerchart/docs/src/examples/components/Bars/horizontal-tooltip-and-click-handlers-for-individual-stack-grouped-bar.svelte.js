import * as $ from 'svelte/internal/server';

import {
	Bar,
	Axis,
	Chart,
	Layer,
	Tooltip,
	defaultChartPadding,
	groupStackData
} from 'layerchart';

import { fruitColors } from '$lib/utils/fruitColors';
import { scaleBand } from 'd3-scale';
import GroupedStackedComboControls from '$lib/components/controls/BarsControls.svelte';
import { longData } from '$lib/utils/data.js';
import { unique } from '@layerstack/utils';
import { cubicInOut } from 'svelte/easing';

export default function Horizontal_tooltip_and_click_handlers_for_individual_stack_grouped_bar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const colorKeys = [...new Set(longData.map((x) => x.fruit))];
		let chartMode = 'group';
		const groupBy = $.derived(() => ({ group: 'fruit', stack: undefined, groupStack: 'basket' })[chartMode]);
		const stackBy = $.derived(() => ({ group: undefined, stack: 'fruit', groupStack: 'fruit' })[chartMode]);
		const data = $.derived(() => groupStackData(longData, { xKey: 'year', groupBy: groupBy(), stackBy: stackBy() }));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			GroupedStackedComboControls($$renderer, {
				get chartMode() {
					return chartMode;
				},

				set chartMode($$value) {
					chartMode = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { context }) {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'bottom', grid: true, rule: true });
							$$renderer.push(`<!---->`);
							Axis($$renderer, { placement: 'left', rule: true });
							$$renderer.push(`<!----><g><!--[-->`);

							const each_array = $.ensure_array_like(data());

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let d = each_array[$$index];

								Bar($$renderer, {
									data: d,
									fill: context.cScale?.(d.fruit),
									strokeWidth: 1,
									motion: {
										x: {
											type: 'tween',
											easing: cubicInOut,
											delay: groupBy() ? 0 : 300
										},
										y: {
											type: 'tween',
											easing: cubicInOut,
											delay: groupBy() ? 300 : 0
										},
										width: {
											type: 'tween',
											easing: cubicInOut,
											delay: groupBy() ? 0 : 300
										},
										height: {
											type: 'tween',
											easing: cubicInOut,
											delay: groupBy() ? 300 : 0
										}
									},
									class: 'cursor-pointer',
									onclick: (e) => {
										alert('You clicked on:\n' + JSON.stringify(d, null, 2));
									},
									onpointerenter: (e) => context.tooltip.show(e, d),
									onpointermove: (e) => context.tooltip.show(e, d),
									onpointerleave: (e) => context.tooltip.hide()
								});
							}

							$$renderer.push(`<!--]--></g>`);
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
										$$renderer.push(`<!---->${$.escape(data.year)}`);
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
												label: data.fruit,
												value: data.value,
												color: context.cScale?.(data.fruit),
												format: 'integer',
												valueAlign: 'right'
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
							Tooltip.Root($$renderer, { children, $$slots: { default: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				}

				Chart($$renderer, {
					data: data(),
					x: 'values',
					xNice: true,
					y: 'year',
					yScale: scaleBand().paddingInner(0.2).paddingOuter(0.1),
					c: 'fruit',
					cDomain: colorKeys,
					cRange: fruitColors,
					y1: groupBy(),
					y1Scale: groupBy() ? scaleBand().padding(0.1) : undefined,
					y1Domain: groupBy() ? unique(data().map((d) => d[groupBy()])) : undefined,
					y1Range: ({ yScale }) => [0, yScale.bandwidth()],
					padding: defaultChartPadding({ left: 30, right: 15, bottom: 20 }),
					height: 400,
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