import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { quantile } from 'd3-array';
import { accessor } from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Group',
	'Rect',
	'Line',
	'Circle',
	'data',
	'min',
	'q1',
	'median',
	'q3',
	'max',
	'outliers',
	'values',
	'iqrMultiplier',
	'width',
	'capWidth',
	'radius',
	'outlierRadius',
	'fill',
	'fillOpacity',
	'stroke',
	'strokeWidth',
	'opacity',
	'tooltip',
	'onpointerenter',
	'onpointermove',
	'onpointerleave',
	'class'
]);

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function BoxPlot_base($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();

	let iqrMultiplier = $.prop($$props, 'iqrMultiplier', 3, 1.5),
		capWidth = $.prop($$props, 'capWidth', 3, 0.5),
		radius = $.prop($$props, 'radius', 3, 0),
		outlierRadius = $.prop($$props, 'outlierRadius', 3, 3),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 1),
		restProps = $.rest_props($$props, rest_excludes);

	ctx.registerComponent({ name: 'BoxPlot', kind: 'composite-mark' });

	const computedStats = $.derived(() => {
		if (!$$props.values) return null;

		const valuesAccessor = accessor($$props.values);
		const raw = valuesAccessor($$props.data);

		if (!raw || !Array.isArray(raw) || raw.length === 0) return null;

		const sorted = Float64Array.from(raw).sort();
		const q1 = quantile(sorted, 0.25);
		const q3 = quantile(sorted, 0.75);
		const med = quantile(sorted, 0.5);
		const iqr = q3 - q1;
		const lowerFence = q1 - iqrMultiplier() * iqr;
		const upperFence = q3 + iqrMultiplier() * iqr;
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

	const minVal = $.derived(() => $$props.min != null
		? accessor($$props.min)($$props.data)
		: $.get(computedStats)?.min);

	const q1Val = $.derived(() => $$props.q1 != null
		? accessor($$props.q1)($$props.data)
		: $.get(computedStats)?.q1);

	const medianVal = $.derived(() => $$props.median != null
		? accessor($$props.median)($$props.data)
		: $.get(computedStats)?.median);

	const q3Val = $.derived(() => $$props.q3 != null
		? accessor($$props.q3)($$props.data)
		: $.get(computedStats)?.q3);

	const maxVal = $.derived(() => $$props.max != null
		? accessor($$props.max)($$props.data)
		: $.get(computedStats)?.max);

	const outliersVal = $.derived(() => $$props.outliers != null
		? accessor($$props.outliers)($$props.data) ?? []
		: $.get(computedStats)?.outliers ?? []);

	const isVertical = $.derived(() => ctx.valueAxis === 'y');

	const categoryPos = $.derived(() => {
		const catAccessor = $.get(isVertical) ? ctx.x : ctx.y;
		const catScale = $.get(isVertical) ? ctx.xScale : ctx.yScale;
		const pos = catScale(catAccessor($$props.data));
		const bandwidth = isScaleBand(catScale) ? catScale.bandwidth() : 0;

		return pos + bandwidth / 2;
	});

	const boxWidth = $.derived(() => {
		if ($$props.width != null) return $$props.width;

		const catScale = $.get(isVertical) ? ctx.xScale : ctx.yScale;

		return isScaleBand(catScale) ? catScale.bandwidth() * 0.6 : 20;
	});

	const whiskerCapWidth = $.derived(() => $.get(boxWidth) * capWidth());
	const valueScale = $.derived(() => $.get(isVertical) ? ctx.yScale : ctx.xScale);
	const minPos = $.derived(() => $.get(minVal) != null ? $.get(valueScale)($.get(minVal)) : 0);
	const q1Pos = $.derived(() => $.get(q1Val) != null ? $.get(valueScale)($.get(q1Val)) : 0);
	const medianPos = $.derived(() => $.get(medianVal) != null ? $.get(valueScale)($.get(medianVal)) : 0);
	const q3Pos = $.derived(() => $.get(q3Val) != null ? $.get(valueScale)($.get(q3Val)) : 0);
	const maxPos = $.derived(() => $.get(maxVal) != null ? $.get(valueScale)($.get(maxVal)) : 0);

	const onPointerEnter = (e) => {
		$$props.onpointerenter?.(e);

		if ($$props.tooltip) ctx.tooltip.show(e, $$props.data);
	};

	const onPointerMove = (e) => {
		$$props.onpointermove?.(e);

		if ($$props.tooltip) ctx.tooltip.show(e, $$props.data);
	};

	const onPointerLeave = (e) => {
		$$props.onpointerleave?.(e);

		if ($$props.tooltip) ctx.tooltip.hide();
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => $$props.Group, ($$anchor, Group_1) => {
				Group_1($$anchor, {
					class: 'lc-boxplot',
					get opacity() {
						return $$props.opacity;
					},
					onpointerenter: onPointerEnter,
					onpointermove: onPointerMove,
					onpointerleave: onPointerLeave,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								var fragment_3 = root();
								var node_3 = $.first_child(fragment_3);

								{
									let $0 = $.derived(() => cls('lc-boxplot-whisker', $$props.class));

									$.component(node_3, () => $$props.Line, ($$anchor, Line_1) => {
										Line_1($$anchor, {
											get x1() {
												return $.get(categoryPos);
											},

											get y1() {
												return $.get(minPos);
											},

											get x2() {
												return $.get(categoryPos);
											},

											get y2() {
												return $.get(q1Pos);
											},

											get stroke() {
												return $$props.stroke;
											},

											get strokeWidth() {
												return strokeWidth();
											},

											get class() {
												return $.get($0);
											}
										});
									});
								}

								var node_4 = $.sibling(node_3, 2);

								{
									let $0 = $.derived(() => cls('lc-boxplot-whisker', $$props.class));

									$.component(node_4, () => $$props.Line, ($$anchor, Line_2) => {
										Line_2($$anchor, {
											get x1() {
												return $.get(categoryPos);
											},

											get y1() {
												return $.get(q3Pos);
											},

											get x2() {
												return $.get(categoryPos);
											},

											get y2() {
												return $.get(maxPos);
											},

											get stroke() {
												return $$props.stroke;
											},

											get strokeWidth() {
												return strokeWidth();
											},

											get class() {
												return $.get($0);
											}
										});
									});
								}

								var node_5 = $.sibling(node_4, 2);

								{
									let $0 = $.derived(() => $.get(categoryPos) - $.get(whiskerCapWidth) / 2);
									let $1 = $.derived(() => $.get(categoryPos) + $.get(whiskerCapWidth) / 2);
									let $2 = $.derived(() => cls('lc-boxplot-cap', $$props.class));

									$.component(node_5, () => $$props.Line, ($$anchor, Line_3) => {
										Line_3($$anchor, {
											get x1() {
												return $.get($0);
											},

											get y1() {
												return $.get(minPos);
											},

											get x2() {
												return $.get($1);
											},

											get y2() {
												return $.get(minPos);
											},

											get stroke() {
												return $$props.stroke;
											},

											get strokeWidth() {
												return strokeWidth();
											},

											get class() {
												return $.get($2);
											}
										});
									});
								}

								var node_6 = $.sibling(node_5, 2);

								{
									let $0 = $.derived(() => $.get(categoryPos) - $.get(whiskerCapWidth) / 2);
									let $1 = $.derived(() => $.get(categoryPos) + $.get(whiskerCapWidth) / 2);
									let $2 = $.derived(() => cls('lc-boxplot-cap', $$props.class));

									$.component(node_6, () => $$props.Line, ($$anchor, Line_4) => {
										Line_4($$anchor, {
											get x1() {
												return $.get($0);
											},

											get y1() {
												return $.get(maxPos);
											},

											get x2() {
												return $.get($1);
											},

											get y2() {
												return $.get(maxPos);
											},

											get stroke() {
												return $$props.stroke;
											},

											get strokeWidth() {
												return strokeWidth();
											},

											get class() {
												return $.get($2);
											}
										});
									});
								}

								var node_7 = $.sibling(node_6, 2);

								{
									let $0 = $.derived(() => $.get(categoryPos) - $.get(boxWidth) / 2);
									let $1 = $.derived(() => Math.min($.get(q1Pos), $.get(q3Pos)));
									let $2 = $.derived(() => Math.abs($.get(q3Pos) - $.get(q1Pos)));
									let $3 = $.derived(() => cls('lc-boxplot-box', $$props.class));

									$.component(node_7, () => $$props.Rect, ($$anchor, Rect_1) => {
										Rect_1($$anchor, {
											get x() {
												return $.get($0);
											},

											get y() {
												return $.get($1);
											},

											get width() {
												return $.get(boxWidth);
											},

											get height() {
												return $.get($2);
											},

											get fill() {
												return $$props.fill;
											},

											get fillOpacity() {
												return $$props.fillOpacity;
											},

											get stroke() {
												return $$props.stroke;
											},

											get strokeWidth() {
												return strokeWidth();
											},

											get rx() {
												return radius();
											},

											get class() {
												return $.get($3);
											}
										});
									});
								}

								var node_8 = $.sibling(node_7, 2);

								{
									let $0 = $.derived(() => $.get(categoryPos) - $.get(boxWidth) / 2);
									let $1 = $.derived(() => $.get(categoryPos) + $.get(boxWidth) / 2);
									let $2 = $.derived(() => strokeWidth() * 2);
									let $3 = $.derived(() => cls('lc-boxplot-median', $$props.class));

									$.component(node_8, () => $$props.Line, ($$anchor, Line_5) => {
										Line_5($$anchor, {
											get x1() {
												return $.get($0);
											},

											get y1() {
												return $.get(medianPos);
											},

											get x2() {
												return $.get($1);
											},

											get y2() {
												return $.get(medianPos);
											},

											get stroke() {
												return $$props.stroke;
											},

											get strokeWidth() {
												return $.get($2);
											},

											get class() {
												return $.get($3);
											}
										});
									});
								}

								var node_9 = $.sibling(node_8, 2);

								$.each(node_9, 17, () => $.get(outliersVal), $.index, ($$anchor, outlier) => {
									var fragment_4 = $.comment();
									var node_10 = $.first_child(fragment_4);

									{
										let $0 = $.derived(() => $.get(valueScale)($.get(outlier)));
										let $1 = $.derived(() => cls('lc-boxplot-outlier', $$props.class));

										$.component(node_10, () => $$props.Circle, ($$anchor, Circle_1) => {
											Circle_1($$anchor, {
												get cx() {
													return $.get(categoryPos);
												},

												get cy() {
													return $.get($0);
												},

												get r() {
													return outlierRadius();
												},

												get stroke() {
													return $$props.stroke;
												},

												get strokeWidth() {
													return strokeWidth();
												},

												get class() {
													return $.get($1);
												}
											});
										});
									}

									$.append($$anchor, fragment_4);
								});

								$.append($$anchor, fragment_3);
							};

							var alternate = ($$anchor) => {
								var fragment_5 = root();
								var node_11 = $.first_child(fragment_5);

								{
									let $0 = $.derived(() => cls('lc-boxplot-whisker', $$props.class));

									$.component(node_11, () => $$props.Line, ($$anchor, Line_6) => {
										Line_6($$anchor, {
											get x1() {
												return $.get(minPos);
											},

											get y1() {
												return $.get(categoryPos);
											},

											get x2() {
												return $.get(q1Pos);
											},

											get y2() {
												return $.get(categoryPos);
											},

											get stroke() {
												return $$props.stroke;
											},

											get strokeWidth() {
												return strokeWidth();
											},

											get class() {
												return $.get($0);
											}
										});
									});
								}

								var node_12 = $.sibling(node_11, 2);

								{
									let $0 = $.derived(() => cls('lc-boxplot-whisker', $$props.class));

									$.component(node_12, () => $$props.Line, ($$anchor, Line_7) => {
										Line_7($$anchor, {
											get x1() {
												return $.get(q3Pos);
											},

											get y1() {
												return $.get(categoryPos);
											},

											get x2() {
												return $.get(maxPos);
											},

											get y2() {
												return $.get(categoryPos);
											},

											get stroke() {
												return $$props.stroke;
											},

											get strokeWidth() {
												return strokeWidth();
											},

											get class() {
												return $.get($0);
											}
										});
									});
								}

								var node_13 = $.sibling(node_12, 2);

								{
									let $0 = $.derived(() => $.get(categoryPos) - $.get(whiskerCapWidth) / 2);
									let $1 = $.derived(() => $.get(categoryPos) + $.get(whiskerCapWidth) / 2);
									let $2 = $.derived(() => cls('lc-boxplot-cap', $$props.class));

									$.component(node_13, () => $$props.Line, ($$anchor, Line_8) => {
										Line_8($$anchor, {
											get x1() {
												return $.get(minPos);
											},

											get y1() {
												return $.get($0);
											},

											get x2() {
												return $.get(minPos);
											},

											get y2() {
												return $.get($1);
											},

											get stroke() {
												return $$props.stroke;
											},

											get strokeWidth() {
												return strokeWidth();
											},

											get class() {
												return $.get($2);
											}
										});
									});
								}

								var node_14 = $.sibling(node_13, 2);

								{
									let $0 = $.derived(() => $.get(categoryPos) - $.get(whiskerCapWidth) / 2);
									let $1 = $.derived(() => $.get(categoryPos) + $.get(whiskerCapWidth) / 2);
									let $2 = $.derived(() => cls('lc-boxplot-cap', $$props.class));

									$.component(node_14, () => $$props.Line, ($$anchor, Line_9) => {
										Line_9($$anchor, {
											get x1() {
												return $.get(maxPos);
											},

											get y1() {
												return $.get($0);
											},

											get x2() {
												return $.get(maxPos);
											},

											get y2() {
												return $.get($1);
											},

											get stroke() {
												return $$props.stroke;
											},

											get strokeWidth() {
												return strokeWidth();
											},

											get class() {
												return $.get($2);
											}
										});
									});
								}

								var node_15 = $.sibling(node_14, 2);

								{
									let $0 = $.derived(() => Math.min($.get(q1Pos), $.get(q3Pos)));
									let $1 = $.derived(() => $.get(categoryPos) - $.get(boxWidth) / 2);
									let $2 = $.derived(() => Math.abs($.get(q3Pos) - $.get(q1Pos)));
									let $3 = $.derived(() => cls('lc-boxplot-box', $$props.class));

									$.component(node_15, () => $$props.Rect, ($$anchor, Rect_2) => {
										Rect_2($$anchor, {
											get x() {
												return $.get($0);
											},

											get y() {
												return $.get($1);
											},

											get width() {
												return $.get($2);
											},

											get height() {
												return $.get(boxWidth);
											},

											get fill() {
												return $$props.fill;
											},

											get fillOpacity() {
												return $$props.fillOpacity;
											},

											get stroke() {
												return $$props.stroke;
											},

											get strokeWidth() {
												return strokeWidth();
											},

											get rx() {
												return radius();
											},

											get class() {
												return $.get($3);
											}
										});
									});
								}

								var node_16 = $.sibling(node_15, 2);

								{
									let $0 = $.derived(() => $.get(categoryPos) - $.get(boxWidth) / 2);
									let $1 = $.derived(() => $.get(categoryPos) + $.get(boxWidth) / 2);
									let $2 = $.derived(() => strokeWidth() * 2);
									let $3 = $.derived(() => cls('lc-boxplot-median', $$props.class));

									$.component(node_16, () => $$props.Line, ($$anchor, Line_10) => {
										Line_10($$anchor, {
											get x1() {
												return $.get(medianPos);
											},

											get y1() {
												return $.get($0);
											},

											get x2() {
												return $.get(medianPos);
											},

											get y2() {
												return $.get($1);
											},

											get stroke() {
												return $$props.stroke;
											},

											get strokeWidth() {
												return $.get($2);
											},

											get class() {
												return $.get($3);
											}
										});
									});
								}

								var node_17 = $.sibling(node_16, 2);

								$.each(node_17, 17, () => $.get(outliersVal), $.index, ($$anchor, outlier) => {
									var fragment_6 = $.comment();
									var node_18 = $.first_child(fragment_6);

									{
										let $0 = $.derived(() => $.get(valueScale)($.get(outlier)));
										let $1 = $.derived(() => cls('lc-boxplot-outlier', $$props.class));

										$.component(node_18, () => $$props.Circle, ($$anchor, Circle_2) => {
											Circle_2($$anchor, {
												get cx() {
													return $.get($0);
												},

												get cy() {
													return $.get(categoryPos);
												},

												get r() {
													return outlierRadius();
												},

												get stroke() {
													return $$props.stroke;
												},

												get strokeWidth() {
													return strokeWidth();
												},

												get class() {
													return $.get($1);
												}
											});
										});
									}

									$.append($$anchor, fragment_6);
								});

								$.append($$anchor, fragment_5);
							};

							$.if(node_2, ($$render) => {
								if ($.get(isVertical)) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(minVal) != null && $.get(q1Val) != null && $.get(medianVal) != null && $.get(q3Val) != null && $.get(maxVal) != null) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}