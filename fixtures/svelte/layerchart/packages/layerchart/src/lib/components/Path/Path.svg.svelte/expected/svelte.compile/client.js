import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from 'svelte';
import { draw as _drawTransition } from 'svelte/transition';
import { cubicInOut } from 'svelte/easing';
import { cls } from '@layerstack/tailwind';
import { createControlledMotion } from '$lib/utils/motion.svelte.js';
import { createId } from '$lib/utils/createId.js';
import Group from '../Group/Group.svelte';
import MarkerWrapper from '../MarkerWrapper.svelte';
import { PathState } from './Path.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'pathRef',
	'marker',
	'markerStart',
	'markerMid',
	'markerEnd',
	'startContent',
	'endContent',
	'draw',
	'motion',
	'pathData',
	'class',
	'fill',
	'fillOpacity',
	'stroke',
	'strokeOpacity',
	'strokeWidth',
	'opacity'
]);

var root = $.from_svg(`<path></path><!><!><!><!><!>`, 1);

export default function Path_svg($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let pathRef = $.prop($$props, 'pathRef', 15),
		// Extracted out of `rest` so the `<path>` element's `{...rest}`
		// spread doesn't re-evaluate on every frame in mark-heavy scenes
		// (force-simulation graphs with hundreds of links updating per tick).
		// - `pathData`: changes every frame
		// - `class`: parents typically pass `cls(...)` which produces a new
		//   string reference per parent render
		// - styling props: explicit on the <path> element below, no need to
		//   leak them through the spread
		rest = $.rest_props($$props, rest_excludes);

	// Pass `pathData` as its own getter so the hot-path tween read only subscribes
	// to `pathData` (which changes per tick on force sims) and not to every other
	// Path prop. Pre-fix the per-tick `<path d=...>` updater re-read all 15+ props
	// through `getProps()` on each force-sim tick × hundreds of paths.
	const c = new PathState(() => $$props.pathData, () => ({ draw: $$props.draw, motion: $$props.motion }));

	const markerStart = $.derived(() => $$props.markerStart ?? $$props.marker);
	const markerMid = $.derived(() => $$props.markerMid ?? $$props.marker);
	const markerEnd = $.derived(() => $$props.markerEnd ?? $$props.marker);
	const markerStartId = $.derived(() => $.get(markerStart) ? createId('marker-start', uid) : '');
	const markerMidId = $.derived(() => $.get(markerMid) ? createId('marker-mid', uid) : '');
	const markerEndId = $.derived(() => $.get(markerEnd) ? createId('marker-end', uid) : '');
	const drawTransition = $.derived(() => $$props.draw ? _drawTransition : () => ({}));
	let startPoint = $.state(void 0);

	// Compute the class string here rather than inline in the `class={...}`
	// attribute: a TS cast in markup survives into `dist` and breaks tooling that
	// parses class expressions independently of Svelte (e.g. @unocss/svelte-scoped,
	// whose acorn pass chokes on the `as` keyword).
	const pathClass = $.derived(() => cls('lc-path', $$props.class));

	const endPointDuration = $.derived(() => {
		if (typeof $$props.draw === 'object' && $$props.draw.duration !== undefined && typeof $$props.draw.duration !== 'function') {
			return $$props.draw.duration;
		}

		return 800;
	});

	// Only allocate the controlled motion container when `draw` is configured;
	// otherwise the per-Path `MotionNone` × hundreds of paths was a measurable
	// mount-time cost in mark-heavy scenes.
	const endPoint = $$props.draw
		? createControlledMotion(undefined, {
			type: 'tween',
			duration: () => $.get(endPointDuration),
			easing: typeof $$props.draw === 'object' && $$props.draw.easing ? $$props.draw.easing : cubicInOut,
			interpolate() {
				return (t) => {
					const totalLength = pathRef()?.getTotalLength() ?? 0;
					const point = pathRef()?.getPointAtLength(totalLength * t);

					return point;
				};
			}
		})
		: null;

	// Only set up path-end tracking when startContent/endContent require it.
	if ($$props.startContent || $$props.endContent) {
		$.user_effect(() => {
			// Track path data changes
			void c.tweenedPathData;

			if (!pathRef()) return;

			tick().then(() => {
				if (!pathRef()) return;

				const totalLength = pathRef().getTotalLength();

				if (!totalLength) return;

				$.set(startPoint, pathRef().getPointAtLength(0), true);

				if (endPoint) {
					endPoint.target = pathRef().getPointAtLength(totalLength);
				}
			});
		});
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, () => c.drawKey, ($$anchor) => {
		var fragment_1 = root();
		var path = $.first_child(fragment_1);

		$.attribute_effect(path, () => ({
			...rest,
			d: c.tweenedPathData,
			fill: $$props.fill,
			'fill-opacity': $$props.fillOpacity,
			stroke: $$props.stroke,
			'stroke-opacity': $$props.strokeOpacity,
			'stroke-width': $$props.strokeWidth,
			opacity: $$props.opacity,
			class: $.get(pathClass),
			'marker-start': $.get(markerStartId) ? `url(#${$.get(markerStartId)})` : undefined,
			'marker-mid': $.get(markerMidId) ? `url(#${$.get(markerMidId)})` : undefined,
			'marker-end': $.get(markerEndId) ? `url(#${$.get(markerEndId)})` : undefined
		}));

		$.bind_this(path, ($$value) => pathRef($$value), () => pathRef());

		var node_1 = $.sibling(path);

		{
			var consequent = ($$anchor) => {
				MarkerWrapper($$anchor, {
					get id() {
						return $.get(markerStartId);
					},

					get marker() {
						return $.get(markerStart);
					}
				});
			};

			$.if(node_1, ($$render) => {
				if ($.get(markerStart)) $$render(consequent);
			});
		}

		var node_2 = $.sibling(node_1);

		{
			var consequent_1 = ($$anchor) => {
				MarkerWrapper($$anchor, {
					get id() {
						return $.get(markerMidId);
					},

					get marker() {
						return $.get(markerMid);
					}
				});
			};

			$.if(node_2, ($$render) => {
				if ($.get(markerMid)) $$render(consequent_1);
			});
		}

		var node_3 = $.sibling(node_2);

		{
			var consequent_2 = ($$anchor) => {
				MarkerWrapper($$anchor, {
					get id() {
						return $.get(markerEndId);
					},

					get marker() {
						return $.get(markerEnd);
					}
				});
			};

			$.if(node_3, ($$render) => {
				if ($.get(markerEnd)) $$render(consequent_2);
			});
		}

		var node_4 = $.sibling(node_3);

		{
			var consequent_3 = ($$anchor) => {
				Group($$anchor, {
					get x() {
						return $.get(startPoint).x;
					},

					get y() {
						return $.get(startPoint).y;
					},
					class: 'lc-path-g-start',
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = $.comment();
						var node_5 = $.first_child(fragment_6);

						{
							let $0 = $.derived(() => ({
								point: $.get(startPoint),
								value: {
									x: c.chartCtx.xScale?.invert?.($.get(startPoint).x),
									y: c.chartCtx.yScale?.invert?.($.get(startPoint).y)
								}
							}));

							$.snippet(node_5, () => $$props.startContent, () => $.get($0));
						}

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			};

			$.if(node_4, ($$render) => {
				if ($$props.startContent && $.get(startPoint)) $$render(consequent_3);
			});
		}

		var node_6 = $.sibling(node_4);

		{
			var consequent_4 = ($$anchor) => {
				Group($$anchor, {
					get x() {
						return endPoint.current.x;
					},

					get y() {
						return endPoint.current.y;
					},
					class: 'lc-path-g-end',
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = $.comment();
						var node_7 = $.first_child(fragment_8);

						{
							let $0 = $.derived(() => ({
								point: endPoint.current,
								value: {
									x: c.chartCtx.xScale?.invert?.(endPoint.current.x),
									y: c.chartCtx.yScale?.invert?.(endPoint.current.y)
								}
							}));

							$.snippet(node_7, () => $$props.endContent, () => $.get($0));
						}

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			};

			$.if(node_6, ($$render) => {
				if ($$props.endContent && endPoint?.current) $$render(consequent_4);
			});
		}

		$.transition(5, path, () => $.get(drawTransition), () => typeof $$props.draw === 'object' ? $$props.draw : undefined);
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}