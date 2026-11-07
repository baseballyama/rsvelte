import * as $ from 'svelte/internal/server';

import {
	Axis,
	Bar,
	Chart,
	Layer,
	Tooltip,
	defaultChartPadding,
	groupStackData
} from 'layerchart';

import { fruitColors } from '$lib/utils/fruitColors';
import { scaleBand } from 'd3-scale';
import { longData } from '$lib/utils/data.js';
import { cubicInOut } from 'svelte/easing';
import { unique } from '@layerstack/utils';
import GroupedStackedComboField from '$lib/components/controls/fields/GroupedStackedComboField.svelte';

export default function Vertical_tooltip_and_click_handlers_for_individual_stack_grouped_bar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const colorKeys = [...new Set(longData.map((x) => x.fruit))];
		let chartMode = 'group';
		const groupBy = $.derived(() => ({ group: 'fruit', stack: undefined, groupStack: 'basket' })[chartMode]);
		const stackBy = $.derived(() => ({ group: undefined, stack: 'fruit', groupStack: 'fruit' })[chartMode]);
		const data = $.derived(() => groupStackData(longData, { xKey: 'year', groupBy: groupBy(), stackBy: stackBy() }));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			GroupedStackedComboField($$renderer, {
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
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!---->`);
							Axis($$renderer, { placement: 'bottom', rule: true });
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
										alert('You clicked on: ' + JSON.stringify(d, null, 2));
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
					x: 'year',
					xScale: scaleBand().paddingInner(0.4).paddingOuter(0.2),
					y: 'values',
					yNice: true,
					c: 'fruit',
					cDomain: colorKeys,
					cRange: fruitColors,
					x1: groupBy(),
					x1Scale: groupBy() ? scaleBand().padding(0.1) : undefined,
					x1Domain: groupBy() ? unique(data().map((d) => d[groupBy()])) : undefined,
					x1Range: ({ xScale }) => [0, xScale.bandwidth()],
					padding: { left: 32, bottom: 20, top: 8 },
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