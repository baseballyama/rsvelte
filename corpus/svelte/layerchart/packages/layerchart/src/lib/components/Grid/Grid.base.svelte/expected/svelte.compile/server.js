import * as $ from 'svelte/internal/server';
import { curveLinearClosed, pointRadial } from 'd3-shape';
import { cls } from '@layerstack/tailwind';
import { isScaleBand } from '$lib/utils/scales.svelte.js';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { GridState } from './Grid.shared.svelte.js';

export default function Grid_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Group,
			Line,
			Circle,
			Rule,
			x = false,
			y = false,
			xTicks,
			yTicks,
			bandAlign = 'center',
			radialY = 'circle',
			stroke,
			motion,
			transitionIn: transitionInProp,
			transitionInParams: transitionInParamsProp,
			classes = {},
			class: className,
			ref: refProp = void 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const c = new GridState(() => ({
			x,
			y,
			xTicks,
			yTicks,
			bandAlign,
			radialY,
			stroke,
			motion,
			transitionIn: transitionInProp,
			transitionInParams: transitionInParamsProp,
			classes
		}));

		let ref = void 0;
		const transitionIn = $.derived(() => transitionInProp ?? c.defaultTransitionIn);
		const transitionInParams = $.derived(() => transitionInParamsProp ?? c.defaultTransitionInParams);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Group) {
				$$renderer.push('<!--[-->');

				Group($$renderer, $.spread_props([
					{ class: cls('lc-grid', classes.root, className) },
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (x) {
								$$renderer.push('<!--[0-->');

								const splineProps = extractLayerProps(x, 'lc-grid-x-line');

								if (Group) {
									$$renderer.push('<!--[-->');

									Group($$renderer, {
										transitionIn: transitionIn(),
										transitionInParams: transitionInParams(),
										class: 'lc-grid-x',
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(c.xTickVals);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let tick = each_array[$$index];

												if (c.ctx.radial) {
													$$renderer.push('<!--[0-->');

													const [x1, y1] = pointRadial(c.ctx.xScale(tick), c.ctx.yRange[0]);
													const [x2, y2] = pointRadial(c.ctx.xScale(tick), c.ctx.yRange[1]);

													if (Line) {
														$$renderer.push('<!--[-->');

														Line($$renderer, $.spread_props([
															{ x1, y1, x2, y2, stroke, motion: c.tweenConfig },
															splineProps,
															{
																class: cls('lc-grid-x-radial-line', classes.line, splineProps?.class)
															}
														]));

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else {
													$$renderer.push('<!--[-1-->');

													if (Rule) {
														$$renderer.push('<!--[-->');

														Rule($$renderer, $.spread_props([
															{ x: tick, xOffset: c.xBandOffset, stroke, motion },
															splineProps,
															{
																class: cls('lc-grid-x-rule', classes.line, splineProps?.class)
															}
														]));

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(`<!--]-->`);
											}

											$$renderer.push(`<!--]--> `);

											if (isScaleBand(c.ctx.xScale) && bandAlign === 'between' && !c.ctx.radial && c.xTickVals.length) {
												$$renderer.push('<!--[0-->');

												if (Rule) {
													$$renderer.push('<!--[-->');

													Rule($$renderer, $.spread_props([
														{
															x: c.xTickVals[c.xTickVals.length - 1],
															xOffset: c.ctx.xScale.step() + c.xBandOffset,
															stroke,
															motion
														},
														splineProps,
														{
															class: cls('lc-grid-x-end-rule', classes.line, splineProps?.class)
														}
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
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (y) {
								$$renderer.push('<!--[0-->');

								const splineProps = extractLayerProps(y, 'lc-grid-y-line');

								if (Group) {
									$$renderer.push('<!--[-->');

									Group($$renderer, {
										transitionIn: transitionIn(),
										transitionInParams: transitionInParams(),
										class: 'lc-grid-y',
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array_1 = $.ensure_array_like(c.yTickVals);

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let tick = each_array_1[$$index_1];

												if (c.ctx.radial) {
													$$renderer.push('<!--[0-->');

													if (radialY === 'circle') {
														$$renderer.push('<!--[0-->');

														if (Circle) {
															$$renderer.push('<!--[-->');

															Circle($$renderer, $.spread_props([
																{ r: c.ctx.yScale(tick) + c.yBandOffset, stroke, motion },
																splineProps,
																{
																	class: cls('lc-grid-y-radial-circle', classes.line, splineProps?.class)
																}
															]));

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													} else {
														$$renderer.push('<!--[-1-->');

														$.await($$renderer, import('../Spline/Spline.svelte'), () => {}, ({ default: Spline }) => {
															if (Spline) {
																$$renderer.push('<!--[-->');

																Spline($$renderer, $.spread_props([
																	{
																		data: c.xTickVals.map((tx) => ({ x: tx, y: tick })),
																		x: 'x',
																		y: 'y',
																		stroke,
																		motion: c.tweenConfig,
																		curve: curveLinearClosed
																	},
																	splineProps,
																	{
																		class: cls('lc-grid-y-radial-line', classes.line, splineProps?.class)
																	}
																]));

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														});

														$$renderer.push(`<!--]-->`);
													}

													$$renderer.push(`<!--]-->`);
												} else {
													$$renderer.push('<!--[-1-->');

													if (Line) {
														$$renderer.push('<!--[-->');

														Line($$renderer, $.spread_props([
															{
																x1: c.ctx.xRange[0],
																y1: c.ctx.yScale(tick) + c.yBandOffset,
																x2: c.ctx.xRange[1],
																y2: c.ctx.yScale(tick) + c.yBandOffset,
																stroke,
																motion
															},
															splineProps,
															{
																class: cls('lc-grid-y-rule', classes.line, splineProps?.class)
															}
														]));

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(`<!--]-->`);
											}

											$$renderer.push(`<!--]--> `);

											if (isScaleBand(c.ctx.yScale) && bandAlign === 'between' && c.yTickVals.length) {
												$$renderer.push('<!--[0-->');

												if (c.ctx.radial) {
													$$renderer.push('<!--[0-->');

													if (Circle) {
														$$renderer.push('<!--[-->');

														Circle($$renderer, $.spread_props([
															{
																r: c.ctx.yScale(c.yTickVals[c.yTickVals.length - 1]) + c.ctx.yScale.step() + c.yBandOffset,
																stroke,
																motion
															},
															splineProps,
															{
																class: cls('lc-grid-y-radial-circle', classes.line, splineProps?.class)
															}
														]));

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else {
													$$renderer.push('<!--[-1-->');

													const yEnd = c.ctx.yScale(c.yTickVals[c.yTickVals.length - 1]) + c.ctx.yScale.step() + c.yBandOffset;

													if (Line) {
														$$renderer.push('<!--[-->');

														Line($$renderer, $.spread_props([
															{
																x1: c.ctx.xRange[0],
																y1: yEnd,
																x2: c.ctx.xRange[1],
																y2: yEnd,
																stroke,
																motion
															},
															splineProps,
															{
																class: cls('lc-grid-y-end-rule', classes.line, splineProps?.class)
															}
														]));

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

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
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref: refProp });
	});
}