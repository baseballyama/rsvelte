import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { area as d3Area, curveCardinal } from 'd3-shape';
import { quantile, ascending, deviation, max as d3Max } from 'd3-array';
import { cls } from '@layerstack/tailwind';
import { accessor } from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Group',
	'Path',
	'Rect',
	'Line',
	'data',
	'density',
	'values',
	'bandwidth',
	'thresholds',
	'width',
	'curve',
	'median',
	'box',
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

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Violin_base($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();

	let thresholds = $.prop($$props, 'thresholds', 3, 50),
		curve = $.prop($$props, 'curve', 3, curveCardinal),
		showMedian = $.prop($$props, 'median', 3, false),
		showBox = $.prop($$props, 'box', 3, false),
		fillOpacity = $.prop($$props, 'fillOpacity', 3, 0.3),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 1),
		restProps = $.rest_props($$props, rest_excludes);

	ctx.registerComponent({ name: 'Violin', kind: 'composite-mark' });

	const isVertical = $.derived(() => ctx.valueAxis === 'y');

	const categoryPos = $.derived(() => {
		const catAccessor = $.get(isVertical) ? ctx.x : ctx.y;
		const catScale = $.get(isVertical) ? ctx.xScale : ctx.yScale;
		const pos = catScale(catAccessor($$props.data));
		const bandwidth = isScaleBand(catScale) ? catScale.bandwidth() : 0;

		return pos + bandwidth / 2;
	});

	const violinWidth = $.derived(() => {
		if ($$props.width != null) return $$props.width;

		const catScale = $.get(isVertical) ? ctx.xScale : ctx.yScale;

		return isScaleBand(catScale) ? catScale.bandwidth() * 0.8 : 40;
	});

	const valueScale = $.derived(() => $.get(isVertical) ? ctx.yScale : ctx.xScale);

	function epanechnikov(bw) {
		return (x) => {
			const u = x / bw;

			return Math.abs(u) <= 1 ? 0.75 * (1 - u * u) / bw : 0;
		};
	}

	const densityData = $.derived(() => {
		if ($$props.density) {
			return accessor($$props.density)($$props.data);
		}

		if (!$$props.values) return [];

		const valuesAccessor = accessor($$props.values);
		const raw = valuesAccessor($$props.data);

		if (!raw || !Array.isArray(raw) || raw.length === 0) return [];

		const sorted = [...raw].sort(ascending);
		const ext = [sorted[0], sorted[sorted.length - 1]];
		const bw = $$props.bandwidth ?? 1.06 * (deviation(sorted) ?? 1) * Math.pow(sorted.length, -1 / 5);
		const kernelFn = epanechnikov(bw);
		const n = Math.max(2, thresholds());
		const step = (ext[1] - ext[0]) / (n - 1);
		const ticks = Array.from({ length: n }, (_, i) => ext[0] + i * step);

		return ticks.map((t) => {
			const density = raw.reduce((sum, v) => sum + kernelFn(t - v), 0) / raw.length;

			return [t, density];
		});
	});

	const stats = $.derived(() => {
		if (!showMedian() && !showBox()) return null;
		if (!$$props.values) return null;

		const valuesAccessor = accessor($$props.values);
		const raw = valuesAccessor($$props.data);

		if (!raw || !Array.isArray(raw) || raw.length === 0) return null;

		const sorted = Float64Array.from(raw).sort();

		return {
			q1: quantile(sorted, 0.25),
			median: quantile(sorted, 0.5),
			q3: quantile(sorted, 0.75)
		};
	});

	const maxDensity = $.derived(() => d3Max($.get(densityData), (d) => d[1]) ?? 1);
	const densityToWidth = $.derived(() => (d) => d / $.get(maxDensity) * ($.get(violinWidth) / 2));

	const pathData = $.derived(() => {
		if ($.get(densityData).length === 0) return '';

		if ($.get(isVertical)) {
			const areaGen = d3Area().x0((d) => $.get(categoryPos) - $.get(densityToWidth)(d[1])).x1((d) => $.get(categoryPos) + $.get(densityToWidth)(d[1])).y((d) => $.get(valueScale)(d[0])).curve(curve());

			return areaGen($.get(densityData)) ?? '';
		} else {
			const areaGen = d3Area().y0((d) => $.get(categoryPos) - $.get(densityToWidth)(d[1])).y1((d) => $.get(categoryPos) + $.get(densityToWidth)(d[1])).x((d) => $.get(valueScale)(d[0])).curve(curve());

			return areaGen($.get(densityData)) ?? '';
		}
	});

	const innerBoxWidth = $.derived(() => typeof showBox() === 'object' && showBox().width != null ? showBox().width : $.get(violinWidth) * 0.15);

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
		var consequent_4 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => $$props.Group, ($$anchor, Group_1) => {
				Group_1($$anchor, {
					class: 'lc-violin',
					get opacity() {
						return $$props.opacity;
					},
					onpointerenter: onPointerEnter,
					onpointermove: onPointerMove,
					onpointerleave: onPointerLeave,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => cls('lc-violin-area', $$props.class));

							$.component(node_2, () => $$props.Path, ($$anchor, Path_1) => {
								Path_1($$anchor, {
									get pathData() {
										return $.get(pathData);
									},

									get fill() {
										return $$props.fill;
									},

									get fillOpacity() {
										return fillOpacity();
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

						var node_3 = $.sibling(node_2, 2);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_4 = $.first_child(fragment_3);

								{
									var consequent = ($$anchor) => {
										var fragment_4 = $.comment();
										var node_5 = $.first_child(fragment_4);

										{
											let $0 = $.derived(() => $.get(categoryPos) - $.get(innerBoxWidth) / 2);
											let $1 = $.derived(() => Math.min($.get(valueScale)($.get(stats).q1), $.get(valueScale)($.get(stats).q3)));
											let $2 = $.derived(() => Math.abs($.get(valueScale)($.get(stats).q3) - $.get(valueScale)($.get(stats).q1)));
											let $3 = $.derived(() => cls('lc-violin-box', $$props.class));

											$.component(node_5, () => $$props.Rect, ($$anchor, Rect_1) => {
												Rect_1($$anchor, {
													get x() {
														return $.get($0);
													},

													get y() {
														return $.get($1);
													},

													get width() {
														return $.get(innerBoxWidth);
													},

													get height() {
														return $.get($2);
													},
													fill: 'currentColor',
													fillOpacity: 0.3,
													stroke: 'none',
													get class() {
														return $.get($3);
													}
												});
											});
										}

										$.append($$anchor, fragment_4);
									};

									var alternate = ($$anchor) => {
										var fragment_5 = $.comment();
										var node_6 = $.first_child(fragment_5);

										{
											let $0 = $.derived(() => Math.min($.get(valueScale)($.get(stats).q1), $.get(valueScale)($.get(stats).q3)));
											let $1 = $.derived(() => $.get(categoryPos) - $.get(innerBoxWidth) / 2);
											let $2 = $.derived(() => Math.abs($.get(valueScale)($.get(stats).q3) - $.get(valueScale)($.get(stats).q1)));
											let $3 = $.derived(() => cls('lc-violin-box', $$props.class));

											$.component(node_6, () => $$props.Rect, ($$anchor, Rect_2) => {
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
														return $.get(innerBoxWidth);
													},
													fill: 'currentColor',
													fillOpacity: 0.3,
													stroke: 'none',
													get class() {
														return $.get($3);
													}
												});
											});
										}

										$.append($$anchor, fragment_5);
									};

									$.if(node_4, ($$render) => {
										if ($.get(isVertical)) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_3);
							};

							$.if(node_3, ($$render) => {
								if (showBox() && $.get(stats)) $$render(consequent_1);
							});
						}

						var node_7 = $.sibling(node_3, 2);

						{
							var consequent_3 = ($$anchor) => {
								var fragment_6 = $.comment();
								var node_8 = $.first_child(fragment_6);

								{
									var consequent_2 = ($$anchor) => {
										var fragment_7 = $.comment();
										var node_9 = $.first_child(fragment_7);

										{
											let $0 = $.derived(() => $.get(categoryPos) - $.get(violinWidth) * 0.15);
											let $1 = $.derived(() => $.get(valueScale)($.get(stats).median));
											let $2 = $.derived(() => $.get(categoryPos) + $.get(violinWidth) * 0.15);
											let $3 = $.derived(() => $.get(valueScale)($.get(stats).median));
											let $4 = $.derived(() => cls('lc-violin-median', $$props.class));

											$.component(node_9, () => $$props.Line, ($$anchor, Line_1) => {
												Line_1($$anchor, {
													get x1() {
														return $.get($0);
													},

													get y1() {
														return $.get($1);
													},

													get x2() {
														return $.get($2);
													},

													get y2() {
														return $.get($3);
													},
													stroke: 'currentColor',
													strokeWidth: 2,
													get class() {
														return $.get($4);
													}
												});
											});
										}

										$.append($$anchor, fragment_7);
									};

									var alternate_1 = ($$anchor) => {
										var fragment_8 = $.comment();
										var node_10 = $.first_child(fragment_8);

										{
											let $0 = $.derived(() => $.get(valueScale)($.get(stats).median));
											let $1 = $.derived(() => $.get(categoryPos) - $.get(violinWidth) * 0.15);
											let $2 = $.derived(() => $.get(valueScale)($.get(stats).median));
											let $3 = $.derived(() => $.get(categoryPos) + $.get(violinWidth) * 0.15);
											let $4 = $.derived(() => cls('lc-violin-median', $$props.class));

											$.component(node_10, () => $$props.Line, ($$anchor, Line_2) => {
												Line_2($$anchor, {
													get x1() {
														return $.get($0);
													},

													get y1() {
														return $.get($1);
													},

													get x2() {
														return $.get($2);
													},

													get y2() {
														return $.get($3);
													},
													stroke: 'currentColor',
													strokeWidth: 2,
													get class() {
														return $.get($4);
													}
												});
											});
										}

										$.append($$anchor, fragment_8);
									};

									$.if(node_8, ($$render) => {
										if ($.get(isVertical)) $$render(consequent_2); else $$render(alternate_1, -1);
									});
								}

								$.append($$anchor, fragment_6);
							};

							$.if(node_7, ($$render) => {
								if (showMedian() && $.get(stats)) $$render(consequent_3);
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
			if ($.get(pathData)) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}