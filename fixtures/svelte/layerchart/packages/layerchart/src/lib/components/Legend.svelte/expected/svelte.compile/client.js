import 'svelte/internal/disclose-version';
import { asAny } from '$lib/utils/types.js';
import * as $ from 'svelte/internal/client';
import { scaleBand, scaleLinear } from 'd3-scale';
import { quantize, interpolate, interpolateRound } from 'd3-interpolate';
import { quantile, range } from 'd3-array';
import { format } from '@layerstack/utils';
import ColorRamp from './ColorRamp.svelte';
import { cls } from '@layerstack/tailwind';
import { getChartContext } from '$lib/contexts/chart.js';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { resolveMaybeFn } from '$lib/utils/common.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'scale',
	'title',
	'width',
	'height',
	'ticks',
	'tickFormat',
	'tickValues',
	'tickFontSize',
	'tickLength',
	'placement',
	'orientation',
	'onclick',
	'onpointerenter',
	'onpointerleave',
	'variant',
	'selected',
	'value',
	'classes',
	'ref',
	'class',
	'children'
]);

var root = $.from_svg(`<rect></rect>`);
var root_1 = $.from_svg(`<line></line>`);
var root_2 = $.from_svg(`<text text-anchor="middle"> </text><!>`, 1);
var root_3 = $.from_svg(`<path></path>`);
var root_4 = $.from_svg(`<svg><g class="lc-legend-ramp-g"><!></g><g class="lc-legend-tick-group"></g><!></svg>`);
var root_5 = $.from_html(`<button type="button"><div></div> <div> </div></button>`);
var root_6 = $.from_html(`<div></div>`);
var root_7 = $.from_html(`<div><div> </div> <!></div>`);

