import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';
import { draw as _drawTransition } from 'svelte/transition';
import { cubicInOut } from 'svelte/easing';
import { cls } from '@layerstack/tailwind';
import { createControlledMotion } from '$lib/utils/motion.svelte.js';
import { createId } from '$lib/utils/createId.js';
import Group from '../Group/Group.svelte';
import MarkerWrapper from '../MarkerWrapper.svelte';
import { PathState } from './Path.shared.svelte.js';

export default function Path_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			pathRef = void 0,
			marker,
			markerStart: markerStartProp,
			markerMid: markerMidProp,
			markerEnd: markerEndProp,
			startContent,
			endContent,
			draw,
			motion,
			// Extracted out of `rest` so the `<path>` element's `{...rest}`
			// spread doesn't re-evaluate on every frame in mark-heavy scenes
			// (force-simulation graphs with hundreds of links updating per tick).
			// - `pathData`: changes every frame
			// - `class`: parents typically pass `cls(...)` which produces a new
			//   string reference per parent render
			// - styling props: explicit on the <path> element below, no need to
			//   leak them through the spread
			pathData: _pathData,
			class: classProp,
			fill: fillProp,
			fillOpacity: fillOpacityProp,
			stroke: strokeProp,
			strokeOpacity: strokeOpacityProp,
			strokeWidth: strokeWidthProp,
			opacity: opacityProp,
			$$slots,
			$$events,
			...rest
		} = $$props;

		// Pass `pathData` as its own getter so the hot-path tween read only subscribes
		// to `pathData` (which changes per tick on force sims) and not to every other
		// Path prop. Pre-fix the per-tick `<path d=...>` updater re-read all 15+ props
		// through `getProps()` on each force-sim tick × hundreds of paths.
		const c = new PathState(() => _pathData, () => ({ draw, motion }));

		const markerStart = $.derived(() => markerStartProp ?? marker);
		const markerMid = $.derived(() => markerMidProp ?? marker);
		const markerEnd = $.derived(() => markerEndProp ?? marker);
		const markerStartId = $.derived(() => markerStart() ? createId('marker-start', uid) : '');
		const markerMidId = $.derived(() => markerMid() ? createId('marker-mid', uid) : '');
		const markerEndId = $.derived(() => markerEnd() ? createId('marker-end', uid) : '');
		const drawTransition = $.derived(() => draw ? _drawTransition : () => ({}));
		let startPoint = void 0;

		// Compute the class string here rather than inline in the `class={...}`
		// attribute: a TS cast in markup survives into `dist` and breaks tooling that
		// parses class expressions independently of Svelte (e.g. @unocss/svelte-scoped,
		// whose acorn pass chokes on the `as` keyword).
		const pathClass = $.derived(() => cls('lc-path', classProp));

		const endPointDuration = $.derived(() => {
			if (typeof draw === 'object' && draw.duration !== undefined && typeof draw.duration !== 'function') {
				return draw.duration;
			}

			return 800;
		});

		// Only allocate the controlled motion container when `draw` is configured;
		// otherwise the per-Path `MotionNone` × hundreds of paths was a measurable
		// mount-time cost in mark-heavy scenes.
		const endPoint = draw
			? createControlledMotion(undefined, {
				type: 'tween',
				duration: () => endPointDuration(),
				easing: typeof draw === 'object' && draw.easing ? draw.easing : cubicInOut,
				interpolate() {
					return (t) => {
						const totalLength = pathRef?.getTotalLength() ?? 0;
						const point = pathRef?.getPointAtLength(totalLength * t);

						return point;
					};
				}
			})
			: null;

		// Only set up path-end tracking when startContent/endContent require it.
		if (startContent || endContent) {
			// Track path data changes
		}

		$$renderer.push(`<!---->`);

		{
			$$renderer.push(`<path${$.attributes(
				{
					...rest,
					d: c.tweenedPathData,
					fill: fillProp,
					'fill-opacity': fillOpacityProp,
					stroke: strokeProp,
					'stroke-opacity': strokeOpacityProp,
					'stroke-width': strokeWidthProp,
					opacity: opacityProp,
					class: $.clsx(pathClass()),
					'marker-start': markerStartId() ? `url(#${markerStartId()})` : undefined,
					'marker-mid': markerMidId() ? `url(#${markerMidId()})` : undefined,
					'marker-end': markerEndId() ? `url(#${markerEndId()})` : undefined
				},
				void 0,
				void 0,
				void 0,
				3
			)}></path>`);

			if (markerStart()) {
				$$renderer.push('<!--[0-->');
				MarkerWrapper($$renderer, { id: markerStartId(), marker: markerStart() });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);

			if (markerMid()) {
				$$renderer.push('<!--[0-->');
				MarkerWrapper($$renderer, { id: markerMidId(), marker: markerMid() });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);

			if (markerEnd()) {
				$$renderer.push('<!--[0-->');
				MarkerWrapper($$renderer, { id: markerEndId(), marker: markerEnd() });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);

			if (startContent && startPoint) {
				$$renderer.push('<!--[0-->');

				Group($$renderer, {
					x: startPoint.x,
					y: startPoint.y,
					class: 'lc-path-g-start',
					children: ($$renderer) => {
						startContent($$renderer, {
							point: startPoint,
							value: {
								x: c.chartCtx.xScale?.invert?.(startPoint.x),
								y: c.chartCtx.yScale?.invert?.(startPoint.y)
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);

			if (endContent && endPoint?.current) {
				$$renderer.push('<!--[0-->');

				Group($$renderer, {
					x: endPoint.current.x,
					y: endPoint.current.y,
					class: 'lc-path-g-end',
					children: ($$renderer) => {
						endContent($$renderer, {
							point: endPoint.current,
							value: {
								x: c.chartCtx.xScale?.invert?.(endPoint.current.x),
								y: c.chartCtx.yScale?.invert?.(endPoint.current.y)
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!---->`);
		$.bind_props($$props, { pathRef });
	});
}