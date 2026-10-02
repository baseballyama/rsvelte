import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { AxisState } from './Axis.shared.svelte.js';

export default function Axis_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Group,
			Line,
			Text,
			Rule,
			placement,
			label = '',
			labelPlacement = 'middle',
			labelProps,
			rule = false,
			grid = false,
			ticks,
			tickSpacing,
			tickMultiline = false,
			tickLength = 4,
			tickMarks = true,
			format,
			tickLabelProps,
			stroke,
			fill,
			motion,
			transitionIn,
			transitionInParams,
			scale,
			classes = {},
			class: className,
			tickLabel,
			facetAll,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const c = new AxisState(() => ({
			placement,
			label,
			labelPlacement,
			labelProps,
			rule,
			grid,
			ticks,
			tickSpacing,
			tickMultiline,
			tickLength,
			tickMarks,
			format,
			tickLabelProps,
			stroke,
			fill,
			motion,
			scale,
			classes,
			facetAll
		}));

		if (c.visible) {
			$$renderer.push('<!--[0-->');

			if (Group) {
				$$renderer.push('<!--[-->');

				Group($$renderer, $.spread_props([
					restProps,
					{
						'data-placement': placement,
						class: cls('lc-axis', `placement-${placement}`, classes.root, className),
						children: ($$renderer) => {
							if (rule !== false) {
								$$renderer.push('<!--[0-->');

								if (Rule) {
									$$renderer.push('<!--[-->');

									Rule($$renderer, $.spread_props([
										{
											x: placement === 'left'
												? '$left'
												: placement === 'right' ? '$right' : placement === 'angle',

											y: placement === 'top'
												? '$top'
												: placement === 'bottom' ? '$bottom' : placement === 'radius',
											stroke,
											motion
										},
										extractLayerProps(rule, 'lc-axis-rule', classes.rule ?? '')
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

							if (typeof label === 'function') {
								$$renderer.push('<!--[0-->');
								label($$renderer, { props: c.resolvedLabelProps });
								$$renderer.push(`<!---->`);
							} else if (label) {
								$$renderer.push('<!--[1-->');

								if (Text) {
									$$renderer.push('<!--[-->');
									Text($$renderer, $.spread_props([c.resolvedLabelProps]));
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <!--[-->`);

							const each_array = $.ensure_array_like(c.tickItems);

							for (let index = 0, $$length = each_array.length; index < $$length; index++) {
								let item = each_array[index];

								if (Group) {
									$$renderer.push('<!--[-->');

									Group($$renderer, {
										transitionIn,
										transitionInParams,
										class: 'lc-axis-tick-group',
										children: ($$renderer) => {
											if (grid !== false) {
												$$renderer.push('<!--[0-->');

												if (Rule) {
													$$renderer.push('<!--[-->');

													Rule($$renderer, $.spread_props([
														{
															x: c.orientation === 'horizontal' || c.orientation === 'angle' ? item.tick : false,
															y: c.orientation === 'vertical' || c.orientation === 'radius' ? item.tick : false,
															stroke,
															motion
														},
														extractLayerProps(grid, 'lc-axis-grid', classes.rule ?? '')
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

											if (tickMarks) {
												$$renderer.push('<!--[0-->');

												const tickClasses = cls('lc-axis-tick', classes.tick);

												if (c.orientation === 'horizontal') {
													$$renderer.push('<!--[0-->');

													if (Line) {
														$$renderer.push('<!--[-->');

														Line($$renderer, {
															x1: item.tickCoordsX,
															y1: item.tickCoordsY,
															x2: item.tickCoordsX,
															y2: item.tickCoordsY + (placement === 'top' ? -tickLength : tickLength),
															stroke,
															motion,
															class: tickClasses
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else if (c.orientation === 'vertical') {
													$$renderer.push('<!--[1-->');

													if (Line) {
														$$renderer.push('<!--[-->');

														Line($$renderer, {
															x1: item.tickCoordsX,
															y1: item.tickCoordsY,
															x2: item.tickCoordsX + (placement === 'left' ? -tickLength : tickLength),
															y2: item.tickCoordsY,
															stroke,
															motion,
															class: tickClasses
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else if (c.orientation === 'angle') {
													$$renderer.push('<!--[2-->');

													if (Line) {
														$$renderer.push('<!--[-->');

														Line($$renderer, {
															x1: item.radialTickCoordsX,
															y1: item.radialTickCoordsY,
															x2: item.radialTickMarkCoordsX,
															y2: item.radialTickMarkCoordsY,
															stroke,
															motion,
															class: tickClasses
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
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> `);

											if (tickLabel) {
												$$renderer.push('<!--[0-->');
												tickLabel($$renderer, { props: item.tickLabelProps, index });
												$$renderer.push(`<!---->`);
											} else {
												$$renderer.push('<!--[-1-->');

												if (Text) {
													$$renderer.push('<!--[-->');
													Text($$renderer, $.spread_props([item.tickLabelProps]));
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
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}