export default function Legend($$anchor, $$props) {
	$.push($$props, true);

	let title = $.prop($$props, 'title', 3, ''),
		width = $.prop($$props, 'width', 3, 320),
		height = $.prop($$props, 'height', 3, 10),
		ticks = $.prop($$props, 'ticks', 19, () => width() / 64),
		tickFontSize = $.prop($$props, 'tickFontSize', 3, 10),
		tickLengthProp = $.prop($$props, 'tickLength', 3, 4),
		orientation = $.prop($$props, 'orientation', 3, 'horizontal'),
		classes = $.prop($$props, 'classes', 19, () => ({})),
		refProp = $.prop($$props, 'ref', 15),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	const ctx = getChartContext();

	// Check if we should use series-based legend (multiple series with colors defined)
	const hasSeriesWithColors = $.derived(() => {
		if (!ctx.series) return false;

		const allSeries = ctx.series.series ?? [];

		// An ordinal `c` names the chart's own groups, so it wins over series — which may just be
		// what a mark's accessor was called
		if (ctx.cGroups) return false;

		// Check if we have multiple series OR a non-default series with colors
		return allSeries.length > 0 && !ctx.series.isDefaultSeries && allSeries.some((s) => s.color);
	});

	// Use series-based legend if we have series with colors, otherwise use scale
	const scale = $.derived(() => $.get(hasSeriesWithColors) ? null : $$props.scale ?? ctx.cScale);

	// Create series items for series-based legend
	const seriesItems = $.derived(() => {
		if (!$.get(hasSeriesWithColors) || !ctx.series) return null;

		// Get ALL series (not just visible) so legend items remain visible when deselected
		const allSeries = ctx.series.series ?? [];

		if (allSeries.length === 0) return null;

		return allSeries.filter((s) => s && s.key).// Filter out any invalid series
		map((s) => {
			// Get label - prefer explicit label, then key
			let label = s.label ?? s.key;

			// If label is somehow not a string, convert it to string or use key
			if (typeof label !== 'string') {
				label = String(s.key);
			}

			return { key: s.key, label, color: s.color ?? 'currentColor' };
		});
	});

	const scaleConfig = $.derived(() => {
		if (!$.get(scale)) {
			return {
				xScale: undefined,
				interpolator: undefined,
				swatches: undefined,
				tickLabelOffset: 0,
				tickLine: true,
				tickLength: tickLengthProp(),
				tickFormat: $$props.tickFormat,
				tickValues: $$props.tickValues
			};
		} else if ($.get(scale).interpolate) {
			// Continuous
			const n = Math.min($.get(scale).domain().length, $.get(scale).range().length);

			const xScale = $.get(scale).copy().rangeRound?.(quantize(interpolate(0, width()), n));
			const interpolator = $.get(scale).copy().domain(quantize(interpolate(0, 1), n));
			const _tickFormat = $$props.tickFormat ?? xScale?.tickFormat?.();

			return {
				xScale,
				interpolator,
				tickFormat: _tickFormat,
				tickLabelOffset: 0,
				tickLine: true,
				tickValues: $$props.tickValues,
				tickLength: tickLengthProp(),
				swatches: undefined
			};
		} else if ($.get(scale).interpolator) {
			// Sequential
			const xScale = Object.assign($.get(scale).copy().interpolator(interpolateRound(0, width())), {
				range() {
					return [0, width()];
				}
			});

			const interpolator = $.get(scale).interpolator();
			let tickValues = $$props.tickValues;

			if (!xScale.ticks) {
				if (tickValues === undefined) {
					const n = Math.round(ticks() + 1);

					tickValues = range(n).map((i) => quantile($.get(scale).domain(), i / (n - 1)));
				}

				// if (typeof tickFormat !== "function") {
				//   tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
				// }
			}

			const tickFormat = $$props.tickFormat ?? xScale.tickFormat?.();

			return {
				interpolator,
				tickValues,
				tickFormat,
				swatches: undefined,
				tickLabelOffset: 0,
				tickLine: true,
				tickLength: tickLengthProp(),
				xScale
			};
		} else if ($.get(scale).invertExtent) {
			// Threshold
			const thresholds = $.get(scale).thresholds
				? $.get(scale // scaleQuantize
				).thresholds()
				: $.get(scale).quantiles
					? $.get(scale // scaleQuantile
					).quantiles()
					: $.get(scale // scaleThreshold
					).domain();

			const xScale = scaleLinear().domain([-1, $.get(scale).range().length - 1]).rangeRound([0, width()]);

			const swatches = $.get(scale).range().map((d, i) => {
				return {
					x: xScale(i - 1),
					y: 0,
					width: xScale(i) - xScale(i - 1),
					height: height(),
					fill: d
				};
			});

			const tickValues = range(thresholds.length);

			const tickFormat = (i) => {
				const value = thresholds[i];

				// @ts-expect-error - improve types
				return $$props.tickFormat ? format(value, $$props.tickFormat) : value;
			};

			return {
				xScale,
				swatches,
				tickValues,
				tickFormat,
				tickLabelOffset: 0,
				tickLine: true,
				tickLength: tickLengthProp(),
				interpolator: undefined
			};
		} else {
			// Ordinal
			const xScale = scaleBand().domain($.get(scale).domain()).rangeRound([0, width()]);

			const swatches = $.get(scale).domain().map((d) => {
				return {
					x: xScale(d),
					y: 0,
					width: Math.max(0, xScale.bandwidth() - 1),
					height: height(),
					fill: $.get(scale)(d)
				};
			});

			const tickValues = $.get(scale).domain();
			const tickLabelOffset = xScale.bandwidth() / 2;
			const tickLine = false;
			const tickLength = 0;

			return {
				xScale,
				tickFormat: $$props.tickFormat,
				tickLabelOffset,
				tickLine,
				tickLength,
				tickValues,
				swatches,
				interpolator: undefined
			};
		}
	});

	/**
	 * An ordinal scale is the `else` of `scaleConfig` above — it interpolates nothing and inverts to
	 * no extent.
	 */
	const isOrdinalScale = $.derived(() => !!$.get(scale) && !$.get(scale).interpolate && !$.get(scale).interpolator && !$.get(scale).invertExtent);

	// A ramp reads as a gradient between two ends, which an ordinal scale has no notion of: its
	// domain is a handful of unrelated categories, and a strip of unlabelled blocks names none of
	// them.  Swatches are what a `c` channel without configured series wants.
	const variant = $.derived(() => $$props.variant ?? ($.get(seriesItems) || $.get(isOrdinalScale) ? 'swatches' : 'ramp'));

	const selected = $.derived(() => $$props.selected ?? ctx.series?.selectedKeys?.current ?? []);

	// Position indicator for the currently hovered value on the ramp. If `value`
	// is explicitly provided, use it; otherwise fall back to `ctx.tooltip.data`
	// piped through the chart's color accessor (`ctx.c`).
	const indicatorX = $.derived(() => {
		if ($.get(variant) !== 'ramp' || !$.get(scale)) return null;

		let value = $$props.value;

		if (value == null) {
			const data = ctx.tooltip?.data;

			if (data == null) return null;

			value = ctx.c?.(data);
		}

		if (value == null) return null;

		// Threshold / quantize / quantile scales — scaleConfig.xScale maps swatch
		// *indices* to pixels, not the raw domain value. Find which bucket the
		// value falls into and center on that swatch.
		if ($.get(scale).invertExtent) {
			const i = $.get(scale).range().indexOf($.get(scale)(value));

			if (i < 0) return null;

			const x0 = $.get(scaleConfig).xScale?.(i - 1);
			const x1 = $.get(scaleConfig).xScale?.(i);

			if (typeof x0 !== 'number' || typeof x1 !== 'number') return null;

			return (x0 + x1) / 2;
		}

		const x = $.get(scaleConfig).xScale?.(value);

		if (typeof x !== 'number' || !Number.isFinite(x)) return null;

		return x + $.get(scaleConfig).tickLabelOffset;
	});

	const swatchItems = $.derived(() => {
		if ($.get(seriesItems)) {
			// Series-based legend items
			return $.get(seriesItems).map((series) => ({
				value: series.key,
				label: series.label,
				color: series.color,
				onclick: (e) => ctx.series?.selectedKeys?.toggle?.(series.key),
				onpointerenter: (e) => {
					ctx.series.highlightKey = series.key;
				},

				onpointerleave: (e) => {
					ctx.series.highlightKey = null;
				},
				selected: $.get(selected).length === 0 || $.get(selected).includes(series.key)
			}));
		} else {
			// Scale-based legend items
			const tickValues = $.get(scaleConfig).tickValues ?? $.get(scaleConfig).xScale?.ticks?.(ticks()) ?? [];

			return tickValues.map((tick) => ({
				value: tick,
				label: $$props.tickFormat ? format(tick, asAny($$props.tickFormat)) : tick,
				color: $.get(scale)?.(tick) ?? '',
				onclick: (e) => ctx.series?.selectedKeys?.toggle?.(tick),
				onpointerenter: (e) => {
					ctx.series.highlightKey = tick;
				},

				onpointerleave: (e) => {
					ctx.series.highlightKey = null;
				},
				selected: $.get(selected).length === 0 || $.get(selected).includes(tick)
			}));
		}
	});

	var div = root_7();

	$.attribute_effect(
		div,
		($0) => ({ ...restProps, 'data-placement': $$props.placement, class: $0 }),
		[
			() => cls('lc-legend-container', $$props.class, classes().root)
		],
		void 0,
		void 0,
		'svelte-az0af5'
	);

	var div_1 = $.child(div);
	var text = $.only_child(div_1, true);
	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				let $0 = $.derived(() => ({
					values: $.get(scaleConfig).tickValues ?? $.get(scaleConfig).xScale?.ticks?.(ticks()) ?? [],
					scale: $.get(scale),
					seriesItems: $.get(seriesItems)
				}));

				$.snippet(node_1, () => $$props.children, () => $.get($0));
			}

			$.append($$anchor, fragment);
		};

		var consequent_5 = ($$anchor) => {
			const indicatorSize = $.derived(() => 6);
			const tickLabelY = $.derived(() => height() + tickLengthProp() + tickFontSize());
			const svgHeight = $.derived(() => $.get(tickLabelY));
			var svg = root_4();
			var g = $.child(svg);
			var node_2 = $.child(g);

			{
				var consequent_1 = ($$anchor) => {
					ColorRamp($$anchor, {
						get width() {
							return width();
						},

						get height() {
							return height();
						},

						get interpolator() {
							return $.get(scaleConfig).interpolator;
						},
						class: 'lc-legend-color-ramp'
					});
				};

				var consequent_2 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					$.each(node_3, 17, () => $.get(scaleConfig).swatches, $.index, ($$anchor, swatch) => {
						var rect = root();

						$.attribute_effect(
							rect,
							($0) => ({ ...$0 }),
							[
								() => extractLayerProps($.get(swatch), 'lc-legend-ramp-swatch')
							],
							void 0,
							void 0,
							'svelte-az0af5'
						);

						$.append($$anchor, rect);
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_2, ($$render) => {
					if ($.get(scaleConfig).interpolator) $$render(consequent_1); else if ($.get(scaleConfig).swatches) $$render(consequent_2, 1);
				});
			}

			$.reset(g);

			var g_1 = $.sibling(g);

			$.each(g_1, 21, () => $$props.tickValues ?? $.get(scaleConfig).xScale?.ticks?.(ticks()) ?? [], $.index, ($$anchor, tick) => {
				var fragment_3 = root_2();
				var text_1 = $.first_child(fragment_3);
				let styles;
				var text_2 = $.only_child(text_1, true);
				var node_4 = $.sibling(text_1);

				{
					var consequent_3 = ($$anchor) => {
						var line = root_1();

						$.set_attribute(line, 'y1', 0);

						$.template_effect(
							($0, $1, $2) => {
								$.set_attribute(line, 'x1', $0);
								$.set_attribute(line, 'x2', $1);
								$.set_attribute(line, 'y2', height() + tickLengthProp());
								$.set_class(line, 0, $2, 'svelte-az0af5');
							},
							[
								() => $.get(scaleConfig).xScale?.($.get(tick)),
								() => $.get(scaleConfig).xScale?.($.get(tick)),
								() => $.clsx(cls('lc-legend-tick-line', classes().tick))
							]
						);

						$.append($$anchor, line);
					};

					$.if(node_4, ($$render) => {
						if ($.get(scaleConfig).tickLine) $$render(consequent_3);
					});
				}

				$.template_effect(
					($0, $1, $2) => {
						$.set_attribute(text_1, 'x', $0);
						$.set_attribute(text_1, 'y', $.get(tickLabelY));
						$.set_class(text_1, 0, $1, 'svelte-az0af5');
						styles = $.set_style(text_1, '', styles, { 'font-size': tickFontSize() });
						$.set_text(text_2, $2);
					},
					[
						() => $.get(scaleConfig).xScale?.($.get(tick)) + $.get(scaleConfig).tickLabelOffset,
						() => $.clsx(cls('lc-legend-tick-text', classes().label)),
						() => $$props.tickFormat
							? format($.get(tick), asAny($$props.tickFormat))
							: $.get(tick)
					]
				);

				$.append($$anchor, fragment_3);
			});

			$.reset(g_1);

			var node_5 = $.sibling(g_1);

			{
				var consequent_4 = ($$anchor) => {
					var path = root_3();

					$.template_effect(
						($0) => {
							$.set_attribute(path, 'd', `M${$.get(indicatorX) - 4},${height() + $.get(indicatorSize) + 1} L${$.get(indicatorX) + 4},${height() + $.get(indicatorSize) + 1} L${$.get(indicatorX) ?? ''},${height() ?? ''} Z`);
							$.set_class(path, 0, $0, 'svelte-az0af5');
						},
						[() => $.clsx(cls('lc-legend-indicator'))]
					);

					$.append($$anchor, path);
				};

				$.if(node_5, ($$render) => {
					if ($.get(indicatorX) != null) $$render(consequent_4);
				});
			}

			$.reset(svg);

			$.template_effect(
				($0) => {
					$.set_attribute(svg, 'width', width());
					$.set_attribute(svg, 'height', $.get(svgHeight));
					$.set_attribute(svg, 'viewBox', `0 0 ${width() ?? ''} ${$.get(svgHeight) ?? ''}`);
					$.set_class(svg, 0, $0, 'svelte-az0af5');
				},
				[() => $.clsx(cls('lc-legend-ramp-svg'))]
			);

			$.append($$anchor, svg);
		};

		var consequent_6 = ($$anchor) => {
			var div_2 = root_6();

			$.each(div_2, 21, () => $.get(swatchItems), $.index, ($$anchor, item) => {
				var button = root_5();
				let styles_1;
				var div_3 = $.child(button);
				let styles_2;
				var div_4 = $.sibling(div_3, 2);
				var text_3 = $.only_child(div_4, true);

				$.reset(button);

				$.template_effect(
					($0, $1, $2, $3) => {
						$.set_class(button, 1, $0, 'svelte-az0af5');
						styles_1 = $.set_style(button, '', styles_1, { opacity: $1 });
						$.set_class(div_3, 1, $2, 'svelte-az0af5');
						styles_2 = $.set_style(div_3, '', styles_2, { 'background-color': $.get(item).color });
						$.set_class(div_4, 1, $3, 'svelte-az0af5');
						$.set_text(text_3, $.get(item).label);
					},
					[
						() => $.clsx(cls('lc-legend-swatch-button', resolveMaybeFn(classes()?.item, $.get(item)))),
						() => $.get(selected).length === 0 || $.get(selected).includes($.get(item).value) ? 1 : 0.3,
						() => $.clsx(cls('lc-legend-swatch', classes().swatch)),
						() => $.clsx(cls('lc-legend-swatch-label', classes().label))
					]
				);

				$.delegated('click', button, (e) => $$props.onclick?.(e, $.get(item)) ?? $.get(item).onclick?.(e));
				$.event('pointerenter', button, (e) => $$props.onpointerenter?.(e, $.get(item)) ?? $.get(item).onpointerenter?.(e));
				$.event('pointerleave', button, (e) => $$props.onpointerleave?.(e, $.get(item)) ?? $.get(item).onpointerleave?.(e));
				$.append($$anchor, button);
			});

			$.reset(div_2);

			$.template_effect(
				($0) => {
					$.set_class(div_2, 1, $0, 'svelte-az0af5');
					$.set_attribute(div_2, 'data-orientation', orientation());
				},
				[() => $.clsx(cls('lc-legend-swatch-group', classes().items))]
			);

			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else if ($.get(variant) === 'ramp') $$render(consequent_5, 1); else if ($.get(variant) === 'swatches') $$render(consequent_6, 2);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));

	$.template_effect(
		($0) => {
			$.set_class(div_1, 1, $0, 'svelte-az0af5');
			$.set_text(text, title());
		},
		[() => $.clsx(cls('lc-legend-title', classes().title))]
	);

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);