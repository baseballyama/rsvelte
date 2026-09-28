import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { quantile } from 'd3-array';
import { accessor } from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';

export default function BoxPlot_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = getChartContext();

		let {
			Group,
			Rect,
			Line,
			Circle,
			data,
			min: minProp,
			q1: q1Prop,
			median: medianProp,
			q3: q3Prop,
			max: maxProp,
			outliers: outliersProp,
			values: valuesProp,
			iqrMultiplier = 1.5,
			width: widthProp,
			capWidth = 0.5,
			radius = 0,
			outlierRadius = 3,
			fill,
			fillOpacity,
			stroke,
			strokeWidth = 1,
			opacity,
			tooltip,
			onpointerenter,
			onpointermove,
			onpointerleave,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		ctx.registerComponent({ name: 'BoxPlot', kind: 'composite-mark' });

		const computedStats = $.derived(() => {
			if (!valuesProp) return null;

			const valuesAccessor = accessor(valuesProp);
			const raw = valuesAccessor(data);

			if (!raw || !Array.isArray(raw) || raw.length === 0) return null;

			const sorted = Float64Array.from(raw).sort();
			const q1 = quantile(sorted, 0.25);
			const q3 = quantile(sorted, 0.75);
			const med = quantile(sorted, 0.5);
			const iqr = q3 - q1;
			const lowerFence = q1 - iqrMultiplier * iqr;
			const upperFence = q3 + iqrMultiplier * iqr;
			const outliers = [];
			let min = Infinity;
			let max = -Infinity;

			for (const v of sorted) {
				if (v < lowerFence || v > upperFence) {
					outliers.push(v);
				} else {
					if (v < min) min = v;
					if (v > max) max = v;
				}
			}

			if (min === Infinity) min = q1;
			if (max === -Infinity) max = q3;

			return { min, q1, median: med, q3, max, outliers };
		});

		const minVal = $.derived(() => minProp != null ? accessor(minProp)(data) : computedStats()?.min);
		const q1Val = $.derived(() => q1Prop != null ? accessor(q1Prop)(data) : computedStats()?.q1);
		const medianVal = $.derived(() => medianProp != null ? accessor(medianProp)(data) : computedStats()?.median);
		const q3Val = $.derived(() => q3Prop != null ? accessor(q3Prop)(data) : computedStats()?.q3);
		const maxVal = $.derived(() => maxProp != null ? accessor(maxProp)(data) : computedStats()?.max);

		const outliersVal = $.derived(() => outliersProp != null
			? accessor(outliersProp)(data) ?? []
			: computedStats()?.outliers ?? []);

		const isVertical = $.derived(() => ctx.valueAxis === 'y');

		const categoryPos = $.derived(() => {
			const catAccessor = isVertical() ? ctx.x : ctx.y;
			const catScale = isVertical() ? ctx.xScale : ctx.yScale;
			const pos = catScale(catAccessor(data));
			const bandwidth = isScaleBand(catScale) ? catScale.bandwidth() : 0;

			return pos + bandwidth / 2;
		});

		const boxWidth = $.derived(() => {
			if (widthProp != null) return widthProp;

			const catScale = isVertical() ? ctx.xScale : ctx.yScale;

			return isScaleBand(catScale) ? catScale.bandwidth() * 0.6 : 20;
		});

		const whiskerCapWidth = $.derived(() => boxWidth() * capWidth);
		const valueScale = $.derived(() => isVertical() ? ctx.yScale : ctx.xScale);
		const minPos = $.derived(() => minVal() != null ? valueScale()(minVal()) : 0);
		const q1Pos = $.derived(() => q1Val() != null ? valueScale()(q1Val()) : 0);
		const medianPos = $.derived(() => medianVal() != null ? valueScale()(medianVal()) : 0);
		const q3Pos = $.derived(() => q3Val() != null ? valueScale()(q3Val()) : 0);
		const maxPos = $.derived(() => maxVal() != null ? valueScale()(maxVal()) : 0);

		const onPointerEnter = (e) => {
			onpointerenter?.(e);

			if (tooltip) ctx.tooltip.show(e, data);
		};

		const onPointerMove = (e) => {
			onpointermove?.(e);

			if (tooltip) ctx.tooltip.show(e, data);
		};

		const onPointerLeave = (e) => {
			onpointerleave?.(e);

			if (tooltip) ctx.tooltip.hide();
		};

		if (minVal() != null && q1Val() != null && medianVal() != null && q3Val() != null && maxVal() != null) {
			$$renderer.push('<!--[0-->');

			if (Group) {
				$$renderer.push('<!--[-->');

				Group($$renderer, {
					class: 'lc-boxplot',
					opacity,
					onpointerenter: onPointerEnter,
					onpointermove: onPointerMove,
					onpointerleave: onPointerLeave,
					children: ($$renderer) => {
						if (isVertical()) {
							$$renderer.push('<!--[0-->');

							if (Line) {
								$$renderer.push('<!--[-->');

								Line($$renderer, {
									x1: categoryPos(),
									y1: minPos(),
									x2: categoryPos(),
									y2: q1Pos(),
									stroke,
									strokeWidth,
									class: cls('lc-boxplot-whisker', className)
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Line) {
								$$renderer.push('<!--[-->');

								Line($$renderer, {
									x1: categoryPos(),
									y1: q3Pos(),
									x2: categoryPos(),
									y2: maxPos(),
									stroke,
									strokeWidth,
									class: cls('lc-boxplot-whisker', className)
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Line) {
								$$renderer.push('<!--[-->');

								Line($$renderer, {
									x1: categoryPos() - whiskerCapWidth() / 2,
									y1: minPos(),
									x2: categoryPos() + whiskerCapWidth() / 2,
									y2: minPos(),
									stroke,
									strokeWidth,
									class: cls('lc-boxplot-cap', className)
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Line) {
								$$renderer.push('<!--[-->');

								Line($$renderer, {
									x1: categoryPos() - whiskerCapWidth() / 2,
									y1: maxPos(),
									x2: categoryPos() + whiskerCapWidth() / 2,
									y2: maxPos(),
									stroke,
									strokeWidth,
									class: cls('lc-boxplot-cap', className)
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Rect) {
								$$renderer.push('<!--[-->');

								Rect($$renderer, {
									x: categoryPos() - boxWidth() / 2,
									y: Math.min(q1Pos(), q3Pos()),
									width: boxWidth(),
									height: Math.abs(q3Pos() - q1Pos()),
									fill,
									fillOpacity,
									stroke,
									strokeWidth,
									rx: radius,
									class: cls('lc-boxplot-box', className)
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Line) {
								$$renderer.push('<!--[-->');

								Line($$renderer, {
									x1: categoryPos() - boxWidth() / 2,
									y1: medianPos(),
									x2: categoryPos() + boxWidth() / 2,
									y2: medianPos(),
									stroke,
									strokeWidth: strokeWidth * 2,
									class: cls('lc-boxplot-median', className)
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <!--[-->`);

							const each_array = $.ensure_array_like(outliersVal());

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let outlier = each_array[i];

								if (Circle) {
									$$renderer.push('<!--[-->');

									Circle($$renderer, {
										cx: categoryPos(),
										cy: valueScale()(outlier),
										r: outlierRadius,
										stroke,
										strokeWidth,
										class: cls('lc-boxplot-outlier', className)
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push('<!--[-1-->');

							if (Line) {
								$$renderer.push('<!--[-->');

								Line($$renderer, {
									x1: minPos(),
									y1: categoryPos(),
									x2: q1Pos(),
									y2: categoryPos(),
									stroke,
									strokeWidth,
									class: cls('lc-boxplot-whisker', className)
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Line) {
								$$renderer.push('<!--[-->');

								Line($$renderer, {
									x1: q3Pos(),
									y1: categoryPos(),
									x2: maxPos(),
									y2: categoryPos(),
									stroke,
									strokeWidth,
									class: cls('lc-boxplot-whisker', className)
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Line) {
								$$renderer.push('<!--[-->');

								Line($$renderer, {
									x1: minPos(),
									y1: categoryPos() - whiskerCapWidth() / 2,
									x2: minPos(),
									y2: categoryPos() + whiskerCapWidth() / 2,
									stroke,
									strokeWidth,
									class: cls('lc-boxplot-cap', className)
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Line) {
								$$renderer.push('<!--[-->');

								Line($$renderer, {
									x1: maxPos(),
									y1: categoryPos() - whiskerCapWidth() / 2,
									x2: maxPos(),
									y2: categoryPos() + whiskerCapWidth() / 2,
									stroke,
									strokeWidth,
									class: cls('lc-boxplot-cap', className)
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Rect) {
								$$renderer.push('<!--[-->');

								Rect($$renderer, {
									x: Math.min(q1Pos(), q3Pos()),
									y: categoryPos() - boxWidth() / 2,
									width: Math.abs(q3Pos() - q1Pos()),
									height: boxWidth(),
									fill,
									fillOpacity,
									stroke,
									strokeWidth,
									rx: radius,
									class: cls('lc-boxplot-box', className)
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Line) {
								$$renderer.push('<!--[-->');

								Line($$renderer, {
									x1: medianPos(),
									y1: categoryPos() - boxWidth() / 2,
									x2: medianPos(),
									y2: categoryPos() + boxWidth() / 2,
									stroke,
									strokeWidth: strokeWidth * 2,
									class: cls('lc-boxplot-median', className)
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <!--[-->`);

							const each_array_1 = $.ensure_array_like(outliersVal());

							for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
								let outlier = each_array_1[i];

								if (Circle) {
									$$renderer.push('<!--[-->');

									Circle($$renderer, {
										cx: valueScale()(outlier),
										cy: categoryPos(),
										r: outlierRadius,
										stroke,
										strokeWidth,
										class: cls('lc-boxplot-outlier', className)
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(`<!--]-->`);
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
	});
}