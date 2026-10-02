import * as $ from 'svelte/internal/server';
import { scaleBand, scaleLinear } from 'd3-scale';
import { quantize, interpolate, interpolateRound } from 'd3-interpolate';
import { quantile, range } from 'd3-array';
import { format } from '@layerstack/utils';
import ColorRamp from './ColorRamp.svelte';
import { cls } from '@layerstack/tailwind';
import { getChartContext } from '$lib/contexts/chart.js';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { resolveMaybeFn } from '$lib/utils/common.js';
import { asAny } from '$lib/utils/types.js';

export default function Legend($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			scale: scaleProp,
			title = '',
			width = 320,
			height = 10,
			ticks = width / 64,
			tickFormat: tickFormatProp,
			tickValues: tickValuesProp,
			tickFontSize = 10,
			tickLength: tickLengthProp = 4,
			placement,
			orientation = 'horizontal',
			onclick: onclickProp,
			onpointerenter: onpointerenterProp,
			onpointerleave: onpointerleaveProp,
			variant: variantProp,
			selected: selectedProp,
			value: valueProp,
			classes = {},
			ref: refProp = void 0,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;
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
		const scale = $.derived(() => hasSeriesWithColors() ? null : scaleProp ?? ctx.cScale);

		// Create series items for series-based legend
		const seriesItems = $.derived(() => {
			if (!hasSeriesWithColors() || !ctx.series) return null;

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
			if (!scale()) {
				return {
					xScale: undefined,
					interpolator: undefined,
					swatches: undefined,
					tickLabelOffset: 0,
					tickLine: true,
					tickLength: tickLengthProp,
					tickFormat: tickFormatProp,
					tickValues: tickValuesProp
				};
			} else if (scale().interpolate) {
				// Continuous
				const n = Math.min(scale().domain().length, scale().range().length);

				const xScale = scale().copy().rangeRound?.(quantize(interpolate(0, width), n));
				const interpolator = scale().copy().domain(quantize(interpolate(0, 1), n));
				const _tickFormat = tickFormatProp ?? xScale?.tickFormat?.();

				return {
					xScale,
					interpolator,
					tickFormat: _tickFormat,
					tickLabelOffset: 0,
					tickLine: true,
					tickValues: tickValuesProp,
					tickLength: tickLengthProp,
					swatches: undefined
				};
			} else if (scale().interpolator) {
				// Sequential
				const xScale = Object.assign(scale().copy().interpolator(interpolateRound(0, width)), {
					range() {
						return [0, width];
					}
				});

				const interpolator = scale().interpolator();
				let tickValues = tickValuesProp;

				if (!xScale.ticks) {
					if (tickValues === undefined) {
						const n = Math.round(ticks + 1);

						tickValues = range(n).map((i) => quantile(scale().domain(), i / (n - 1)));
					}

					// if (typeof tickFormat !== "function") {
					//   tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
					// }
				}

				const tickFormat = tickFormatProp ?? xScale.tickFormat?.();

				return {
					interpolator,
					tickValues,
					tickFormat,
					swatches: undefined,
					tickLabelOffset: 0,
					tickLine: true,
					tickLength: tickLengthProp,
					xScale
				};
			} else if (scale().invertExtent) {
				// Threshold
				const thresholds = scale().thresholds
					? scale().thresholds()
					: // scaleQuantize
					scale().quantiles
						? scale().quantiles()
						: // scaleQuantile
						scale().domain(); // scaleThreshold

				const xScale = scaleLinear().domain([-1, scale().range().length - 1]).rangeRound([0, width]);

				const swatches = scale().range().map((d, i) => {
					return {
						x: xScale(i - 1),
						y: 0,
						width: xScale(i) - xScale(i - 1),
						height,
						fill: d
					};
				});

				const tickValues = range(thresholds.length);

				const tickFormat = (i) => {
					const value = thresholds[i];

					// @ts-expect-error - improve types
					return tickFormatProp ? format(value, tickFormatProp) : value;
				};

				return {
					xScale,
					swatches,
					tickValues,
					tickFormat,
					tickLabelOffset: 0,
					tickLine: true,
					tickLength: tickLengthProp,
					interpolator: undefined
				};
			} else {
				// Ordinal
				const xScale = scaleBand().domain(scale().domain()).rangeRound([0, width]);

				const swatches = scale().domain().map((d) => {
					return {
						x: xScale(d),
						y: 0,
						width: Math.max(0, xScale.bandwidth() - 1),
						height,
						fill: scale()(d)
					};
				});

				const tickValues = scale().domain();
				const tickLabelOffset = xScale.bandwidth() / 2;
				const tickLine = false;
				const tickLength = 0;

				return {
					xScale,
					tickFormat: tickFormatProp,
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
		const isOrdinalScale = $.derived(() => !!scale() && !scale().interpolate && !scale().interpolator && !scale().invertExtent);

		// A ramp reads as a gradient between two ends, which an ordinal scale has no notion of: its
		// domain is a handful of unrelated categories, and a strip of unlabelled blocks names none of
		// them.  Swatches are what a `c` channel without configured series wants.
		const variant = $.derived(() => variantProp ?? (seriesItems() || isOrdinalScale() ? 'swatches' : 'ramp'));

		const selected = $.derived(() => selectedProp ?? ctx.series?.selectedKeys?.current ?? []);

		// Position indicator for the currently hovered value on the ramp. If `value`
		// is explicitly provided, use it; otherwise fall back to `ctx.tooltip.data`
		// piped through the chart's color accessor (`ctx.c`).
		const indicatorX = $.derived(() => {
			if (variant() !== 'ramp' || !scale()) return null;

			let value = valueProp;

			if (value == null) {
				const data = ctx.tooltip?.data;

				if (data == null) return null;

				value = ctx.c?.(data);
			}

			if (value == null) return null;

			// Threshold / quantize / quantile scales — scaleConfig.xScale maps swatch
			// *indices* to pixels, not the raw domain value. Find which bucket the
			// value falls into and center on that swatch.
			if (scale().invertExtent) {
				const i = scale().range().indexOf(scale()(value));

				if (i < 0) return null;

				const x0 = scaleConfig().xScale?.(i - 1);
				const x1 = scaleConfig().xScale?.(i);

				if (typeof x0 !== 'number' || typeof x1 !== 'number') return null;

				return (x0 + x1) / 2;
			}

			const x = scaleConfig().xScale?.(value);

			if (typeof x !== 'number' || !Number.isFinite(x)) return null;

			return x + scaleConfig().tickLabelOffset;
		});

		const swatchItems = $.derived(() => {
			if (seriesItems()) {
				// Series-based legend items
				return seriesItems().map((series) => ({
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
					selected: selected().length === 0 || selected().includes(series.key)
				}));
			} else {
				// Scale-based legend items
				const tickValues = scaleConfig().tickValues ?? scaleConfig().xScale?.ticks?.(ticks) ?? [];

				return tickValues.map((tick) => ({
					value: tick,
					label: tickFormatProp ? format(tick, asAny(tickFormatProp)) : tick,
					color: scale()?.(tick) ?? '',
					onclick: (e) => ctx.series?.selectedKeys?.toggle?.(tick),
					onpointerenter: (e) => {
						ctx.series.highlightKey = tick;
					},

					onpointerleave: (e) => {
						ctx.series.highlightKey = null;
					},
					selected: selected().length === 0 || selected().includes(tick)
				}));
			}
		});

		$$renderer.push(`<div${$.attributes(
			{
				...restProps,
				'data-placement': placement,
				class: $.clsx(cls('lc-legend-container', className, classes.root))
			},
			'svelte-az0af5'
		)}><div${$.attr_class($.clsx(cls('lc-legend-title', classes.title)), 'svelte-az0af5')}>${$.escape(title)}</div> `);

		if (children) {
			$$renderer.push('<!--[0-->');

			children($$renderer, {
				values: scaleConfig().tickValues ?? scaleConfig().xScale?.ticks?.(ticks) ?? [],
				scale: scale(),
				seriesItems: seriesItems()
			});

			$$renderer.push(`<!---->`);
		} else if (variant() === 'ramp') {
			$$renderer.push('<!--[1-->');

			const indicatorSize = 6;
			const tickLabelY = height + tickLengthProp + tickFontSize;
			const svgHeight = tickLabelY;

			$$renderer.push(`<svg${$.attr('width', width)}${$.attr('height', svgHeight)}${$.attr('viewBox', `0 0 ${$.stringify(width)} ${$.stringify(svgHeight)}`)}${$.attr_class($.clsx(cls('lc-legend-ramp-svg')), 'svelte-az0af5')}><g class="lc-legend-ramp-g">`);

			if (scaleConfig().interpolator) {
				$$renderer.push('<!--[0-->');

				ColorRamp($$renderer, {
					width,
					height,
					interpolator: scaleConfig().interpolator,
					class: 'lc-legend-color-ramp'
				});
			} else if (scaleConfig().swatches) {
				$$renderer.push(`<!--[1--><!--[-->`);

				const each_array = $.ensure_array_like(scaleConfig().swatches);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let swatch = each_array[i];

					$$renderer.push(`<rect${$.attributes({ ...extractLayerProps(swatch, 'lc-legend-ramp-swatch') }, 'svelte-az0af5', void 0, void 0, 3)}></rect>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></g><g class="lc-legend-tick-group"><!--[-->`);

			const each_array_1 = $.ensure_array_like(tickValuesProp ?? scaleConfig().xScale?.ticks?.(ticks) ?? []);

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let tick = each_array_1[i];

				$$renderer.push(`<text text-anchor="middle"${$.attr('x', scaleConfig().xScale?.(tick) + scaleConfig().tickLabelOffset)}${$.attr('y', tickLabelY)}${$.attr_class($.clsx(cls('lc-legend-tick-text', classes.label)), 'svelte-az0af5')}${$.attr_style('', { 'font-size': tickFontSize })}>${$.escape(tickFormatProp ? format(tick, asAny(tickFormatProp)) : tick)}</text>`);

				if (scaleConfig().tickLine) {
					$$renderer.push(`<!--[0--><line${$.attr('x1', scaleConfig().xScale?.(tick))}${$.attr('y1', 0)}${$.attr('x2', scaleConfig().xScale?.(tick))}${$.attr('y2', height + tickLengthProp)}${$.attr_class($.clsx(cls('lc-legend-tick-line', classes.tick)), 'svelte-az0af5')}></line>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></g>`);

			if (indicatorX() != null) {
				$$renderer.push(`<!--[0--><path${$.attr('d', `M${$.stringify(indicatorX() - 4)},${$.stringify(height + indicatorSize + 1)} L${$.stringify(indicatorX() + 4)},${$.stringify(height + indicatorSize + 1)} L${$.stringify(indicatorX())},${$.stringify(height)} Z`)}${$.attr_class($.clsx(cls('lc-legend-indicator')), 'svelte-az0af5')}></path>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></svg>`);
		} else if (variant() === 'swatches') {
			$$renderer.push(`<!--[2--><div${$.attr_class($.clsx(cls('lc-legend-swatch-group', classes.items)), 'svelte-az0af5')}${$.attr('data-orientation', orientation)}><!--[-->`);

			const each_array_2 = $.ensure_array_like(swatchItems());

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let item = each_array_2[$$index_2];

				$$renderer.push(`<button type="button"${$.attr_class($.clsx(cls('lc-legend-swatch-button', resolveMaybeFn(classes?.item, item))), 'svelte-az0af5')}${$.attr_style('', {
					opacity: selected().length === 0 || selected().includes(item.value) ? 1 : 0.3
				})}><div${$.attr_class($.clsx(cls('lc-legend-swatch', classes.swatch)), 'svelte-az0af5')}${$.attr_style('', { 'background-color': item.color })}></div> <div${$.attr_class($.clsx(cls('lc-legend-swatch-label', classes.label)), 'svelte-az0af5')}>${$.escape(item.label)}</div></button>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref: refProp });
	});
}