import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import { setGeoContext } from '$lib/contexts/geo.js';
import { getSettings } from '$lib/contexts/settings.js';
import { setChartContext } from '$lib/contexts/chart.js';
import { getChartGroup } from '$lib/contexts/group.js';
import { ChartState } from '$lib/states/chart.svelte.js';
import { connectToChartGroup } from '$lib/states/group.svelte.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';
import { getObjectOrNull } from '$lib/utils/common.js';
import { expandBandBrushDomain } from '$lib/states/brush.svelte.js';
import TooltipContext from '../tooltip/TooltipContext.svelte';

export default function Chart_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ChartChildren,
			ref: refProp = void 0,
			context: contextProp = void 0,
			$$slots,
			$$events,
			...props
		} = $$props;

		let ssr = $.derived(() => $.fallback(props.ssr, false)),
			pointerEvents = $.derived(() => $.fallback(props.pointerEvents, true)),
			width = $.derived(() => props.width),
			height = $.derived(() => props.height),
			position = $.derived(() => $.fallback(props.position, 'relative')),
			children = $.derived(() => props.children),
			geo = $.derived(() => props.geo),
			tooltipContext = $.derived(() => props.tooltipContext),
			transform = $.derived(() => props.transform),
			onTransform = $.derived(() => props.onTransform),
			ondragend = $.derived(() => props.ondragend),
			ondragstart = $.derived(() => props.ondragstart),
			brush = $.derived(() => props.brush),
			group = $.derived(() => props.group),
			groupOptions = $.derived(() => props.groupOptions),
			motion = $.derived(() => props.motion),
			debug = $.derived(() => $.fallback(props.debug, false)),
			clip = $.derived(() => $.fallback(props.clip, false)),
			onTooltipClick = $.derived(() => props.onTooltipClick),
			className = $.derived(() => props.class),
			restProps = $.derived(() => $.exclude_from_object(props, [
				'ssr',
				'pointerEvents',
				'width',
				'height',
				'position',
				'children',
				'geo',
				'tooltipContext',
				'transform',
				'onTransform',
				'ondragend',
				'ondragstart',
				'brush',
				'group',
				'groupOptions',
				'motion',
				'debug',
				'clip',
				'onTooltipClick',
				'class'
			]));

		// Pass the `$props()` proxy directly — `props.X` reads stay reactive and
		// don't pay the cost of an `{...props}` spread (recursive `ownKeys` across
		// nested rest/spread proxies). Brush selections are supplied as getters so
		// the chart's domain calculation can layer them on top of `props.xDomain`
		// / `props.yDomain` at the read sites.
		const chartState = new ChartState(props);

		let ref = void 0;

		// Update bindable
		contextProp = chartState;

		setChartContext(chartState);
		setGeoContext(chartState.geoState);

		// Join a chart group — an explicit `group` prop, else one provided by an ancestor `<ChartGroup>`
		const inheritedGroup = getChartGroup();

		const resolvedGroup = $.derived(() => group() ?? inheritedGroup);
		const groupSync = connectToChartGroup(chartState, () => resolvedGroup(), () => groupOptions());
		const settings = getSettings();

		// Resolve which projection properties the transform state applies to
		const resolvedApply = $.derived(() => {
			if (transform()?.mode !== 'projection') return { rotation: false, scale: false, translate: false };

			// Auto-detect globe projections from clipAngle (flat projections return 0, globes return > 0)
			let isGlobe = false;

			if (geo()?.projection) {
				const proj = geo().projection();

				isGlobe = (proj.clipAngle?.() ?? 0) > 0;
			}

			const defaults = isGlobe
				? { rotation: true, scale: true, translate: false }
				: { rotation: false, scale: true, translate: true };

			const result = { ...defaults, ...transform()?.apply };

			if (transform()?.apply?.rotation === true && transform()?.apply?.translate == null) {
				result.translate = false;
			}

			if (transform()?.apply?.translate === true && transform()?.apply?.rotation == null) {
				result.rotation = false;
			}

			return result;
		});

		const initialTransform = $.derived(() => {
			if (transform()?.mode !== 'projection' || !(resolvedApply().translate || resolvedApply().scale) || !geo()?.fitGeojson || !geo()?.projection) {
				return undefined;
			}

			const fitted = geo().projection().fitSize([chartState.width, chartState.height], geo().fitGeojson);
			const t = fitted.translate();

			return { translate: { x: t[0], y: t[1] }, scale: fitted.scale() };
		});

		/**
		 * The zoom a chart opens at, read once `TransformContext` is here to take it.
		 *
		 * Deliberately untracked: `_initialTransform` follows the chart's width, and `TransformContext`
		 * resets whenever its initial values change — so tracking it would snap a panned chart back to
		 * where it started on the next resize.  Reading it at this point picks up the laid-out width.
		 */
		const initialZoom = $.derived(() => {
			if (!TransformContext) return undefined;

			return untrack(() => chartState._initialTransform);
		});

		/**
		 * Where the transform starts — a fitted projection, or the domain a chart opens zoomed to.  The
		 * two are exclusive: one is `mode: 'projection'`, the other `mode: 'domain'`.
		 */
		const resolvedInitialTransform = $.derived(() => transform()?.mode === 'projection'
			? {
				translate: resolvedApply().translate ? initialTransform()?.translate : undefined,
				scale: resolvedApply().scale ? initialTransform()?.scale : undefined
			}
			: {
				translate: initialZoom()?.translate,
				scale: initialZoom()?.scale
			});

		const processTranslate = $.derived(() => {
			if (resolvedApply().rotation && chartState.geoState?.projection) {
				return (x, y, deltaX, deltaY) => {
					const projectionScale = chartState.geoState.projection.scale() ?? 0;
					const sensitivity = 75;

					return {
						x: x + deltaX * (sensitivity / projectionScale),
						y: y + deltaY * (sensitivity / projectionScale) * -1
					};
				};
			}

			return undefined;
		});

		const domainExtentConstrain = $.derived(() => {
			const de = transform()?.domainExtent;

			if (!de) return undefined;

			return (t) => {
				let { scale, translate } = t;

				const resolveValue = (val, baseDomainValue) => {
					if (val === undefined) return undefined;

					if (val === 'data') {
						if (baseDomainValue instanceof Date) return baseDomainValue.getTime();

						return baseDomainValue;
					}

					if (val instanceof Date) return val.getTime();

					return val;
				};

				const constrainAxis = (axisTranslate, axisScale, dimension, baseDomain, extent) => {
					if (!extent || baseDomain.length < 2 || dimension <= 0) return axisTranslate;

					const d0 = baseDomain[0];
					const d1 = baseDomain[1];

					if (typeof d0 === 'string') return axisTranslate;

					const isDate = d0 instanceof Date;
					const rawD0 = isDate ? d0.getTime() : d0;
					const rawD1 = isDate ? d1.getTime() : d1;
					const range = Math.abs(rawD1 - rawD0);

					if (!isFinite(range) || range === 0) return axisTranslate;

					const reversed = rawD0 > rawD1;

					const normTranslate = reversed
						? dimension * axisScale - axisTranslate - dimension
						: axisTranslate;

					const numMin = Math.min(rawD0, rawD1);
					const rawMinVal = resolveValue(extent.min, baseDomain[0]);
					const rawMaxVal = resolveValue(extent.max, baseDomain[1]);
					const minVal = rawMinVal != null && rawMaxVal != null ? Math.min(rawMinVal, rawMaxVal) : rawMinVal;
					const maxVal = rawMinVal != null && rawMaxVal != null ? Math.max(rawMinVal, rawMaxVal) : rawMaxVal;
					const f0 = -normTranslate / axisScale / dimension;
					const f1 = (dimension - normTranslate) / axisScale / dimension;
					let visMin = numMin + f0 * range;
					let visMax = numMin + f1 * range;
					const visRange = visMax - visMin;

					if (extent.minRange != null && visRange < extent.minRange) {
						const center = (visMin + visMax) / 2;

						visMin = center - extent.minRange / 2;
						visMax = center + extent.minRange / 2;
					}

					if (minVal != null && visMin < minVal) {
						visMin = minVal;
						visMax = visMin + (extent.minRange != null && visRange < extent.minRange ? extent.minRange : visRange);
					}

					if (maxVal != null && visMax > maxVal) {
						visMax = maxVal;
						visMin = visMax - (extent.minRange != null && visRange < extent.minRange ? extent.minRange : visRange);

						if (minVal != null && visMin < minVal) visMin = minVal;
					}

					const newF0 = (visMin - numMin) / range;
					const result = -newF0 * axisScale * dimension;

					return reversed ? dimension * axisScale - result - dimension : result;
				};

				const transformAxis = transform()?.axis ?? 'both';

				if (de.x && (transformAxis === 'x' || transformAxis === 'both') && chartState.width > 0) {
					if (de.x.minRange != null && chartState._baseXDomain.length >= 2) {
						const d0 = chartState._baseXDomain[0];
						const d1 = chartState._baseXDomain[1];
						const isDate = d0 instanceof Date;
						const numD0 = isDate ? d0.getTime() : d0;
						const numD1 = isDate ? d1.getTime() : d1;
						const fullRange = Math.abs(numD1 - numD0);

						if (fullRange > 0) {
							const maxScale = fullRange / de.x.minRange;

							scale = Math.min(scale, maxScale);
						}
					}

					translate = {
						...translate,
						x: constrainAxis(translate.x, scale, chartState.width, chartState._baseXDomain, de.x)
					};
				}

				if (de.y && (transformAxis === 'y' || transformAxis === 'both') && chartState.height > 0) {
					if (de.y.minRange != null && chartState._baseYDomain.length >= 2) {
						const d0 = chartState._baseYDomain[0];
						const d1 = chartState._baseYDomain[1];
						const isDate = d0 instanceof Date;
						const numD0 = isDate ? d0.getTime() : d0;
						const numD1 = isDate ? d1.getTime() : d1;
						const fullRange = Math.abs(numD1 - numD0);

						if (fullRange > 0) {
							const maxScale = fullRange / de.y.minRange;

							scale = Math.min(scale, maxScale);
						}
					}

					translate = {
						...translate,
						y: constrainAxis(translate.y, scale, chartState.height, chartState._baseYDomain, de.y)
					};
				}

				return { scale, translate };
			};
		});

		const isBandDomainTransform = $.derived(() => transform()?.mode === 'domain' && ((transform().axis ?? 'both') !== 'y' && isScaleBand(chartState._xScaleProp) || (transform().axis ?? 'both') !== 'x' && isScaleBand(chartState._yScaleProp)));

		const resolvedScaleExtent = $.derived(() => {
			if (transform()?.mode === 'projection' && transform()?.scaleExtent && initialTransform()) {
				const baseScale = initialTransform().scale;

				return [
					transform().scaleExtent[0] * baseScale,
					transform().scaleExtent[1] * baseScale
				];
			}

			if (!isBandDomainTransform()) return transform()?.scaleExtent;

			const userExtent = transform()?.scaleExtent;

			return [
				Math.max(1, userExtent?.[0] ?? 1),
				userExtent?.[1] ?? Infinity
			];
		});

		const resolvedTranslateExtent = $.derived(() => {
			if (transform()?.mode === 'projection' && transform()?.translateExtent) {
				if (resolvedApply().rotation) {
					return transform().translateExtent;
				}

				return undefined;
			}

			return transform()?.translateExtent;
		});

		const projectionTranslateConstrain = $.derived(() => {
			if (transform()?.mode !== 'projection' || !transform()?.translateExtent || !initialTransform() || resolvedApply().rotation) {
				return undefined;
			}

			const baseScale = initialTransform().scale;
			const baseTranslate = initialTransform().translate;
			const [[x0, y0], [x1, y1]] = transform().translateExtent;

			return (t) => {
				let { scale, translate } = t;
				const k = scale / baseScale;

				translate = {
					x: Math.max(baseTranslate.x + x0 * k, Math.min(baseTranslate.x + x1 * k, translate.x)),
					y: Math.max(baseTranslate.y + y0 * k, Math.min(baseTranslate.y + y1 * k, translate.y))
				};

				return { scale, translate };
			};
		});

		const bandScaleConstrain = $.derived(() => {
			if (!isBandDomainTransform()) return undefined;

			const xIsBand = (transform().axis ?? 'both') !== 'y' && isScaleBand(chartState._xScaleProp);
			const yIsBand = (transform().axis ?? 'both') !== 'x' && isScaleBand(chartState._yScaleProp);

			return (t) => {
				let { scale, translate } = t;
				let tx = translate.x;
				let ty = translate.y;

				if (xIsBand) {
					tx = Math.max(chartState.width * (1 - scale), Math.min(0, tx));
				}

				if (yIsBand) {
					ty = Math.max(chartState.height * (1 - scale), Math.min(0, ty));
				}

				return { scale, translate: { x: tx, y: ty } };
			};
		});

		const composedConstrain = $.derived(() => {
			const userConstrain = transform()?.constrain;

			const constrains = [
				bandScaleConstrain(),
				domainExtentConstrain(),
				projectionTranslateConstrain(),
				userConstrain
			].filter(Boolean);

			if (constrains.length === 0) return undefined;
			if (constrains.length === 1) return constrains[0];

			return (t) => {
				return constrains.reduce((acc, fn) => fn(acc), t);
			};
		});

		const enhancedBrushProps = $.derived(() => {
			if (!brush()) return { disabled: true };

			const userProps = typeof brush() === 'object' ? brush() : {};
			const userOnChange = userProps.onChange;
			const userOnBrushEnd = userProps.onBrushEnd;
			const zoomOnBrush = 'zoomOnBrush' in userProps ? userProps.zoomOnBrush : false;

			// Brush-to-zoom consumes the selection (it becomes the domain) and resets it afterwards.
			// Sharing must not opt a plain brush into that — it would wipe the selection on release.
			const zoomsOnBrush = transform()?.mode === 'domain' || zoomOnBrush;

			const sharesBrush = resolvedGroup()?.brushOptions != null;

			if (!zoomsOnBrush && !sharesBrush) return userProps;

			return {
				...userProps,
				// Publish live so followers track the drag, not just its result
				onChange: (e) => {
					groupSync.publishBrush(e.brush);
					userOnChange?.(e);
				},

				onBrushEnd: (e) => {
					if (!zoomsOnBrush) {
						// Nothing to publish — the gesture reports every change through `onChange`, clearing
						// on a click included
						userOnBrushEnd?.(e);

						return;
					}

					if (e.brush.active) {
						if (transform()?.mode === 'domain') {
							chartState.zoomToBrush(e.brush, userProps.axis ?? 'x');
						} else if (zoomOnBrush) {
							const axis = userProps.axis ?? 'x';

							if (axis === 'x' || axis === 'both') {
								chartState.brushXDomain = expandBandBrushDomain(e.brush.x, chartState._baseXDomain);
							}

							if (axis === 'y' || axis === 'both') {
								chartState.brushYDomain = expandBandBrushDomain(e.brush.y, chartState._baseYDomain);
							}

							groupSync.publishDomain(chartState.brushXDomain, chartState.brushYDomain);
						}

						userOnBrushEnd?.(e);
						e.brush.reset();
					} else {
						if (transform()?.mode === 'domain') {
							chartState.transform.reset();
						} else if (zoomOnBrush) {
							chartState.brushXDomain = undefined;
							chartState.brushYDomain = undefined;
							groupSync.publishDomain(undefined, undefined);
						}

						userOnBrushEnd?.(e);
					}

					// the selection was just reset above, so this publishes the cleared state
					groupSync.publishBrush(e.brush);
				}
			};
		});

		// Lazy-load interaction contexts into state rather than nested `{#await import()}`
		// blocks in the template.  Nested awaits (and awaits that render a shared snippet
		// across their pending/then branches) fail to resolve under Svelte's experimental
		// `async` compiler mode, leaving the chart blank when `brush` and `transform` are
		// combined.  Loading via `$effect` + `{#if}` sidesteps `{#await}` entirely.  An
		// `$effect` (not `$derived.by`) is used deliberately: awaiting an `import()` inside
		// a `$derived` would require consumers to compile with `experimental.async`.
		let TransformContext = void 0;

		let BrushContext = void 0;

		function body($$renderer) {
			if (ChartChildren) {
				$$renderer.push('<!--[0-->');

				if (ChartChildren) {
					$$renderer.push('<!--[-->');

					ChartChildren($$renderer, $.spread_props([
						{ children: children(), tooltipContext: tooltipContext() },
						restProps()
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
				children()?.($$renderer, { context: chartState });
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]-->`);
		}

		function inner($$renderer) {
			if (brush() && BrushContext) {
				$$renderer.push('<!--[0-->');

				if (BrushContext) {
					$$renderer.push('<!--[-->');

					BrushContext($$renderer, $.spread_props([
						enhancedBrushProps(),
						{
							get state() {
								return chartState.brushState;
							},

							set state($$value) {
								chartState.brushState = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								TooltipContext($$renderer, $.spread_props([
									{ onclick: onTooltipClick() },
									getObjectOrNull(tooltipContext()),
									{
										get state() {
											return chartState.tooltipState;
										},

										set state($$value) {
											chartState.tooltipState = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											body($$renderer);
										},
										$$slots: { default: true }
									}
								]));
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

				TooltipContext($$renderer, $.spread_props([
					{ onclick: onTooltipClick() },
					getObjectOrNull(tooltipContext()),
					{
						get state() {
							return chartState.tooltipState;
						},

						set state($$value) {
							chartState.tooltipState = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							body($$renderer);
						},
						$$slots: { default: true }
					}
				]));
			}

			$$renderer.push(`<!--]-->`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ssr() === true || typeof window !== 'undefined') {
				$$renderer.push(`<!--[0--><div${$.attributes(
					{
						class: $.clsx(['lc-root-container', className()]),
						...restProps()
					},
					'svelte-1nbuup4',
					void 0,
					{
						position,
						top: position() === 'absolute' ? 0 : null,
						right: position() === 'absolute' ? 0 : null,
						bottom: position() === 'absolute' ? 0 : null,
						left: position() === 'absolute' ? 0 : null,
						'pointer-events': pointerEvents() === false ? 'none' : null,
						overflow: clip() ? 'hidden' : null,
						width: width() ? `${width()}px` : '100%',
						height: height() ? `${height()}px` : '100%'
					}
				)}><!---->`);

				{
					if (transform() && TransformContext) {
						$$renderer.push('<!--[0-->');

						const {
							domainExtent: _de,
							constrain: _uc,
							apply: _apply,
							scaleExtent: _se,
							translateExtent: _te,
							...transformProps
						} = transform();

						if (TransformContext) {
							$$renderer.push('<!--[-->');

							TransformContext($$renderer, $.spread_props([
								{
									mode: transform().mode ?? 'none',
									initialTranslate: resolvedInitialTransform().translate,
									initialScale: resolvedInitialTransform().scale,
									processTranslate: processTranslate()
								},
								transformProps,
								{
									scaleExtent: resolvedScaleExtent(),
									translateExtent: resolvedTranslateExtent(),
									constrain: composedConstrain(),
									disablePointer: brush() === true || typeof brush() === 'object' && !brush().disabled || transform().disablePointer,
									ondragstart: ondragstart(),
									onTransform: onTransform(),
									ondragend: ondragend(),
									get state() {
										return chartState.transformState;
									},

									set state($$value) {
										chartState.transformState = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										inner($$renderer);
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
						inner($$renderer);
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref: refProp, context: contextProp });
	});
}