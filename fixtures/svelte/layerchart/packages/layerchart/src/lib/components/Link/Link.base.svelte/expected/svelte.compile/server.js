import * as $ from 'svelte/internal/server';
import { curveBumpX, curveBumpY } from 'd3-shape';

import {
	getLinkD3Path,
	getLinkPresetPath,
	getLinkRadialD3Path,
	getLinkRadialPresetPath
} from '$lib/utils/linkUtils.js';

import { getChartContext } from '$lib/contexts/chart.js';
import { getMarkData } from '$lib/contexts/facet.js';
import { accessor } from '$lib/utils/common.js';
import { cls } from '@layerstack/tailwind';
import { createMotion, extractTweenConfig } from '$lib/utils/motion.svelte.js';
import { interpolatePath } from 'd3-interpolate-path';
import { LINK_FALLBACK_COORDS, isAccessorAccessor } from './Link.shared.svelte.js';

export default function Link_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = getChartContext();
		const markData = getMarkData();

		let {
			Path,
			x1,
			y1,
			x2,
			y2,
			data,
			sankey = false,
			source: sourceProp,
			target: targetProp,
			x: xProp,
			y: yProp,
			orientation: orientationProp,
			curve: curveProp,
			type = 'd3',
			sweep: sweepProp,
			radius = 20,
			bend = 22.5,
			radial: radialProp,
			marker,
			markerStart,
			markerMid,
			markerEnd,
			motion,
			pathRef = void 0,
			pathData: pathDataProp,
			class: classProp,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const radial = $.derived(() => radialProp ?? ctx.radial ?? false);

		const orientation = $.derived(() => {
			if (orientationProp) return orientationProp;
			if (sankey) return 'horizontal';

			return 'vertical';
		});

		const curve = $.derived(() => {
			if (curveProp) return curveProp;
			if (orientation() === 'horizontal') return curveBumpX;

			return curveBumpY;
		});

		const sweep = $.derived(() => {
			if (type === 'd3') return sweepProp ?? 'none';
			if (sweepProp && sweepProp !== 'none') return sweepProp;

			return orientation() === 'vertical' ? 'horizontal-vertical' : 'vertical-horizontal';
		});

		const isArrayMode = $.derived(() => isAccessorAccessor(x1) || isAccessorAccessor(y1) || isAccessorAccessor(x2) || isAccessorAccessor(y2));
		const isPixelMode = $.derived(() => !isArrayMode() && (typeof x1 === 'number' || typeof y1 === 'number' || typeof x2 === 'number' || typeof y2 === 'number'));

		const sourceAccessor = $.derived(() => {
			if (sourceProp) return sourceProp;
			if (sankey) return (d) => ({ node: d.source, y: d.y0, isSource: true });

			return (d) => d.source;
		});

		const targetAccessor = $.derived(() => {
			if (targetProp) return targetProp;
			if (sankey) return (d) => ({ node: d.target, y: d.y1, isSource: false });

			return (d) => d.target;
		});

		const xAccessor = $.derived(() => {
			if (xProp) return xProp;
			if (sankey) return (d) => d.isSource ? d.node.x1 : d.node.x0;
			if (radial()) return (d) => d.x;

			return (d) => orientation() === 'horizontal' ? d.y : d.x;
		});

		const yAccessor = $.derived(() => {
			if (yProp) return yProp;
			if (sankey) return (d) => d.y;
			if (radial()) return (d) => d.y;

			return (d) => orientation() === 'horizontal' ? d.x : d.y;
		});

		const x1Accessor = $.derived(() => accessor(x1));
		const y1Accessor = $.derived(() => accessor(y1));
		const x2Accessor = $.derived(() => accessor(x2));
		const y2Accessor = $.derived(() => accessor(y2));

		const resolveArrayCoords = (d) => {
			const sxRaw = x1Accessor()(d);
			const syRaw = y1Accessor()(d);
			const txRaw = x2Accessor()(d);
			const tyRaw = y2Accessor()(d);
			const scaleX = typeof x1 === 'string' || typeof x1 === 'function' ? ctx.xScale : null;
			const scaleY = typeof y1 === 'string' || typeof y1 === 'function' ? ctx.yScale : null;
			const sx = scaleX && sxRaw != null ? scaleX(sxRaw) : typeof sxRaw === 'number' ? sxRaw : 0;
			const sy = scaleY && syRaw != null ? scaleY(syRaw) : typeof syRaw === 'number' ? syRaw : 0;
			const tx = scaleX && txRaw != null ? scaleX(txRaw) : typeof txRaw === 'number' ? txRaw : 0;
			const ty = scaleY && tyRaw != null ? scaleY(tyRaw) : typeof tyRaw === 'number' ? tyRaw : 0;

			return {
				source: {
					x: Number.isFinite(sx) ? sx : 0,
					y: Number.isFinite(sy) ? sy : 0
				},
				target: {
					x: Number.isFinite(tx) ? tx : 0,
					y: Number.isFinite(ty) ? ty : 0
				}
			};
		};

		const singleSourceCoords = $.derived(() => {
			if (isPixelMode()) {
				return {
					x: typeof x1 === 'number' ? x1 : 0,
					y: typeof y1 === 'number' ? y1 : 0
				};
			}

			if (!data) return LINK_FALLBACK_COORDS;

			try {
				const sourceData = sourceAccessor()(data);

				if (sourceData == null) return LINK_FALLBACK_COORDS;

				const xVal = xAccessor()(sourceData);
				const yVal = yAccessor()(sourceData);

				return {
					x: Number.isFinite(xVal) ? xVal : 0,
					y: Number.isFinite(yVal) ? yVal : 0
				};
			} catch(e) {
				console.error('Error accessing source coordinates:', e, 'Data:', data);

				return LINK_FALLBACK_COORDS;
			}
		});

		const singleTargetCoords = $.derived(() => {
			if (isPixelMode()) {
				return {
					x: typeof x2 === 'number' ? x2 : 100,
					y: typeof y2 === 'number' ? y2 : 100
				};
			}

			if (!data) return LINK_FALLBACK_COORDS;

			try {
				const targetData = targetAccessor()(data);

				if (targetData == null) return LINK_FALLBACK_COORDS;

				const xVal = xAccessor()(targetData);
				const yVal = yAccessor()(targetData);

				return {
					x: Number.isFinite(xVal) ? xVal : 0,
					y: Number.isFinite(yVal) ? yVal : 0
				};
			} catch(e) {
				console.error('Error accessing target coordinates:', e, 'Data:', data);

				return LINK_FALLBACK_COORDS;
			}
		});

		function buildPath(source, target) {
			if (pathDataProp) return pathDataProp;

			if (radial()) {
				return type === 'd3'
					? getLinkRadialD3Path({ source, target, curve: curve() })
					: getLinkRadialPresetPath({ source, target, type, radius, bend });
			}

			if (type === 'd3') {
				return getLinkD3Path({
					source,
					target,
					sweep: sweep(),
					curve: curve(),
					orientation: orientation()
				});
			}

			return getLinkPresetPath({ source, target, sweep: sweep(), type, radius, bend });
		}

		const singlePathData = $.derived(() => isArrayMode()
			? ''
			: buildPath(singleSourceCoords(), singleTargetCoords()));

		const extractedTween = extractTweenConfig(motion);

		const tweenOptions = extractedTween
			? {
				type: extractedTween.type,
				options: { interpolate: interpolatePath, ...extractedTween.options }
			}
			: undefined;

		// Pass `tweenOptions` (possibly undefined) so `createMotion` takes its
		// fast-path passthrough when no tween is configured — avoids allocating
		// a MotionNone container + per-instance `$effect` that fires on every
		// x1/y1/x2/y2 change. Critical for force-simulation graphs which can
		// have hundreds of links updating on every tick.
		const motionPath = createMotion('', () => singlePathData(), tweenOptions);

		// Stable getter handed to `<Path>` instead of `motionPath.current`.
		// Reading `motionPath.current` directly in the template would subscribe
		// *this* component's template to per-tick updates, forcing the entire
		// `<Path>` block to re-evaluate (and re-spread props) on every change.
		// By passing a function reference, the per-tick `current` read happens
		// inside `<Path>`'s own template — the parent stays stable.
		const getPathData = () => motionPath.current;

		const arrayRows = $.derived(() => isArrayMode() ? markData(data) : []);

		function resolvePerDatum(value, d) {
			return typeof value === 'function' ? value(d) : value;
		}

		function resolveClass(d) {
			return resolvePerDatum(classProp, d);
		}

		const strokeProp = $.derived(() => restProps.stroke);
		const fillProp = $.derived(() => restProps.fill);
		const strokeWidthProp = $.derived(() => restProps['stroke-width'] ?? restProps.strokeWidth);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (isArrayMode()) {
				$$renderer.push(`<!--[0--><!--[-->`);

				const each_array = $.ensure_array_like(arrayRows());

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let d = each_array[i];
					const { source, target } = resolveArrayCoords(d);
					const resolvedStroke = resolvePerDatum(strokeProp(), d) ?? (ctx.config.c ? ctx.cGet(d) : undefined);

					if (Path) {
						$$renderer.push('<!--[-->');

						Path($$renderer, $.spread_props([
							{
								pathData: buildPath(source, target),
								marker,
								markerStart,
								markerMid,
								markerEnd
							},
							restProps,
							{
								stroke: resolvedStroke,
								fill: resolvePerDatum(fillProp(), d),
								'stroke-width': resolvePerDatum(strokeWidthProp(), d),
								class: cls('lc-link', resolveClass(d))
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

				if (Path) {
					$$renderer.push('<!--[-->');

					Path($$renderer, $.spread_props([
						{
							pathData: getPathData,
							marker,
							markerStart,
							markerMid,
							markerEnd
						},
						restProps,
						{
							class: cls('lc-link', typeof classProp === 'string' ? classProp : undefined),
							get pathRef() {
								return pathRef;
							},

							set pathRef($$value) {
								pathRef = $$value;
								$$settled = false;
							}
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { pathRef });
	});
}