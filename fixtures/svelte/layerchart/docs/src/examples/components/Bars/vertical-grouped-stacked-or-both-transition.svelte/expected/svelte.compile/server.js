import * as $ from 'svelte/internal/server';
import { cubicInOut } from 'svelte/easing';
import { longData } from '$lib/utils/data';
import { unique } from '@layerstack/utils';
import { sum } from 'd3-array';
import { scaleBand } from 'd3-scale';
import { Axis, Bar, Chart, groupStackData, Highlight, Layer, Tooltip } from 'layerchart';
import GroupedStackedComboField from '$lib/components/controls/fields/GroupedStackedComboField.svelte';

export default function Vertical_grouped_stacked_or_both_transition($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const colorKeys = [...new Set(longData.map((x) => x.fruit))];

		const keyColors = [
			'var(--color-info)',
			'var(--color-success)',
			'var(--color-warning)',
			'var(--color-danger)'
		];

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
									}
								});
							}

							$$renderer.push(`<!--]--></g>`);
							Highlight($$renderer, { area: true });
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
										$$renderer.push(`<!--[-->`);

										const each_array_1 = $.ensure_array_like(data.data);

										for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
											let d = each_array_1[$$index_1];

											if (Tooltip.Item) {
												$$renderer.push('<!--[-->');

												Tooltip.Item($$renderer, {
													label: d.fruit,
													value: d.value,
													color: context.cScale?.(d.fruit),
													format: 'integer',
													valueAlign: 'right'
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(`<!--]--> `);

										if (Tooltip.Separator) {
											$$renderer.push('<!--[-->');
											Tooltip.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: 'total',
												value: sum([...data.data], (d) => d.value),
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
					cRange: keyColors,
					x1: groupBy(),
					x1Scale: groupBy() ? scaleBand().padding(0.1) : undefined,
					x1Domain: groupBy() ? unique(data().map((d) => d[groupBy()])) : undefined,
					x1Range: ({ xScale }) => [0, xScale.bandwidth()],
					padding: { left: 32, bottom: 20, top: 8 },
					tooltipContext: { mode: 'band' },
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