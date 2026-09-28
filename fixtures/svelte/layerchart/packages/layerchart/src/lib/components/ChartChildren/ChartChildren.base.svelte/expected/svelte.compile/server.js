import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';
import { getSettings } from '$lib/contexts/settings.js';
import FacetAxis from '../FacetAxis.svelte';
import { asAny } from '$lib/utils/types.js';
import { getObjectOrNull } from '$lib/utils/common.js';

export default function ChartChildren_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const context = getChartContext();
		const settings = getSettings();

		let {
			Layer,
			Axis,
			Grid,
			Rule,
			Highlight,
			ChartClipPath,
			props = {},
			children: childrenProp,
			belowContext,
			grid = true,
			belowMarks,
			marks,
			aboveMarks,
			axis = true,
			rule = true,
			points = false,
			labels = false,
			highlight = true,
			aboveContext,
			legend,
			tooltip,
			tooltipContext,
			annotations = []
		} = $$props;

		let snippetProps = $.derived(() => ({ context }));
		let layer = $.derived(() => settings.layer);

		if (childrenProp) {
			$$renderer.push('<!--[0-->');
			childrenProp($$renderer, snippetProps());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
			belowContext?.($$renderer, snippetProps());
			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { facet }) {
					const layerProps = { context, facet };

					FacetAxis($$renderer, {});
					$$renderer.push(`<!----> `);

					if (typeof grid === 'function') {
						$$renderer.push('<!--[0-->');
						grid($$renderer, layerProps);
						$$renderer.push(`<!---->`);
					} else if (grid) {
						$$renderer.push('<!--[1-->');

						if (Grid) {
							$$renderer.push('<!--[-->');

							Grid($$renderer, $.spread_props([
								{
									x: context.valueAxis === 'x' || context.radial,
									y: context.valueAxis === 'y' || context.radial
								},
								getObjectOrNull(grid),
								props.grid
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (ChartClipPath) {
						$$renderer.push('<!--[-->');

						ChartClipPath($$renderer, {
							disabled: !context.props.brush && context.transformState?.mode !== 'domain',
							children: ($$renderer) => {
								if (annotations.length > 0) {
									$$renderer.push('<!--[0-->');

									$.await($$renderer, import('../charts/ChartAnnotations.svelte'), () => {}, ({ default: ChartAnnotations }) => {
										if (ChartAnnotations) {
											$$renderer.push('<!--[-->');
											ChartAnnotations($$renderer, { annotations, layer: 'below' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									});

									$$renderer.push(`<!--]-->`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);
								belowMarks?.($$renderer, layerProps);
								$$renderer.push(`<!----> `);
								marks?.($$renderer, layerProps);
								$$renderer.push(`<!----> `);
								aboveMarks?.($$renderer, layerProps);
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (typeof axis === 'function') {
						$$renderer.push('<!--[0-->');
						axis($$renderer, layerProps);
						$$renderer.push(`<!----> `);

						if (typeof rule === 'function') {
							$$renderer.push('<!--[0-->');
							rule($$renderer, layerProps);
							$$renderer.push(`<!---->`);
						} else if (rule) {
							$$renderer.push('<!--[1-->');

							if (Rule) {
								$$renderer.push('<!--[-->');

								Rule($$renderer, $.spread_props([
									{
										x: context.valueAxis === 'x' ? 0 : false,
										y: context.valueAxis === 'y' ? 0 : false
									},
									getObjectOrNull(rule),
									props.rule
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else if (axis) {
						$$renderer.push('<!--[1-->');

						if (axis !== 'x') {
							$$renderer.push('<!--[0-->');

							if (Axis) {
								$$renderer.push('<!--[-->');

								Axis($$renderer, $.spread_props([
									{ placement: context.radial ? 'radius' : 'left' },
									getObjectOrNull(axis),
									props.yAxis
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (axis !== 'y') {
							$$renderer.push('<!--[0-->');

							if (Axis) {
								$$renderer.push('<!--[-->');

								Axis($$renderer, $.spread_props([
									{ placement: context.radial ? 'angle' : 'bottom' },
									getObjectOrNull(axis),
									props.xAxis
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (typeof rule === 'function') {
							$$renderer.push('<!--[0-->');
							rule($$renderer, layerProps);
							$$renderer.push(`<!---->`);
						} else if (rule) {
							$$renderer.push('<!--[1-->');

							if (Rule) {
								$$renderer.push('<!--[-->');

								Rule($$renderer, $.spread_props([
									{
										x: context.valueAxis === 'x' ? 0 : false,
										y: context.valueAxis === 'y' ? 0 : false
									},
									getObjectOrNull(rule),
									props.rule
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (ChartClipPath) {
						$$renderer.push('<!--[-->');

						ChartClipPath($$renderer, {
							disabled: !context.props.brush && context.transformState?.mode !== 'domain',
							full: true,
							children: ($$renderer) => {
								if (typeof points === 'function') {
									$$renderer.push('<!--[0-->');
									points($$renderer, layerProps);
									$$renderer.push(`<!---->`);
								} else if (points) {
									$$renderer.push('<!--[1-->');

									$.await($$renderer, import('../Points/Points.svelte'), () => {}, ({ default: Points }) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(context.series.visibleSeries);

										for (let i = 0, $$length = each_array.length; i < $$length; i++) {
											let s = each_array[i];

											if (Points) {
												$$renderer.push('<!--[-->');

												Points($$renderer, $.spread_props([
													{
														seriesKey: s.key,
														stroke: 'var(--color-surface-100, light-dark(white, black))'
													},
													getObjectOrNull(points),
													props.points
												]));

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(`<!--]-->`);
									});

									$$renderer.push(`<!--]-->`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (typeof labels === 'function') {
									$$renderer.push('<!--[0-->');
									labels($$renderer, layerProps);
									$$renderer.push(`<!---->`);
								} else if (labels) {
									$$renderer.push('<!--[1-->');

									$.await($$renderer, import('../Labels/Labels.svelte'), () => {}, ({ default: Labels }) => {
										const labelSeriesKey = typeof labels === 'object' ? labels.seriesKey : undefined;

										$$renderer.push(`<!--[-->`);

										const each_array_1 = $.ensure_array_like(context.series.visibleSeries.filter((s) => !labelSeriesKey || s.key === labelSeriesKey));

										for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
											let s = each_array_1[i];

											if (Labels) {
												$$renderer.push('<!--[-->');
												Labels($$renderer, $.spread_props([{ seriesKey: s.key }, getObjectOrNull(labels), props.labels]));
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(`<!--]-->`);
									});

									$$renderer.push(`<!--]-->`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (typeof highlight === 'function') {
									$$renderer.push('<!--[0-->');
									highlight($$renderer, layerProps);
									$$renderer.push(`<!---->`);
								} else if (highlight) {
									$$renderer.push('<!--[1-->');

									if (Highlight) {
										$$renderer.push('<!--[-->');

										Highlight($$renderer, $.spread_props([
											typeof highlight === 'object' ? highlight : {},
											props.highlight
										]));

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (annotations.length > 0) {
									$$renderer.push('<!--[0-->');

									$.await($$renderer, import('../charts/ChartAnnotations.svelte'), () => {}, ({ default: ChartAnnotations }) => {
										if (ChartAnnotations) {
											$$renderer.push('<!--[-->');
											ChartAnnotations($$renderer, { annotations, layer: 'above' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									});

									$$renderer.push(`<!--]-->`);
								} else {
									$$renderer.push('<!--[-1-->');
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

				if (Layer) {
					$$renderer.push('<!--[-->');

					Layer($$renderer, $.spread_props([
						{ type: layer(), center: context.radial },
						asAny(layer() === 'canvas' ? props.canvas : props.svg),
						{ debug: settings.debug, children, $$slots: { default: true } }
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(` `);
			aboveContext?.($$renderer, snippetProps());
			$$renderer.push(`<!----> `);

			if (typeof legend === 'function') {
				$$renderer.push('<!--[0-->');
				legend($$renderer, snippetProps());
				$$renderer.push(`<!---->`);
			} else if (legend) {
				$$renderer.push('<!--[1-->');

				$.await($$renderer, import('../Legend.svelte'), () => {}, ({ default: Legend }) => {
					if (Legend) {
						$$renderer.push('<!--[-->');

						Legend($$renderer, $.spread_props([
							{ placement: 'bottom' },
							getObjectOrNull(legend),
							props.legend
						]));

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				});

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (typeof tooltip === 'function') {
				$$renderer.push('<!--[0-->');
				tooltip($$renderer, snippetProps());
				$$renderer.push(`<!---->`);
			} else if (tooltipContext) {
				$$renderer.push('<!--[1-->');

				$.await($$renderer, import('../charts/DefaultTooltip.svelte'), () => {}, ({ default: DefaultTooltip }) => {
					if (DefaultTooltip) {
						$$renderer.push('<!--[-->');
						DefaultTooltip($$renderer, { tooltipProps: props.tooltip, canHaveTotal: true });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				});

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}