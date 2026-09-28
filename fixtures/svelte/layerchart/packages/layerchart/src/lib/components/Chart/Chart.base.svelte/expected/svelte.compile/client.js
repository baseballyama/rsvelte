import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ChartChildren',
	'ref',
	'context'
]);

var root = $.from_html(`<div><!></div>`);

export default function Chart_base($$anchor, $$props) {
	$.push($$props, true);

	const // Pass the `$props()` proxy directly — `props.X` reads stay reactive and
	// don't pay the cost of an `{...props}` spread (recursive `ownKeys` across
	// nested rest/spread proxies). Brush selections are supplied as getters so
	// the chart's domain calculation can layer them on top of `props.xDomain`
	// / `props.yDomain` at the read sites.
	// Update bindable
	// Join a chart group — an explicit `group` prop, else one provided by an ancestor `<ChartGroup>`
	// Resolve which projection properties the transform state applies to
	// Auto-detect globe projections from clipAngle (flat projections return 0, globes return > 0)
	/**
	 * The zoom a chart opens at, read once `TransformContext` is here to take it.
	 *
	 * Deliberately untracked: `_initialTransform` follows the chart's width, and `TransformContext`
	 * resets whenever its initial values change — so tracking it would snap a panned chart back to
	 * where it started on the next resize.  Reading it at this point picks up the laid-out width.
	 */
	/**
	 * Where the transform starts — a fitted projection, or the domain a chart opens zoomed to.  The
	 * two are exclusive: one is `mode: 'projection'`, the other `mode: 'domain'`.
	 */
	// Brush-to-zoom consumes the selection (it becomes the domain) and resets it afterwards.
	// Sharing must not opt a plain brush into that — it would wipe the selection on release.
	// Publish live so followers track the drag, not just its result
	// Nothing to publish — the gesture reports every change through `onChange`, clearing
	// on a click included
	// the selection was just reset above, so this publishes the cleared state
	// Lazy-load interaction contexts into state rather than nested `{#await import()}`
	// blocks in the template.  Nested awaits (and awaits that render a shared snippet
	// across their pending/then branches) fail to resolve under Svelte's experimental
	// `async` compiler mode, leaving the chart blank when `brush` and `transform` are
	// combined.  Loading via `$effect` + `{#if}` sidesteps `{#await}` entirely.  An
	// `$effect` (not `$derived.by`) is used deliberately: awaiting an `import()` inside
	// a `$derived` would require consumers to compile with `experimental.async`.
	body = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => $$props.ChartChildren, ($$anchor, ChartChildren_1) => {
					ChartChildren_1($$anchor, $.spread_props(
						{
							get children() {
								return $.get(children);
							},

							get tooltipContext() {
								return $.get(tooltipContext);
							}
						},
						() => $.get(restProps)
					));
				});

				$.append($$anchor, fragment_1);
			};

			var alternate = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.snippet(node_2, () => $.get(children) ?? $.noop, () => ({ context: chartState }));
				$.append($$anchor, fragment_2);
			};

			$.if(node, ($$render) => {
				if ($$props.ChartChildren) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	const inner = ($$anchor) => {
		var fragment_3 = $.comment();
		var node_3 = $.first_child(fragment_3);

		{
			var consequent_1 = ($$anchor) => {
				var fragment_4 = $.comment();
				var node_4 = $.first_child(fragment_4);

				$.component(node_4, () => $.get(BrushContext), ($$anchor, BrushContext_1) => {
					BrushContext_1($$anchor, $.spread_props(() => $.get(enhancedBrushProps), {
						get state() {
							return chartState.brushState;
						},

						set state($$value) {
							chartState.brushState = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => getObjectOrNull($.get(tooltipContext)));

								TooltipContext($$anchor, $.spread_props(
									{
										get onclick() {
											return $.get(onTooltipClick);
										}
									},
									() => $.get($0),
									{
										get state() {
											return chartState.tooltipState;
										},

										set state($$value) {
											chartState.tooltipState = $$value;
										},

										children: ($$anchor, $$slotProps) => {
											body($$anchor);
										},
										$$slots: { default: true }
									}
								));
							}
						},
						$$slots: { default: true }
					}));
				});

				$.append($$anchor, fragment_4);
			};

			var alternate_1 = ($$anchor) => {
				{
					let $0 = $.derived(() => getObjectOrNull($.get(tooltipContext)));

					TooltipContext($$anchor, $.spread_props(
						{
							get onclick() {
								return $.get(onTooltipClick);
							}
						},
						() => $.get($0),
						{
							get state() {
								return chartState.tooltipState;
							},

							set state($$value) {
								chartState.tooltipState = $$value;
							},

							children: ($$anchor, $$slotProps) => {
								body($$anchor);
							},
							$$slots: { default: true }
						}
					));
				}
			};

			$.if(node_3, ($$render) => {
				if ($.get(brush) && $.get(BrushContext)) $$render(consequent_1); else $$render(alternate_1, -1);
			});
		}

		$.append($$anchor, fragment_3);
	};

	let refProp = $.prop($$props, 'ref', 15),
		contextProp = $.prop($$props, 'context', 15),
		props = $.rest_props($$props, rest_excludes);

	let ssr = $.derived(() => $.fallback($$props.ssr, false)),
		pointerEvents = $.derived(() => $.fallback($$props.pointerEvents, true)),
		width = $.derived(() => $$props.width),
		height = $.derived(() => $$props.height),
		position = $.derived(() => $.fallback($$props.position, 'relative')),
		children = $.derived(() => $$props.children),
		geo = $.derived(() => $$props.geo),
		tooltipContext = $.derived(() => $$props.tooltipContext),
		transform = $.derived(() => $$props.transform),
		onTransform = $.derived(() => $$props.onTransform),
		ondragend = $.derived(() => $$props.ondragend),
		ondragstart = $.derived(() => $$props.ondragstart),
		brush = $.derived(() => $$props.brush),
		group = $.derived(() => $$props.group),
		groupOptions = $.derived(() => $$props.groupOptions),
		motion = $.derived(() => $$props.motion),
		debug = $.derived(() => $.fallback($$props.debug, false)),
		clip = $.derived(() => $.fallback($$props.clip, false)),
		onTooltipClick = $.derived(() => $$props.onTooltipClick),
		className = $.derived(() => $$props.class),
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

	const chartState = new ChartState(props);
	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
		chartState.containerRef = $.get(ref);
	});

	// Update bindable
	contextProp(chartState);

	setChartContext(chartState);
	setGeoContext(chartState.geoState);

	// Join a chart group — an explicit `group` prop, else one provided by an ancestor `<ChartGroup>`
	const inheritedGroup = getChartGroup();

	const resolvedGroup = $.derived(() => $.get(group) ?? inheritedGroup);
	const groupSync = connectToChartGroup(chartState, () => $.get(resolvedGroup), () => $.get(groupOptions));
	const settings = getSettings();

	$.user_effect(() => {
		settings.debug = $.get(debug);
	});

	// Resolve which projection properties the transform state applies to
	const resolvedApply = $.derived(() => {
		if ($.get(transform)?.mode !== 'projection') return { rotation: false, scale: false, translate: false };

		// Auto-detect globe projections from clipAngle (flat projections return 0, globes return > 0)
		let isGlobe = false;

		if ($.get(geo)?.projection) {
			const proj = $.get(geo).projection();

			isGlobe = (proj.clipAngle?.() ?? 0) > 0;
		}

		const defaults = isGlobe
			? { rotation: true, scale: true, translate: false }
			: { rotation: false, scale: true, translate: true };

		const result = { ...defaults, ...$.get(transform)?.apply };

		if ($.get(transform)?.apply?.rotation === true && $.get(transform)?.apply?.translate == null) {
			result.translate = false;
		}

		if ($.get(transform)?.apply?.translate === true && $.get(transform)?.apply?.rotation == null) {
			result.rotation = false;
		}

		return result;
	});

	$.user_pre_effect(() => {
		if (chartState.geoState) {
			chartState.geoState.transformApply = $.get(resolvedApply);
		}
	});

	const initialTransform = $.derived(() => {
		if ($.get(transform)?.mode !== 'projection' || !($.get(resolvedApply).translate || $.get(resolvedApply).scale) || !$.get(geo)?.fitGeojson || !$.get(geo)?.projection) {
			return undefined;
		}

		const fitted = $.get(geo).projection().fitSize([chartState.width, chartState.height], $.get(geo).fitGeojson);
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
		if (!$.get(TransformContext)) return undefined;

		return untrack(() => chartState._initialTransform);
	});

	/**
	 * Where the transform starts — a fitted projection, or the domain a chart opens zoomed to.  The
	 * two are exclusive: one is `mode: 'projection'`, the other `mode: 'domain'`.
	 */
	const resolvedInitialTransform = $.derived(() => $.get(transform)?.mode === 'projection'
		? {
			translate: $.get(resolvedApply).translate ? $.get(initialTransform)?.translate : undefined,
			scale: $.get(resolvedApply).scale ? $.get(initialTransform)?.scale : undefined
		}
		: {
			translate: $.get(initialZoom)?.translate,
			scale: $.get(initialZoom)?.scale
		});

	const processTranslate = $.derived(() => {
		if ($.get(resolvedApply).rotation && chartState.geoState?.projection) {
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
		const de = $.get(transform)?.domainExtent;

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

			const transformAxis = $.get(transform)?.axis ?? 'both';

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

	const isBandDomainTransform = $.derived(() => $.get(transform)?.mode === 'domain' && (($.get(transform).axis ?? 'both') !== 'y' && isScaleBand(chartState._xScaleProp) || ($.get(transform).axis ?? 'both') !== 'x' && isScaleBand(chartState._yScaleProp)));

	const resolvedScaleExtent = $.derived(() => {
		if ($.get(transform)?.mode === 'projection' && $.get(transform)?.scaleExtent && $.get(initialTransform)) {
			const baseScale = $.get(initialTransform).scale;

			return [
				$.get(transform).scaleExtent[0] * baseScale,
				$.get(transform).scaleExtent[1] * baseScale
			];
		}

		if (!$.get(isBandDomainTransform)) return $.get(transform)?.scaleExtent;

		const userExtent = $.get(transform)?.scaleExtent;

		return [
			Math.max(1, userExtent?.[0] ?? 1),
			userExtent?.[1] ?? Infinity
		];
	});

	const resolvedTranslateExtent = $.derived(() => {
		if ($.get(transform)?.mode === 'projection' && $.get(transform)?.translateExtent) {
			if ($.get(resolvedApply).rotation) {
				return $.get(transform).translateExtent;
			}

			return undefined;
		}

		return $.get(transform)?.translateExtent;
	});

	const projectionTranslateConstrain = $.derived(() => {
		if ($.get(transform)?.mode !== 'projection' || !$.get(transform)?.translateExtent || !$.get(initialTransform) || $.get(resolvedApply).rotation) {
			return undefined;
		}

		const baseScale = $.get(initialTransform).scale;
		const baseTranslate = $.get(initialTransform).translate;
		const [[x0, y0], [x1, y1]] = $.get(transform).translateExtent;

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
		if (!$.get(isBandDomainTransform)) return undefined;

		const xIsBand = ($.get(transform).axis ?? 'both') !== 'y' && isScaleBand(chartState._xScaleProp);
		const yIsBand = ($.get(transform).axis ?? 'both') !== 'x' && isScaleBand(chartState._yScaleProp);

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
		const userConstrain = $.get(transform)?.constrain;

		const constrains = [
			$.get(bandScaleConstrain),
			$.get(domainExtentConstrain),
			$.get(projectionTranslateConstrain),
			userConstrain
		].filter(Boolean);

		if (constrains.length === 0) return undefined;
		if (constrains.length === 1) return constrains[0];

		return (t) => {
			return constrains.reduce((acc, fn) => fn(acc), t);
		};
	});

	const enhancedBrushProps = $.derived(() => {
		if (!$.get(brush)) return { disabled: true };

		const userProps = typeof $.get(brush) === 'object' ? $.get(brush) : {};
		const userOnChange = userProps.onChange;
		const userOnBrushEnd = userProps.onBrushEnd;
		const zoomOnBrush = 'zoomOnBrush' in userProps ? userProps.zoomOnBrush : false;

		// Brush-to-zoom consumes the selection (it becomes the domain) and resets it afterwards.
		// Sharing must not opt a plain brush into that — it would wipe the selection on release.
		const zoomsOnBrush = $.get(transform)?.mode === 'domain' || zoomOnBrush;

		const sharesBrush = $.get(resolvedGroup)?.brushOptions != null;

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
					if ($.get(transform)?.mode === 'domain') {
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
					if ($.get(transform)?.mode === 'domain') {
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
	let TransformContext = $.state(void 0);

	let BrushContext = $.state(void 0);

	$.user_effect(() => {
		if ($.get(transform) && !$.get(TransformContext)) {
			import('../TransformContext.svelte').then((m) => $.set(TransformContext, m.default, true));
		}
	});

	$.user_effect(() => {
		if ($.get(brush) && !$.get(BrushContext)) {
			import('../BrushContext.svelte').then((m) => $.set(BrushContext, m.default, true));
		}
	});

	var fragment_9 = $.comment();
	var node_5 = $.first_child(fragment_9);

	{
		var consequent_3 = ($$anchor) => {
			var div = root();

			$.attribute_effect(
				div,
				() => ({
					class: ['lc-root-container', $.get(className)],
					...$.get(restProps),
					[$.STYLE]: {
						position: $.get(position),
						top: $.get(position) === 'absolute' ? 0 : null,
						right: $.get(position) === 'absolute' ? 0 : null,
						bottom: $.get(position) === 'absolute' ? 0 : null,
						left: $.get(position) === 'absolute' ? 0 : null,
						'pointer-events': $.get(pointerEvents) === false ? 'none' : null,
						overflow: $.get(clip) ? 'hidden' : null,
						width: $.get(width) ? `${$.get(width)}px` : '100%',
						height: $.get(height) ? `${$.get(height)}px` : '100%'
					}
				}),
				void 0,
				void 0,
				void 0,
				'svelte-1nbuup4'
			);

			var node_6 = $.child(div);

			$.key(node_6, () => chartState.isMounted, ($$anchor) => {
				var fragment_10 = $.comment();
				var node_7 = $.first_child(fragment_10);

				{
					var consequent_2 = ($$anchor) => {
						const computed_const = $.derived(() => {
							const {
								domainExtent: _de,
								constrain: _uc,
								apply: _apply,
								scaleExtent: _se,
								translateExtent: _te,
								...transformProps
							} = $.get(transform);

							return { _de, _uc, _apply, _se, _te, transformProps };
						});

						var fragment_11 = $.comment();
						var node_8 = $.first_child(fragment_11);

						{
							let $0 = $.derived(() => $.get(transform).mode ?? 'none');
							let $1 = $.derived(() => $.get(brush) === true || typeof $.get(brush) === 'object' && !$.get(brush).disabled || $.get(transform).disablePointer);

							$.component(node_8, () => $.get(TransformContext), ($$anchor, TransformContext_1) => {
								TransformContext_1($$anchor, $.spread_props(
									{
										get mode() {
											return $.get($0);
										},

										get initialTranslate() {
											return $.get(resolvedInitialTransform).translate;
										},

										get initialScale() {
											return $.get(resolvedInitialTransform).scale;
										},

										get processTranslate() {
											return $.get(processTranslate);
										}
									},
									() => $.get(computed_const).transformProps,
									{
										get scaleExtent() {
											return $.get(resolvedScaleExtent);
										},

										get translateExtent() {
											return $.get(resolvedTranslateExtent);
										},

										get constrain() {
											return $.get(composedConstrain);
										},

										get disablePointer() {
											return $.get($1);
										},

										get ondragstart() {
											return $.get(ondragstart);
										},

										get onTransform() {
											return $.get(onTransform);
										},

										get ondragend() {
											return $.get(ondragend);
										},

										get state() {
											return chartState.transformState;
										},

										set state($$value) {
											chartState.transformState = $$value;
										},

										children: ($$anchor, $$slotProps) => {
											inner($$anchor);
										},
										$$slots: { default: true }
									}
								));
							});
						}

						$.append($$anchor, fragment_11);
					};

					var alternate_2 = ($$anchor) => {
						inner($$anchor);
					};

					$.if(node_7, ($$render) => {
						if ($.get(transform) && $.get(TransformContext)) $$render(consequent_2); else $$render(alternate_2, -1);
					});
				}

				$.append($$anchor, fragment_10);
			});

			$.reset(div);
			$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));
			$.bind_element_size(div, 'clientWidth', ($$value) => chartState._containerWidth = $$value);
			$.bind_element_size(div, 'clientHeight', ($$value) => chartState._containerHeight = $$value);
			$.append($$anchor, div);
		};

		$.if(node_5, ($$render) => {
			if ($.get(ssr) === true || typeof window !== 'undefined') $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment_9);
	$.pop();
}